import { ColorRepresentation, Vector3Tuple } from 'three';

export type SceneQualityTier = 'low' | 'medium' | 'high';

export type SceneQualityPreset = {
  dprCap: number;
  antialias: boolean;
  shadows: boolean;
  shadowMapResolution: number;
  shadowCastingLights: number;
  geometryDetail: number;
  textureResolution: 1024 | 2048 | 4096;
  decorativeEffects: boolean;
  targetFps: number;
};

/** Central rendering budget used by every expensive scene system. */
export const SCENE_QUALITY_PRESETS: Record<SceneQualityTier, SceneQualityPreset> = {
  low: {
    dprCap: 1,
    antialias: false,
    shadows: false,
    shadowMapResolution: 0,
    shadowCastingLights: 0,
    geometryDetail: 0.5,
    textureResolution: 1024,
    decorativeEffects: false,
    targetFps: 40,
  },
  medium: {
    dprCap: 1.35,
    antialias: true,
    shadows: true,
    shadowMapResolution: 1024,
    shadowCastingLights: 1,
    geometryDetail: 0.75,
    textureResolution: 2048,
    decorativeEffects: true,
    targetFps: 50,
  },
  high: {
    dprCap: 1.7,
    antialias: true,
    shadows: true,
    shadowMapResolution: 2048,
    shadowCastingLights: 1,
    geometryDetail: 1,
    textureResolution: 4096,
    decorativeEffects: true,
    targetFps: 58,
  },
};

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
    position: [1.3, 4, 6.1],
    lookAt: [1.5, 2, 4.9],
    fov: 50
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
    overlayFadeDuration: 0.24,
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
  mountain: [0.8, -0.07, -23] as Vector3Tuple,
  trailStart: [0.8, 1.03, 2.9] as Vector3Tuple,
  trailEnd: [0.8, 1.03, -14.2] as Vector3Tuple
};

export const ISLAND_GROUND_INTERACTION_MIN_Y = 1.12;

export const PALETTE: Record<string, ColorRepresentation> = {
  skyBottom: '#f2a071',
  fog: '#d99a7c',
  oceanDeep: '#176b91',
  ocean: '#269bbb',
  oceanShallow: '#63d4cf',
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
