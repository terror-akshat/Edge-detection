# 🧪 Android + OpenCV-C++ + OpenGL Assessment + Web — Flam-Assessment 

> **Real-Time Edge Detection Viewer** - A complete implementation showcasing Android development, OpenCV C++ integration, OpenGL ES rendering, and TypeScript web viewer.

## Demo Video

```

```

## 🎯 Overview

EdgeViewer is an Android + native hybrid app that:  
- Captures live camera frames using the **Camera2 API**  
- Processes them using **native C++ (OpenCV)** for **edge detection**  
- Displays output in real-time using **OpenGL ES 2.0**.
- Supports toggling between **Raw** and **Edge-detected** views  
- Exposes a lightweight **TypeScript Web Viewer** for static visualization

---

## ✨ Features Implemented

### Android Application 
- 📸 **Camera2 Preview** | High-performance camera feed using Camera2 API |
- 🧩 **OpenCV Integration (JNI)** | Native C++ edge detection using OpenCV |
- 🎨 **OpenGL ES Renderer** | Real-time texture rendering for camera frames |
- 🔄 **Raw / Edge Toggle** | Switch between normal feed and edge-highlighted frames |
- ⚡ **FPS Counter** | Live frame rate monitoring |
- 🌐 **TypeScript Web Viewer** | Simple front-end to visualize frames or mock data

### Web Viewer Setup

1. **Navigate to web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build TypeScript**:
   ```bash
   npm run build
   ```

4. **Start server**:
   ```bash
   npm run serve
   ```

5. **Open browser**:
   ```
   http://localhost:8080
   ```
---

## 📐 Architecture 

```
┌────────────────────────┐
│     Android App        │
│ (Kotlin + Camera2 API) │
└─────────────┬──────────┘
              │ ByteArray (YUV)
              ▼
      ┌─────────────────┐
      │     JNI Layer   │
      └─────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│    C++ Native Layer (jni/)       │
│  OpenCV Edge Detection + OpenGL  │
└─────────────────┬────────────────┘
                  │ Texture ID
                  ▼
        ┌────────────────────┐
        │ GLSurfaceView (app)│
        └────────────────────┘
                  │
                  ▼
           Final Output (Device)
```

---

## 🛠 Tech Stack

### Android
- **Language**: Kotlin
- **Build System**: Gradle with Kotlin DSL
- **NDK**: Native Development Kit
- **JNI**: Java Native Interface
- **Camera**: Camera2 API
- **Rendering**: OpenGL ES 2.0+

### Native C++
- **OpenCV**: Image processing library
- **CMake**: Build configuration
- **JNI**: Native method implementation

### Web

---

## 📁 Project Structure
```
Edge-detection/
├── app/                                    # Android Application Module (Kotlin)
│   ├── src/main/
│   │   ├── AndroidManifest.xml             # App permissions, camera feature, activity declaration
│   │   ├── java/com/example/edgeviewer/
│   │   │   ├── MainActivity.kt             # Entry point, UI setup, JNI calls
│   │   │   ├── CameraController.kt         # Camera2 API setup, ImageReader, frame capture
│   │   │   ├── GLTextureRenderer.kt        # GLSurfaceView renderer for OpenGL textures
│   │   │   └── Utils.kt                    # Helper functions (optional)
│   │   └── res/
│   │       ├── layout/activity_main.xml    # UI layout (TextureView, GLSurfaceView, Buttons)
│   │       └── values/strings.xml          # App strings & resources
│   ├── build.gradle                        # Android Gradle config (NDK, OpenCV, externalNativeBuild)
│   └── CMakeLists.txt                      # Connects Android module to native C++ build
│
├── jni/                                    # Native C++ Module (OpenCV + OpenGL)
│   ├── native-lib.cpp                      # JNI bridge (Kotlin ↔ C++)
│   ├── ImageProcessor.cpp                  # Core image processing (OpenCV, texture upload)
│   ├── ImageProcessor.h                    # Header for ImageProcessor (class definitions)
│   └── CMakeLists.txt                      # Build rules, OpenCV linking, GLES linking
│
├── gl/                                     # Graphics Module (Shaders)
│   └── shaders/
│       ├── vertex.glsl                     # Vertex shader (handles quad, positions)
│       └── fragment.glsl                   # Fragment shader (renders processed RGBA texture)
│
├── opencv/                                 # OpenCV Android SDK (native libs + includes)
│                                            # Contains OpenCV .so libraries, header files, configs
│
├── README.md                                # Project overview, setup steps, architecture details
├── .gitignore                               # Ignore build folders, Gradle, .idea, native libs
└── LICENSE                                  # License for open-source submission

```
## 📦 Setup Instructions

### 1️⃣ Clone the Repository

```
git clone https://github.com/terror-akshat/Edge-detection.git
cd Edge-detection
```
---

### 2️⃣ Download & Install OpenCV Android SDK
> **Download OpenCV:
#### > **Download OpenCV-android-sdk.zip from the official OpenCV website.
#### > **Extract it:
> **Unzip and place the folder inside project root:
```
Edge-detection/opencv/
opencv/
 └── sdk/
     └── native/
         ├── jni/
         ├── libs/
         └── include/
```
---

### 3️⃣ Enable NDK Support in Android Studio

- Open Android Studio
-Go to:
-File → Settings → SDK Manager → SDK Tools
-Enable:  
 - NDK (Side-by-Side)
 - CMake
 - LLDB
- Click Apply

---

### 5️⃣ Configure CMakeLists.txt
> ** Make sure your jni/CMakeLists.txt contains:

```
set(OpenCV_DIR ${CMAKE_SOURCE_DIR}/../opencv/sdk/native/jni)
find_package(OpenCV REQUIRED)

target_link_libraries(
    edge_native
    ${OpenCV_LIBS}
    log
    GLESv2
)
```
### 6️⃣ Configure app/build.gradle
> ** Inside the android block:
```
externalNativeBuild {
    cmake {
        path "../jni/CMakeLists.txt"
        version "3.10.2"   // or your installed version
    }
}
```
---

### 8️⃣ Connect a Physical Android Device
- Enable Developer Options
- Enable USB Debugging
- Connect your device via USB (or wireless debugging)
- Select device in Android Studio
- Press Run (▶)
---

### 🔟 Running the App
Once launched:
- Camera preview starts immediately
- FPS counter updates live
---

