import { ColorRepresentation, Vector3Tuple } from 'three';

export type FocusTarget = 'overview' | 'billboard' | 'cabinInterior' | 'tablets';
export type ViewportTarget = 'desktopWide' | 'desktopStandard' | 'laptop';

export type CameraPreset = {
  position: Vector3Tuple;
  lookAt: Vector3Tuple;
  fov: number;
  safeMargin?: number;
};

export const CAMERA_PRESETS: Record<FocusTarget, Record<ViewportTarget, CameraPreset>> = {
  overview: {
    desktopWide: {
      position: [-8.2, 4.85, 12.2],
      lookAt: [0.1, 1.86, -3.6],
      fov: 36,
      safeMargin: 0.18
    },
    desktopStandard: {
      position: [-7.95, 4.8, 11.95],
      lookAt: [0.14, 1.88, -3.55],
      fov: 37,
      safeMargin: 0.2
    },
    laptop: {
      position: [-7.7, 4.72, 11.65],
      lookAt: [0.2, 1.9, -3.4],
      fov: 38,
      safeMargin: 0.24
    }
  },
  billboard: {
    desktopWide: {
      position: [-3.95, 3.1, 2.85],
      lookAt: [-4.82, 3.14, 0.3],
      fov: 39,
      safeMargin: 0.2
    },
    desktopStandard: {
      position: [-3.9, 3.13, 2.78],
      lookAt: [-4.84, 3.13, 0.28],
      fov: 40,
      safeMargin: 0.22
    },
    laptop: {
      position: [-3.84, 3.15, 2.68],
      lookAt: [-4.86, 3.12, 0.26],
      fov: 42,
      safeMargin: 0.26
    }
  },
  cabinInterior: {
    desktopWide: {
      position: [4.63, 2.22, 0.76],
      lookAt: [3.82, 1.3, -0.46],
      fov: 52,
      safeMargin: 0.19
    },
    desktopStandard: {
      position: [4.6, 2.2, 0.72],
      lookAt: [3.84, 1.3, -0.47],
      fov: 54,
      safeMargin: 0.22
    },
    laptop: {
      position: [4.57, 2.17, 0.66],
      lookAt: [3.85, 1.29, -0.48],
      fov: 56,
      safeMargin: 0.26
    }
  },
  tablets: {
    desktopWide: {
      position: [2.9, 1.76, 5.98],
      lookAt: [2.72, 1.24, 3.34],
      fov: 31,
      safeMargin: 0.2
    },
    desktopStandard: {
      position: [2.87, 1.76, 5.92],
      lookAt: [2.72, 1.24, 3.32],
      fov: 32,
      safeMargin: 0.22
    },
    laptop: {
      position: [2.84, 1.75, 5.84],
      lookAt: [2.72, 1.24, 3.3],
      fov: 34,
      safeMargin: 0.26
    }
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
  tabletsStart: [1.8, 0.93, 2.9] as Vector3Tuple,
  mountain: [0.8, 2.95, -24.5] as Vector3Tuple,
  trailStart: [0.8, 1.03, 2.9] as Vector3Tuple,
  trailEnd: [0.8, 1.03, -14.2] as Vector3Tuple
};

export const PALETTE: Record<string, ColorRepresentation> = {
  skyBottom: '#ffb27a',
  fog: '#d78a67',
  islandTop: '#2f4a38',
  islandSide: '#1f2926',
  trail: '#526354',
  trailBlocker: '#444040',
  mountain: '#465c7a',
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
  accentGlow: '#e0bc72',
  brandAccent: '#7cc8a8'
};
