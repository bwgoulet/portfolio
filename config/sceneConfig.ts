import { ColorRepresentation, Euler, Vector3Tuple } from 'three';

export type CameraPreset = {
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
  fov: number;
};

export type SceneState = 'overview' | 'transitioning' | 'billboardCloseup';

export const CAMERA_PRESETS: Record<'overview' | 'billboardCloseup', CameraPreset> = {
  overview: {
    position: [-8, 5.3, 10.5],
    lookAt: [0.8, 1.2, -1.2],
    fov: 40
  },
  billboardCloseup: {
    position: [1.55, 2.0, 3.15],
    lookAt: [1.3, 1.65, -0.6],
    fov: 34
  }
};

export const ANIMATION_CONFIG = {
  cameraDuration: 2.2,
  cameraEase: 'power2.inOut',
  billboardNudgeDuration: 0.36,
  billboardNudgeAmountY: 0.23,
  billboardNudgeRotation: new Euler(0.02, -0.14, 0.01)
};

export const PALETTE: Record<string, ColorRepresentation> = {
  skyTop: '#20374a',
  skyBottom: '#0e171f',
  fog: '#0d151d',
  islandTop: '#314f40',
  islandSide: '#27332f',
  path: '#4d5c4e',
  rock: '#4d5862',
  trunk: '#3a2e2b',
  leaves: '#4c6d54',
  billboardFrame: '#645241',
  billboardFace: '#ccbb96',
  accentGlow: '#d9b56f'
};
