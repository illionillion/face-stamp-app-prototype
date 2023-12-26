import type { FaceDetection } from '@vladmandic/face-api';

export type exportImages = {
  name: string;
  url: string;
  fds: FaceDetection[];
};
