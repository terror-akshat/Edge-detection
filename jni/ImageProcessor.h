#ifndef IMAGEPROCESSOR_H
#define IMAGEPROCESSOR_H

#include <opencv2/opencv.hpp>
#include <GLES2/gl2.h>

class ImageProcessor {
public:
    ImageProcessor(int width, int height);
    ~ImageProcessor();
    int uploadToTexture(const cv::Mat &mat); // returns GL texture id
private:
    int width_, height_;
    GLuint texId_;
    void ensureTexture();
};

#endif
