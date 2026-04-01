import { ColorRepresentation, Vector3Tuple } from 'three';

export type FocusTarget = 'overview' | 'billboard' | 'cabinInterior' | 'tablets' | 'introduction' | 'timeline';

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
    lookAt: [-4.9, 3.12, 0.26],
    fov: 40
  },
  cabinInterior: {
    position: [3.56, 2.28, 0.62],
    lookAt: [4.5, 2.22, -1.3],
    fov: 80
  },
  tablets: {
    position: [2.82, 1.74, 5.86],
    lookAt: [2.72, 1.24, 3.3],
    fov: 32
  },
  introduction: {
    position: [0.5, 2.46, 4.72],
    lookAt: [0.15, 1.88, 1.26],
    fov: 32
  },
  timeline: {
    position: [1.34, 2.46, -1.9],
    lookAt: [-0.45, 1.26, -5.45],
    fov: 34
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
  billboard: [-4.9, 1.42, 0.2] as Vector3Tuple,
  cabin: [4.1, 1.12, -0.45] as Vector3Tuple,
  tabletsStart: [1.8, 0.93, 2.9] as Vector3Tuple,
  introductionLandmark: [0.2, 1.2, 1.33] as Vector3Tuple,
  mountain: [0.8, 2.95, -24.5] as Vector3Tuple,
  trailStart: [0.8, 1.03, 2.9] as Vector3Tuple,
  trailEnd: [0.8, 1.03, -14.2] as Vector3Tuple
};

export const PALETTE: Record<string, ColorRepresentation> = {
  skyBottom: '#ffb27a',
  fog: '#d78a67',
  islandTop: '#3f6a4a',
  islandSide: '#1f2926',
  trail: '#526354',
  trailBlocker: '#444040',
  mountain: '#465c7a',
  rock: '#515d68',
  tablet: '#808486',
  tabletRune: '#c9d9d2',
  trunk: '#3c302f',
  leaves: '#4a704f',
  billboardFrame: '#645241',
  billboardFace: '#d8c5a0',
  cabinWall: '#5b4737',
  cabinRoof: '#3a2f34',
  cabinDoor: '#2b1f16',
  accentGlow: '#e0bc72'
};
