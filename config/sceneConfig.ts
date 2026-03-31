import { ColorRepresentation, Vector3Tuple } from 'three';

export type FocusTarget = 'overview' | 'billboard' | 'cabin';

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
    position: [-3.9, 2.5, 2.7],
    lookAt: [-4.85, 2.25, 0.45],
    fov: 29
  },
  cabin: {
    position: [3.65, 1.8, 1.8],
    lookAt: [3.9, 1.45, -0.35],
    fov: 31
  }
};

export const ANIMATION_CONFIG = {
  cameraDuration: 2.35,
  cameraEase: 'power2.inOut',
  nudgeDuration: 0.34,
  resetDuration: 0.3
};

export const SCENE_ANCHORS = {
  billboard: [-4.9, 1.42, 0.2] as Vector3Tuple,
  cabin: [4.1, 1.12, -0.45] as Vector3Tuple,
  tabletsStart: [1.8, 1.07, 2.9] as Vector3Tuple,
  mountain: [0.5, 3.15, -9.4] as Vector3Tuple,
  trailStart: [0.8, 1.03, 1.9] as Vector3Tuple,
  trailEnd: [0.4, 1.08, -2.7] as Vector3Tuple
};

export const PALETTE: Record<string, ColorRepresentation> = {
  skyBottom: '#ffb27a',
  fog: '#d78a67',
  islandTop: '#2f4a38',
  islandSide: '#1f2926',
  trail: '#526354',
  trailBlocker: '#444040',
  mountain: '#38414f',
  rock: '#515d68',
  tablet: '#808486',
  tabletRune: '#c9d9d2',
  trunk: '#3c302f',
  leaves: '#3e5a45',
  billboardFrame: '#645241',
  billboardFace: '#d8c5a0',
  cabinWall: '#5b4737',
  cabinRoof: '#3a2f34',
  cabinDoor: '#2b1f16',
  accentGlow: '#e0bc72'
};
