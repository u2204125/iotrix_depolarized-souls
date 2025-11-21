# train_facenet.py
# Usage: python train_facenet.py --data ./augmented_dataset --out models --min-per-person 10

import os, argparse, json
from pathlib import Path
import numpy as np
from PIL import Image
from tqdm import tqdm
from sklearn.neighbors import KNeighborsClassifier
import joblib
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1

def load_image(path):
    return Image.open(path).convert("RGB")

def extract_embeddings(dataset_dir, device='cpu', mtcnn=None, model=None, max_per_person=None):
    embeddings = []
    labels = []
    people = sorted([p for p in Path(dataset_dir).iterdir() if p.is_dir()])
    for person in people:
        img_files = sorted([p for p in person.glob("*.*")])
        if max_per_person:
            img_files = img_files[:max_per_person]
        if len(img_files)==0:
            continue
        for imgf in tqdm(img_files, desc=f"Extract {person.name}", leave=False):
            try:
                img = load_image(imgf)
            except Exception:
                continue
            # mtcnn returns cropped, prewhitened torch tensor of shape [3,160,160]
            face = mtcnn(img)
            if face is None:
                continue
            with torch.no_grad():
                emb = model(face.unsqueeze(0).to(device)).cpu().numpy()[0]
            emb = emb / np.linalg.norm(emb)
            embeddings.append(emb)
            labels.append(person.name)
    return np.array(embeddings), np.array(labels)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--data', type=str, default='./augmented_dataset')
    parser.add_argument('--out', type=str, default='./models')
    parser.add_argument('--device', type=str, default='cpu')
    parser.add_argument('--k', type=int, default=3)  # k for kNN
    parser.add_argument('--max_per_person', type=int, default=None)
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)
    device = torch.device(args.device if torch.cuda.is_available() else 'cpu')

    print("Initializing MTCNN and FaceNet (InceptionResnetV1)...")
    mtcnn = MTCNN(image_size=160, margin=0, device=device)
    model = InceptionResnetV1(pretrained='vggface2').eval().to(device)

    print("Extracting embeddings (this may take a few minutes)...")
    X, y = extract_embeddings(args.data, device=device, mtcnn=mtcnn, model=model, max_per_person=args.max_per_person)

    print(f"Total embeddings: {len(X)}")
    if len(X) == 0:
        raise SystemExit("No embeddings extracted — check dataset and MTCNN detection")

    # train k-NN classifier on normalized embeddings
    knn = KNeighborsClassifier(n_neighbors=args.k, metric='cosine')
    knn.fit(X, y)

    # save models
    joblib.dump(knn, os.path.join(args.out, 'knn_facenet.joblib'))
    np.save(os.path.join(args.out, 'embeddings.npy'), X)
    np.save(os.path.join(args.out, 'labels.npy'), y)
    print("Saved classifier and embeddings to", args.out)

    # create prototypes (mean embedding per person) for fast cosine matching also
    prototypes = {}
    unique = sorted(list(set(y)))
    for u in unique:
        prototypes[u] = X[y==u].mean(axis=0).tolist()
    with open(os.path.join(args.out,'prototypes.json'),'w') as f:
        json.dump(prototypes,f,indent=2)
    print("Saved prototypes.json")

if __name__ == '__main__':
    main()
