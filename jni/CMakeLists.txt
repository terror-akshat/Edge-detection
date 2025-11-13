cmake_minimum_required(VERSION 3.6)
project("edge_native")

# Adjust this path to point to your unzipped OpenCV Android SDK
set(OpenCV_DIR ${CMAKE_SOURCE_DIR}/../opencv/sdk/native/jni)

find_package(OpenCV REQUIRED)

add_library(edge_native SHARED native-lib.cpp ImageProcessor.cpp)

include_directories(${OpenCV_INCLUDE_DIRS})

find_library(log-lib log)

target_link_libraries(edge_native ${OpenCV_LIBS} ${log-lib} GLESv2)
