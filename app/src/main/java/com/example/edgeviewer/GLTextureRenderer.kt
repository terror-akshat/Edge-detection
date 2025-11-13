package com.example.edgeviewer
import android.graphics.SurfaceTexture
import android.opengl.GLES11Ext
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.util.Log
import android.view.Surface
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.util.concurrent.ArrayBlockingQueue
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

class GLTextureRenderer(private val fpsCallback: (Int) -> Unit) : GLSurfaceView.Renderer {
    // Callback interface to deliver the preview Surface (created from SurfaceTexture)
    interface SurfaceReadyListener {
        fun onSurfaceReady(surface: Surface)
        fun onSurfaceDestroyed()
    }

    private var surfaceReadyListener: SurfaceReadyListener? = null
    fun setSurfaceReadyListener(l: SurfaceReadyListener) {
        surfaceReadyListener = l
    }

    private val texQueue = ArrayBlockingQueue<Int>(10)
    private var lastTime = System.nanoTime()
    private var frames = 0

    // full-screen quad coords
    private val vertexCoords = floatArrayOf(
        -1f, -1f,
        1f, -1f,
        -1f, 1f,
        1f, 1f
    )
    private val texCoords = floatArrayOf(
        0f, 1f,
        1f, 1f,
        0f, 0f,
        1f, 0f
    )

    private lateinit var vertexBuffer: FloatBuffer
    private lateinit var texBuffer: FloatBuffer
    private var program = 0

    // fields for external texture / surface
    private var oesTextureId = 0
    private var surfaceTexture: SurfaceTexture? = null
    private var previewSurface: Surface? = null

    // used flag to notify main when surface created
    private var surfaceCreatedNotified = false

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES20.glClearColor(0f, 0f, 0f, 1f)
        setupBuffers()
        setupShaders()

        // Create external OES texture
        oesTextureId = createExternalTexture()
        surfaceTexture = SurfaceTexture(oesTextureId).apply {
            // When camera updates frame it will call this; we simply request render on the GLSurfaceView
            setOnFrameAvailableListener {
                // frame available from camera -> request render externally (MainActivity will call GLSurfaceView.requestRender)
                // we can't call requestRender here (no reference to GLSurfaceView), so enqueue texture id flag:
                // the renderer will draw using the oesTextureId directly (no need for queue); but keep design simple:
                // we'll just increment frames and let onDrawFrame call updateTexImage()
            }
        }

        // Build a Surface from the SurfaceTexture and deliver it to MainActivity (camera consumer)
        previewSurface = Surface(surfaceTexture)
        surfaceReadyListener?.onSurfaceReady(previewSurface!!)
        surfaceCreatedNotified = true
    }

    override fun onSurfaceChanged(gl: GL10?, w: Int, h: Int) {
        GLES20.glViewport(0, 0, w, h)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)

        // If we created a SurfaceTexture, update it to get latest camera frame
        surfaceTexture?.let { st ->
            try {
                st.updateTexImage()
            } catch (e: Exception) {
                // may happen if surfaceTexture invalid; show red so you notice
                GLES20.glClearColor(1f, 0f, 0f, 1f)
                return
            }
        } ?: run {
            GLES20.glClearColor(1f, 0f, 0f, 1f)
            return
        }

        GLES20.glUseProgram(program)

        val posHandle = GLES20.glGetAttribLocation(program, "aPosition")
        val texHandle = GLES20.glGetAttribLocation(program, "aTexCoord")
        val samplerHandle = GLES20.glGetUniformLocation(program, "uTexture")

        GLES20.glEnableVertexAttribArray(posHandle)
        GLES20.glVertexAttribPointer(posHandle, 2, GLES20.GL_FLOAT, false, 0, vertexBuffer)

        GLES20.glEnableVertexAttribArray(texHandle)
        GLES20.glVertexAttribPointer(texHandle, 2, GLES20.GL_FLOAT, false, 0, texBuffer)

        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, oesTextureId)
        GLES20.glUniform1i(samplerHandle, 0)

        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)

        GLES20.glDisableVertexAttribArray(posHandle)
        GLES20.glDisableVertexAttribArray(texHandle)

        // FPS update
        frames++
        val now = System.nanoTime()
        if (now - lastTime >= 1_000_000_000L) {
            fpsCallback(frames)
            frames = 0
            lastTime = now
        }
    }

    fun releaseSurface() {
        try {
            previewSurface?.release()
        } catch (e: Exception) { /* ignore */ }
        previewSurface = null
        try {
            surfaceTexture?.release()
        } catch (e: Exception) { /* ignore */ }
        surfaceTexture = null
        surfaceReadyListener?.onSurfaceDestroyed()
        surfaceCreatedNotified = false
    }

    private fun setupBuffers() {
        vertexBuffer = ByteBuffer.allocateDirect(vertexCoords.size * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer().apply {
                put(vertexCoords)
                position(0)
            }

        texBuffer = ByteBuffer.allocateDirect(texCoords.size * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer().apply {
                put(texCoords)
                position(0)
            }
    }

    private fun setupShaders() {
        val vertexShaderCode = """
            attribute vec4 aPosition;
            attribute vec2 aTexCoord;
            varying vec2 vTexCoord;
            void main() {
                gl_Position = aPosition;
                vTexCoord = aTexCoord;
            }
        """

        val fragmentShaderCode = """
    #extension GL_OES_EGL_image_external : require
    precision mediump float;
    varying vec2 vTexCoord;
    uniform samplerExternalOES uTexture;

    void main() {
        // Rotate texture 90° clockwise to match phone portrait orientation
        vec2 rotatedTex;
        rotatedTex.x = vTexCoord.y;
        rotatedTex.y = 1.0 - vTexCoord.x;

        gl_FragColor = texture2D(uTexture, rotatedTex);
    }
"""

        val vertexShader = loadShader(GLES20.GL_VERTEX_SHADER, vertexShaderCode)
        val fragmentShader = loadShader(GLES20.GL_FRAGMENT_SHADER, fragmentShaderCode)

        program = GLES20.glCreateProgram().also {
            GLES20.glAttachShader(it, vertexShader)
            GLES20.glAttachShader(it, fragmentShader)
            GLES20.glLinkProgram(it)
            val linkStatus = IntArray(1)
            GLES20.glGetProgramiv(it, GLES20.GL_LINK_STATUS, linkStatus, 0)
            if (linkStatus[0] == 0) {
                Log.e("GLRenderer", "Program link failed: ${GLES20.glGetProgramInfoLog(it)}")
                GLES20.glDeleteProgram(it)
            }
        }
    }

    private fun createExternalTexture(): Int {
        val tex = IntArray(1)
        GLES20.glGenTextures(1, tex, 0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, tex[0])
        // set texture params as required for external textures
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_NEAREST)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        return tex[0]
    }

    private fun loadShader(type: Int, shaderCode: String): Int {
        return GLES20.glCreateShader(type).also { shader ->
            GLES20.glShaderSource(shader, shaderCode)
            GLES20.glCompileShader(shader)
            val compiled = IntArray(1)
            GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compiled, 0)
            if (compiled[0] == 0) {
                Log.e("GLShader", "Error compiling shader: ${GLES20.glGetShaderInfoLog(shader)}")
                GLES20.glDeleteShader(shader)
            }
        }
    }
}