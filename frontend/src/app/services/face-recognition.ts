import * as faceapi from 'face-api.js';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FaceRecognitionService {

  async loadModels() {
    const MODEL_URL = 'assets/models';

    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

    console.log('✅ Models Loaded');
  }

  async detectFace(video: HTMLVideoElement) {
    return await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
  }

  async detectFaceFromImage(img: HTMLImageElement) {
  const detections = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detections;
}


}