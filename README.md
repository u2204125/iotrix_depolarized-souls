# Iotrix Final

Short description: Iotrix is a Next.js dashboard and student portal project used for demonstration and internal use. This repository contains the app source, small tooling, and development configurations.

**Status:** Work in progress — this repo is prepared for public hosting by documenting structure and adding ignores for secrets.

**Quick Start**
- Install dependencies: `pnpm install`
- Run dev server: `pnpm run dev`
- Build: `pnpm run build`

**What to Keep In The Repo (required files)**
- `package.json` — project manifest
- `pnpm-lock.yaml` — lockfile for reproducible installs
- `app/` — application source (Next.js app directory)
- `postcss.config.cjs`, `tailwind.config.js` — build / styling config
- `db_schema.json`, `tasks.md`, documentation files describing the project
 - `hardware/` — embedded device firmware and wiring notes (ESP32-CAM example)

**Secrets & Local Files (do NOT commit)**
The repository previously contained credentials and exported datasets. Those should be removed from version control and replaced with environment-driven configuration. Ensure the following (or similar) files are NOT committed:
- `iotrix-final-firebase-adminsdk-fbsvc-6e07edd126.json` (Firebase admin service account)
- `firebaseConfig.js` (Firebase config with API keys)
- `student_data.json` (exported student datasets)
- Any `.env`, `.env.local`, or secret files

These are listed in `.gitignore` and should be removed from the repo history if they were previously committed.

**Contributing**
Please read `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before opening issues or PRs. Use the provided GitHub issue and PR templates for reporting bugs or requesting changes.

**Next steps (recommended)**
- Add a `LICENSE` file (e.g., MIT) if you intend to make this public.
- Rotate any credentials that were committed in the past and remove them from history (use `git rm --cached <file>` and consider `git filter-repo` or BFG to scrub history).
- Add CI (GitHub Actions) for linting and tests.

**Hardware**

This repository now includes a basic embedded firmware example for an ESP32-CAM-based security device located at `hardware/device.ino`.

What it is:
- Board: AI-Thinker ESP32-CAM (uses the `esp_camera` driver)
- Features: PIR motion sensor trigger, MFRC522 RFID reader, SSD1306 OLED display, camera capture + WiFi upload placeholder
- Important pins and wiring are documented inside `hardware/device.ino` (shared I2C/SPI pins and camera pin mapping)

Build & deploy (quick):
- Arduino IDE: install the "ESP32 by Espressif Systems" board support, open `hardware/device.ino`, select the AI-Thinker ESP32-CAM board, set correct COM/USB port, and upload.
- PlatformIO: create a project for `esp32`/`esp32cam` and add the listed libraries (`MFRC522`, `Adafruit SSD1306`, `Adafruit GFX`, etc.) to `platformio.ini` dependencies.

Configuration:
- Edit the `ssid` and `password` constants at the top of `hardware/device.ino` before building.
- Verify wiring for RC522, SSD1306 and PIR sensor; note the code multiplexes shared pins for I2C and SPI — follow the pin comments in the source.

Security note:
- Do not commit device secrets or production Wi‑Fi credentials. Keep any production credentials out of source control and use a secure provisioning flow.

**Machine Learning (Face Detection)**

This repository includes a simple desktop/edge face-recognition example using OpenCV located at `realtime.py`.

What it is:
- Script: `realtime.py` — runs a webcam face recognition loop using OpenCV's LBPH recognizer and Haar cascade detector.
- Model files expected in repo root: `lbph_model.yml` (trained LBPH model) and `labels.json` (mapping between label ids and names).

Dependencies (Python):
- Python 3.8+ recommended
- `opencv-python` and `opencv-contrib-python` (contrib package provides `cv2.face`), e.g.:

```bash
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install opencv-python opencv-contrib-python
```

Running the example:
- Place your trained `lbph_model.yml` and `labels.json` in the repository root.
- Start the script with a connected webcam: `python realtime.py`.
- The script shows a window labelled "Face Recognition" — press ESC to exit.

Notes on training and files:
- `lbph_model.yml` is a binary model produced by OpenCV's LBPH trainer; it may contain personally identifiable information (face representations). Do not commit raw face image datasets or private models to a public repository.
- `labels.json` maps training labels to human-readable names. Example format: `{ "alice": 0, "bob": 1 }`.
- The script uses OpenCV's Haar cascade bundled with OpenCV (`cv2.data.haarcascades`). No additional cascade file is required unless you want a custom detector.

Privacy & compliance:
- Face recognition carries privacy and legal considerations. Ensure you have explicit consent from individuals before collecting or storing biometric data.
- For public repositories, remove or avoid committing models and datasets containing biometric data. Prefer a private model store or CI/CD secret management for production artifacts.

