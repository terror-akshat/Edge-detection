package com.example.edgeviewer

import android.content.Context
import android.graphics.ImageFormat
import android.hardware.camera2.*
import android.media.ImageReader
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import android.util.Range
import android.view.Surface
import android.view.WindowManager

object CameraController {
    private var cameraDevice: CameraDevice? = null
    private var captureSession: CameraCaptureSession? = null
    private var handlerThread: HandlerThread? = null
    private var handler: Handler? = null
    private var imageReader: ImageReader? = null

    fun startCamera(
        context: Context,
        previewSurface: Surface,
        onFrame: (ByteArray, Int, Int, Long) -> Unit
    ) {
        val manager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        val cameraId = manager.cameraIdList.firstOrNull() ?: return

        handlerThread = HandlerThread("CameraThread").also { it.start() }
        handler = Handler(handlerThread!!.looper)

        imageReader = ImageReader.newInstance(1280, 720, ImageFormat.YUV_420_888, 2).apply {
            setOnImageAvailableListener({ reader ->
                val image = reader.acquireLatestImage() ?: return@setOnImageAvailableListener
                val plane = image.planes[0]
                val buffer = plane.buffer
                val bytes = ByteArray(buffer.remaining())
                buffer.get(bytes)
                onFrame(bytes, image.width, image.height, image.timestamp)
                image.close()
            }, handler)
        }

        val stateCallback = object : CameraDevice.StateCallback() {
            override fun onOpened(camera: CameraDevice) {
                Log.d("CameraController", "Camera opened ✅")
                cameraDevice = camera
                val imageReaderSurface = imageReader!!.surface

                // Determine correct preview rotation
                val characteristics = manager.getCameraCharacteristics(cameraId)
                val sensorOrientation = characteristics.get(CameraCharacteristics.SENSOR_ORIENTATION) ?: 90

                val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
                val deviceRotation = windowManager.defaultDisplay.rotation
                val rotationDegrees = when (deviceRotation) {
                    Surface.ROTATION_0 -> 0
                    Surface.ROTATION_90 -> 90
                    Surface.ROTATION_180 -> 180
                    Surface.ROTATION_270 -> 270
                    else -> 0
                }

                val totalRotation = (sensorOrientation - rotationDegrees + 360) % 360
                Log.d("CameraController", "Sensor=$sensorOrientation, Device=$rotationDegrees, total=$totalRotation")

                val requestBuilder = camera.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW)
                requestBuilder.addTarget(previewSurface)
                requestBuilder.addTarget(imageReaderSurface)

                try {
                    requestBuilder.set(CaptureRequest.CONTROL_AE_TARGET_FPS_RANGE, Range(30, 30))
                } catch (_: Exception) {}

                camera.createCaptureSession(listOf(previewSurface, imageReaderSurface),
                    object : CameraCaptureSession.StateCallback() {
                        override fun onConfigured(session: CameraCaptureSession) {
                            captureSession = session
                            requestBuilder.set(CaptureRequest.CONTROL_MODE, CameraMetadata.CONTROL_MODE_AUTO)
                            session.setRepeatingRequest(requestBuilder.build(), null, handler)
                            Log.d("CameraController", "Preview started 🎥 (Rotation: $totalRotation°)")
                        }

                        override fun onConfigureFailed(session: CameraCaptureSession) {
                            Log.e("CameraController", "Failed to start preview ❌")
                        }
                    }, handler)
            }

            override fun onDisconnected(camera: CameraDevice) {
                camera.close()
                cameraDevice = null
            }

            override fun onError(camera: CameraDevice, error: Int) {
                Log.e("CameraController", "Camera error: $error")
            }
        }

        try {
            manager.openCamera(cameraId, stateCallback, handler)
        } catch (e: SecurityException) {
            Log.e("CameraController", "Permission issue: ${e.message}")
        } catch (e: Exception) {
            Log.e("CameraController", "Error opening camera: ${e.message}")
        }
    }

    fun stopCamera() {
        captureSession?.close()
        cameraDevice?.close()
        imageReader?.close()
        handlerThread?.quitSafely()
        captureSession = null
        cameraDevice = null
        handlerThread = null
        imageReader = null
    }
}
