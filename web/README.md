# 🌐 OpenCV Web Viewer - TypeScript Implementation

> A minimal TypeScript web viewer for displaying real-time processed frames from the Android OpenCV application.

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Setup Instructions](#-setup-instructions)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Future Enhancements](#-future-enhancements)

---

## ✨ Features

### Implemented Features ✅
- **Real-time Frame Display**: Canvas-based rendering of processed frames
- **Processing Modes**: Support for Raw Feed, Edge Detection, and Grayscale
- **Live Statistics**:
  - FPS (Frames Per Second) counter
  - Resolution display (640x480)
  - Processing time tracking
  - Frame count
  - Application status
  - Connection status
- **Demo Playback**: 
  - Play/Pause/Reset controls
  - Adjustable FPS (1-30 FPS)
  - Auto-cycling through demo frames
- **WebSocket Ready**: 
  - Connection management
  - Auto-reconnection logic
  - Real-time message handling
- **Responsive Design**: Mobile-friendly UI with modern dark theme
- **Interactive Controls**: Mode switching, playback controls, connection settings

---

## 🛠 Tech Stack

- **TypeScript 5.3.3**: Type-safe JavaScript with ES2020 modules
- **HTML5 Canvas**: Hardware-accelerated rendering
- **CSS3**: Modern styling with flexbox/grid layouts
- **WebSocket API**: Real-time communication support
- **http-server**: Lightweight development server

---

## 📐 Architecture

### Data Flow

```
Android App → WebSocket → Web Viewer
     ↓                         ↓
  Camera              Frame Renderer
     ↓                         ↓
JNI Bridge           Stats Display
     ↓                         ↓
OpenCV C++            UI Updates
     ↓
OpenGL ES
```

### Component Architecture

```
app.ts (Main Entry Point)
  ├── frameRenderer.ts (Canvas Rendering)
  ├── statsDisplay.ts (Statistics Management)
  ├── websocketClient.ts (Network Communication)
  ├── demoData.ts (Sample Frames)
  └── types.ts (Type Definitions)
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile TypeScript**:
   ```bash
   npm run build
   ```

4. **Start development server**:
   ```bash
   npm run serve
   ```

5. **Open in browser**:
   ```
   http://localhost:8080
   ```

### Alternative: Development Mode

For automatic recompilation on file changes:
```bash
npm run watch
```

In a separate terminal:
```bash
npm run serve
```

---

## 📖 Usage

### Demo Mode

1. **Select Processing Mode**: Click on Raw Feed, Edge Detection, or Grayscale buttons
2. **Start Playback**: Click the "▶️ Play Demo" button
3. **Adjust FPS**: Use the slider to change target FPS (1-30)
4. **Pause/Reset**: Control playback with Pause and Reset buttons

### WebSocket Mode (Real-time)

1. **Configure URL**: Enter WebSocket server URL (default: `ws://localhost:8765`)
2. **Connect**: Click "Connect" button
3. **Receive Frames**: Frames will be displayed automatically when received from Android app

### Statistics Monitoring

Real-time metrics are displayed in the Stats Panel:
- **FPS**: Current frames per second
- **Resolution**: Frame dimensions
- **Processing Time**: Time taken to process each frame
- **Frame Count**: Total frames processed
- **Status**: Application state (Idle/Active/Paused)
- **Connection**: WebSocket connection status

---

## 📁 Project Structure

```
web/
├── src/
│   ├── app.ts              # Main application entry point
│   ├── frameRenderer.ts    # Canvas rendering logic
│   ├── statsDisplay.ts     # Statistics management
│   ├── websocketClient.ts  # WebSocket communication
│   ├── demoData.ts         # Sample demo frames
│   └── types.ts            # TypeScript type definitions
├── dist/                   # Compiled JavaScript (generated)
├── index.html              # Main HTML structure
├── styles.css              # Application styling
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

---

## 🔌 API Documentation

### WebSocket Message Format

#### Frame Message
```typescript
{
  type: 'frame',
  payload: {
    imageData: string,      // Base64 encoded image
    width: number,          // Frame width
    height: number,         // Frame height
    mode: 'raw'|'edge'|'gray',
    timestamp: number,      // Capture timestamp
    processingTime: number  // Processing duration (ms)
  },
  timestamp: number
}
```

#### Stats Message
```typescript
{
  type: 'stats',
  payload: {
    fps: number,
    resolution: string,
    processingTime: number,
    frameCount: number,
    status: 'idle'|'active'|'paused'|'error',
    connectionStatus: 'connected'|'disconnected'
  },
  timestamp: number
}
```

---

## 🎯 Future Enhancements

### Planned Features
- [ ] HTTP REST API endpoint for frame uploads
- [ ] Frame history with timeline scrubbing
- [ ] Performance graphs and charts
- [ ] Export frames as PNG/JPEG
- [ ] Multi-camera support
- [ ] Recording and playback
- [ ] Advanced filters and effects
- [ ] Mobile app integration
- [ ] Cloud storage integration
- [ ] Machine learning model visualization

### Optimization Opportunities
- [ ] WebGL rendering for better performance
- [ ] Web Workers for parallel processing
- [ ] IndexedDB for frame caching
- [ ] Service Worker for offline support
- [ ] Progressive Web App (PWA) features

---

## 🐛 Troubleshooting

### Common Issues

**TypeScript compilation errors**:
```bash
npm run clean
npm run build
```

**Server not starting**:
```bash
# Check if port 8080 is available
netstat -ano | findstr :8080

# Use different port
http-server ./ -p 8081
```

**WebSocket connection failed**:
- Verify Android app is running
- Check WebSocket server URL
- Ensure network connectivity
- Check firewall settings

---

## 📊 Performance Metrics

- **Target FPS**: 10-15 FPS minimum (configurable up to 30 FPS)
- **Frame Latency**: < 100ms (demo mode)
- **Memory Usage**: < 50MB
- **Canvas Resolution**: 640x480 (scalable)

---

## 📝 Development Notes

### Build Process
1. TypeScript files in `src/` are compiled to ES2020 modules
2. Output is placed in `dist/` directory
3. Source maps are generated for debugging
4. Type declarations (.d.ts) are created for library usage

### Coding Standards
- Strict TypeScript mode enabled
- No unused variables/parameters allowed
- Comprehensive type definitions
- Modular architecture
- Clean separation of concerns

---

## 👥 Contributing

This is an assessment project. For production use:
1. Fork the repository
2. Create feature branch
3. Commit changes with descriptive messages
4. Push to branch
5. Create Pull Request

---

## 📄 License

MIT License - Free to use for educational and commercial purposes

---

## 🙏 Acknowledgments

- OpenCV library for image processing
- TypeScript team for excellent tooling
- Modern web standards for Canvas API
- Assessment requirements for project scope

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify all dependencies are installed
- Review TypeScript compilation output
- Ensure server is running on correct port

---

**Built with ❤️ for the RnD Intern Assessment**

*Camera → JNI → C++ → OpenGL → Web*
