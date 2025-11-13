package com.example.edgeviewer

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.Surface
import android.widget.Button
import android.widget.TextView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : Activity() {

    companion object {
        init {
            System.loadLibrary("edge_native")
        }
        private const val CAMERA_PERMISSION_REQUEST = 100
    }

    // native methods
    private external fun nativeInit(width: Int, height: Int)
    private external fun nativeProcessFrame(bytes: ByteArray, width: Int, height: Int, timestampNs: Long, toggleEdge: Int): Int
    private external fun nativeRelease()

    private lateinit var glSurfaceView: android.opengl.GLSurfaceView
    private lateinit var renderer: GLTextureRenderer
    private lateinit var toggleBtn: Button
    private lateinit var fpsText: TextView

    private var showEdge = 1
    private var cameraSurface: Surface? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        glSurfaceView = findViewById(R.id.gl_surface)
        toggleBtn = findViewById(R.id.toggle_btn)
        fpsText = findViewById(R.id.fps_text)

        // setup GLSurfaceView
        glSurfaceView.setEGLContextClientVersion(2)
        renderer = GLTextureRenderer { fps -> runOnUiThread { fpsText.text = "FPS: $fps" } }
        glSurfaceView.setRenderer(renderer)
        glSurfaceView.renderMode = android.opengl.GLSurfaceView.RENDERMODE_WHEN_DIRTY

        // When GL thread creates surface, we receive it via listener and start camera on main thread
        renderer.setSurfaceReadyListener(object : GLTextureRenderer.SurfaceReadyListener {
            override fun onSurfaceReady(surface: Surface) {
                // store and start camera on UI thread
                runOnUiThread {
                    cameraSurface = surface
                    // ensure permission
                    if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.CAMERA)
                        != PackageManager.PERMISSION_GRANTED
                    ) {
                        ActivityCompat.requestPermissions(this@MainActivity, arrayOf(Manifest.permission.CAMERA), CAMERA_PERMISSION_REQUEST)
                        return@runOnUiThread
                    }
                    startCameraWithSurface(surface)
                }
            }

            override fun onSurfaceDestroyed() {
                // stop camera when surface destroyed
                runOnUiThread {
                    CameraController.stopCamera()
                    cameraSurface = null
                }
            }
        })

        // toggle button
        toggleBtn.setOnClickListener {
            showEdge = 1 - showEdge
            toggleBtn.text = if (showEdge == 1) "Toggle: Edge" else "Toggle: Raw"
        }
    }

    private fun startCameraWithSurface(surface: Surface) {
        // initialize native if required (you can supply preview resolution that camera will use)
        nativeInit(1280, 720) // or dynamic if you choose

        CameraController.startCamera(this, surface) { frameBytes, w, h, ts ->
            // Called on Camera thread. Call nativeProcessFrame and then request GL render on UI thread
            val textureId = nativeProcessFrame(frameBytes, w, h, ts, showEdge)
            // If you are using the external surface approach above, nativeProcessFrame might be processing bytes but
            // not needed to produce texture id. Since camera preview is already feeding GL SurfaceTexture,
            // this flow just lets you run CPU native processing in parallel (optional).
            // Request a render on GLSurfaceView:
            glSurfaceView.requestRender()
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_PERMISSION_REQUEST &&
            grantResults.isNotEmpty() &&
            grantResults[0] == PackageManager.PERMISSION_GRANTED
        ) {
            cameraSurface?.let { startCameraWithSurface(it) } // if surface was already created
        } else {
            Log.e("MainActivity", "Camera permission denied!")
        }
    }

    override fun onResume() {
        super.onResume()
        glSurfaceView.onResume()
    }

    override fun onPause() {
        super.onPause()
        CameraController.stopCamera()
        glSurfaceView.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        nativeRelease()
    }
}