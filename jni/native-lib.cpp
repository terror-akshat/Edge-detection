#include <jni.h>
#include <string>
#include <opencv2/opencv.hpp>
#include "ImageProcessor.h"
#include <android/log.h>

#define LOG_TAG "edge_native"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,LOG_TAG,__VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR,LOG_TAG,__VA_ARGS__)

static ImageProcessor *gProcessor = nullptr;

extern "C"
JNIEXPORT void JNICALL
Java_com_example_edgeviewer_MainActivity_nativeInit(JNIEnv *env, jobject thiz, jint width, jint height) {
if (gProcessor == nullptr) {
gProcessor = new ImageProcessor(width, height);
LOGI("nativeInit: %d x %d", width, height);
}
}

extern "C"
JNIEXPORT jint JNICALL
        Java_com_example_edgeviewer_MainActivity_nativeProcessFrame(JNIEnv *env, jobject thiz,
jbyteArray data, jint width, jint height,
        jlong timestampNs, jint toggleEdge) {
jbyte *bytes = env->GetByteArrayElements(data, nullptr);
int len = env->GetArrayLength(data);
// Convert Y (one-plane) to cv::Mat (Y only). Expect Y plane; we'll create a grayscale Mat and convert.
cv::Mat yMat(height, width, CV_8UC1, (unsigned char*)bytes);
cv::Mat rgba;
cv::cvtColor(yMat, rgba, cv::COLOR_YUV2RGBA_NV21); // If NV21; if only Y plane, this step may vary.

cv::Mat out;
if (toggleEdge == 1) {
cv::Mat gray;
cv::cvtColor(rgba, gray, cv::COLOR_RGBA2GRAY);
cv::Canny(gray, out, 50, 150);
cv::cvtColor(out, out, cv::COLOR_GRAY2RGBA);
} else {
out = rgba;
}

// Pass processed Mat to ImageProcessor which will upload to GL texture and return texture id.
int texId = gProcessor->uploadToTexture(out);

env->ReleaseByteArrayElements(data, bytes, JNI_ABORT);
return texId;
}

extern "C"
JNIEXPORT void JNICALL
Java_com_example_edgeviewer_MainActivity_nativeRelease(JNIEnv *env, jobject thiz) {
if (gProcessor) {
delete gProcessor;
gProcessor = nullptr;
}
}
