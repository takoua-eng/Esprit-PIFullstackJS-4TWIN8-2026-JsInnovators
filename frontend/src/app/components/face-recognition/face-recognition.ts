import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as faceapi from 'face-api.js';
import { FaceRecognitionService } from '../../services/face-recognition.service';

@Component({
  selector: 'app-face-recognition',
  templateUrl: './face-recognition.component.html'
})
export class FaceRecognitionComponent implements AfterViewInit {

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  constructor(private faceService: FaceRecognitionService) {}

  async ngAfterViewInit() {

    await this.faceService.loadModels();

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    const videoElement = this.video.nativeElement;

    videoElement.srcObject = stream;

    videoElement.play();

    this.detectFace();
  }

  async detectFace() {

    setInterval(async () => {

      const detection = await this.faceService.detectFace(this.video.nativeElement);

      if (detection) {
        console.log("✅ Face detected");
      }

    }, 1000);

  }

}