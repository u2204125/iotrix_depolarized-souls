import os
import numpy as np
import cv2
from PIL import Image
from sklearn.neighbors import KNeighborsClassifier
import mediapipe as mp
import joblib
import json
from pathlib import Path

mp_face = mp.solutions.face_mesh

def extract_embedding(img):
    with mp_face.FaceMesh(static_image_mode=True, max_num_faces=1,
                          refine_landmarks=True, min_detection_confidence=0.5) as face_mesh:
        results = face_mesh.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        if not results.multi_face_landmarks:
            return None

        lm = results.multi_face_landmarks[0]
        coords = []
        for p in lm.landmark:
            coords.extend([p.x, p.y, p.z])
        vec = np.array(coords)
        vec = vec / np.linalg.norm(vec)
        return vec

def load_dataset(root):
    X, y = [], []
    root = Path(root)
    for person in root.iterdir():
        if not person.is_dir():
            continue
        name = person.name
        print("Processing:", name)
        for img_path in person.glob("*.*"):
            img = cv2.imread(str(img_path))
            if img is None:
                continue
            emb = extract_embedding(img)
            if emb is not None:
                X.append(emb)
                y.append(name)
    return np.array(X), np.array(y)

root = "augmented_dataset"
print("Loading dataset...")
X, y = load_dataset(root)

print("Training KNN...")
knn = KNeighborsClassifier(n_neighbors=3, metric='cosine')
knn.fit(X, y)

os.makedirs("model_mp", exist_ok=True)
joblib.dump(knn, "model_mp/knn.pkl")
np.save("model_mp/X.npy", X)
np.save("model_mp/y.npy", y)

print("Saved model to model_mp/")
