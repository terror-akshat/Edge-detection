#include "ImageProcessor.h"
#include <GLES2/gl2.h>
#include <android/log.h>

#define LOG_TAG "ImageProcessor"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO,LOG_TAG,__VA_ARGS__)

ImageProcessor::ImageProcessor(int width, int height): width_(width), height_(height), texId_(0) {}

ImageProcessor::~ImageProcessor() {
    if (texId_) {
        glDeleteTextures(1, &texId_);
    }
}

void ImageProcessor::ensureTexture() {
    if (texId_ == 0) {
        glGenTextures(1, &texId_);
        glBindTexture(GL_TEXTURE_2D, texId_);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width_, height_, 0, GL_RGBA, GL_UNSIGNED_BYTE, NULL);
    }
}

int ImageProcessor::uploadToTexture(const cv::Mat &mat) {
    ensureTexture();
    glBindTexture(GL_TEXTURE_2D, texId_);
    // Upload mat data (must be RGBA)
    glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, mat.cols, mat.rows, GL_RGBA, GL_UNSIGNED_BYTE, mat.data);
    return (int)texId_;
}
