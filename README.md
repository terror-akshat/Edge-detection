# 🧠 EdgeViewer  
**Software Engineering Intern (R&D) Assignment — Adobe**

A real-time **Camera2 + OpenGL + OpenCV + JNI** pipeline for edge detection and rendering on Android, with a lightweight **TypeScript Web Viewer** demo.

---

## 🚀 Overview

EdgeViewer is an Android + native hybrid app that:  

- Captures live camera frames using the **Camera2 API**  
- Processes them using **native C++ (OpenCV)** for **edge detection**  
- Displays output in real-time using **OpenGL ES 2.0** for GPU rendering  
- Supports toggling between **Raw** and **Edge-detected** views  
- Exposes a lightweight **TypeScript Web Viewer** for static visualization  

---

## ✨ Features Implemented

| Feature | Description |
|---------|-------------|
| 📸 **Camera2 Preview** | High-performance camera feed using Camera2 API |
| 🧩 **OpenCV Integration (JNI)** | Native C++ edge detection using OpenCV |
| 🎨 **OpenGL ES Renderer** | Real-time texture rendering for camera frames |
| 🔄 **Raw / Edge Toggle** | Switch between normal feed and edge-highlighted frames |
| ⚡ **FPS Counter** | Live frame rate monitoring |
| 🌐 **TypeScript Web Viewer** | Simple front-end to visualize frames or mock data |

---

## 🏗 Architecture

```
Edge-detection
├─ app/
│ ├─ src/main/
│ │ ├─ AndroidManifest.xml
│ │ ├─ java/com/example/edgeviewer/
│ │ │ ├─ MainActivity.kt
│ │ │ ├─ CameraController.kt
│ │ │ ├─ GLTextureRenderer.kt
│ │ │ └─ Utils.kt
│ │ └─ res/
│ │ ├─ layout/activity_main.xml
│ │ └─ values/strings.xml
│ ├─ build.gradle
│ └─ CMakeLists.txt
├─ jni/
│ ├─ native-lib.cpp
│ ├─ ImageProcessor.cpp
│ ├─ ImageProcessor.h
│ └─ CMakeLists.txt
├─ gl/
│ └─ shaders/
│ ├─ vertex.glsl
│ └─ fragment.glsl
├─ opencv/
├─ README.md
├─ .gitignore
└─ LICENSE
```

## ⚙ Setup Instructions

### 🔹 Android (Native)

- Open in Android Studio  
- Make sure **NDK** and **CMake** are installed (SDK Tools → NDK & CMake)  
- Sync Gradle  
- Add OpenCV SDK:  
  - Copy OpenCV Android SDK to `app/src/main/jniLibs/`  
  - Update `CMakeLists.txt` to link `opencv_java4`  
- Build and Run:  
  - Connect your Android device  
  - Press ▶ Run  
  - Allow camera permissions when prompted  

## 📸 Video which show the Real time rendering the image form phycial device with FPS

https://drive.google.com/file/d/1i7UA0GjRBK5bIRxcdEsRnpJYTB8xcJD2/view?usp=drive_link

## 🛠 Tech Stack

### Android
- **Language:** Kotlin  
- **Camera:** Camera2 API for live camera feed  
- **Rendering:** OpenGL ES 2.0 for GPU-accelerated frame display  

### Native / C++
- **Language:** C++ via JNI  
- **Computer Vision:** OpenCV for edge detection  
- **Integration:** JNI bridge between Kotlin and C++  



