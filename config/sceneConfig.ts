import { ColorRepresentation, Vector3Tuple } from 'three';

export type FocusTarget =
  | 'overview'
  | 'billboard'
  | 'cabinInterior'
  | 'cabinDartboard'
  | 'tablets'
  | 'introduction'
  | 'timeline';

export type CameraPreset = {
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
  fov: number;
};

export const CAMERA_PRESETS: Record<FocusTarget, CameraPreset> = {
  overview: {
    position: [-7.8, 4.7, 11.8],
    lookAt: [0.2, 1.9, -3.4],
    fov: 36
  },
  billboard: {
    position: [-3.85, 3.08, 2.65],
    lookAt: [-4.9, 3, 0.26],
    fov: 40
  },
  cabinInterior: {
    position: [3.56, 2.28, 0.62],
    lookAt: [4.5, 2.22, -1.3],
    fov: 80
  },
  cabinDartboard: {
    position: [4.38, 2.8, -0.29],
    lookAt: [5.05, 2.4, 0.03],
    fov: 70
  },
  tablets: {
    position: [2.82, 1.74, 5.86],
    lookAt: [2.72, 1.24, 3.3],
    fov: 32
  },
  introduction: {
    position: [-3.1, 1.8, 5.25],
    lookAt: [-2.2, 1.8, 2.2],
    fov: 40
  },
  timeline: {
    position: [1.5, 2, 1.5],
    lookAt: [-1, 3, -13],
    fov: 24
  }
};

export const MOTION_TIERS = {
  micro: {
    hoverPopDuration: 0.18,
    emissivePulseDuration: 1.8,
    ease: 'sine.out'
  },
  medium: {
    landmarkNudgeDuration: 0.34,
    landmarkResetDuration: 0.3,
    easeOut: 'power2.out',
    easeInOut: 'sine.inOut'
  },
  macro: {
    cameraDuration: 2.35,
    overlayFadeDuration: 0.42,
    cameraEase: 'power2.inOut',
    settleDelay: 0.18
  }
} as const;

export const ANIMATION_CONFIG = {
  cameraDuration: MOTION_TIERS.macro.cameraDuration,
  cameraEase: MOTION_TIERS.macro.cameraEase,
  nudgeDuration: MOTION_TIERS.medium.landmarkNudgeDuration,
  resetDuration: MOTION_TIERS.medium.landmarkResetDuration
};

export const SCENE_ANCHORS = {
  billboard: [-4.9, 1.25, 0.2] as Vector3Tuple,
  cabin: [4.1, 1.12, -0.45] as Vector3Tuple,
  tabletsStart: [1.8, 0.93, 2.9] as Vector3Tuple,
  introductionLandmark: [-2.2, 1.22, 2.2] as Vector3Tuple,
  mountain: [0.8, -.3, -23] as Vector3Tuple,
  trailStart: [0.8, 1.03, 2.9] as Vector3Tuple,
  trailEnd: [0.8, 1.03, -14.2] as Vector3Tuple
};

export const ISLAND_GROUND_INTERACTION_MIN_Y = 1.12;

export const PALETTE: Record<string, ColorRepresentation> = {
  skyBottom: '#ffb27a',
  fog: '#d78a67',
  islandTop: '#46764f',
  islandSide: '#1f2926',
  rock: '#515d68',
  tablet: '#808486',
  tabletRune: '#c9d9d2',
  billboardFrame: '#645241',
  billboardFace: '#d8c5a0',
  cabinWall: '#5b4737',
  cabinRoof: '#3a2f34',
  cabinDoor: '#2b1f16',
  accentGlow: '#e0bc72'
};
