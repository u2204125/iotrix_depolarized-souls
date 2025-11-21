import cv2
import json

# Load trained model
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read("lbph_model.yml")

# Load label map
with open("labels.json", "r") as f:
    labels = json.load(f)

# Reverse labels: {id: name}
labels_rev = {v: k for k, v in labels.items()}

# Load Haarcascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

cap = cv2.VideoCapture(0)   # Webcam

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.2, 5)

    for (x, y, w, h) in faces:
        roi = gray[y:y+h, x:x+w]

        label_id, confidence = recognizer.predict(roi)

        # Smaller confidence = better match
        if confidence < 55:
            name = labels_rev[label_id]
            text = f"{name} ({confidence:.2f})"
        else:
            text = "UNKNOWN"

        cv2.rectangle(frame, (x,y), (x+w, y+h), (0,255,0), 2)
        cv2.putText(frame, text, (x, y-10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.9, (0,255,0), 2)

    cv2.imshow("Face Recognition", frame)

    if cv2.waitKey(1) == 27:  # ESC to exit
        break

cap.release()
cv2.destroyAllWindows()
