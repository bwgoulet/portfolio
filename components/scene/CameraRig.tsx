'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import { ANIMATION_CONFIG, CAMERA_PRESETS, FocusTarget, ViewportTarget } from '@/config/sceneConfig';
import { animateValue } from '@/lib/animation';

type CameraRigProps = {
  targetKey: FocusTarget;
  isTransitioning: boolean;
  onTransitionEnd: () => void;
  reducedMotion: boolean;
};

function getViewportTarget(aspect: number): ViewportTarget {
  if (aspect >= 1.75) return 'desktopWide';
  if (aspect >= 1.5) return 'desktopStandard';
  return 'laptop';
}

export function CameraRig({ targetKey, isTransitioning, onTransitionEnd }: CameraRigProps) {
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const size = useThree((state) => state.size);
  const viewportTarget = useMemo(() => getViewportTarget(size.width / size.height), [size.height, size.width]);

  const lookAt = useRef(new Vector3(...CAMERA_PRESETS.overview[viewportTarget].lookAt));

  useEffect(() => {
    const preset = CAMERA_PRESETS[targetKey][viewportTarget];

    if (!isTransitioning || reducedMotion) {
      camera.position.set(...preset.position);
      lookAt.current.set(...preset.lookAt);
      camera.fov = preset.fov;
      camera.lookAt(lookAt.current);
      camera.updateProjectionMatrix();
      if (isTransitioning) onTransitionEnd();
      return;
    }

    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const tweenPosition = animateValue(camera.position, {
      x: preset.position[0],
      y: preset.position[1],
      z: preset.position[2],
      duration: MOTION_TIERS.macro.cameraDuration,
      ease: MOTION_TIERS.macro.cameraEase,
      onUpdate: () => camera.lookAt(lookAt.current)
    });

    const tweenLookAt = animateValue(lookAt.current, {
      x: preset.lookAt[0],
      y: preset.lookAt[1],
      z: preset.lookAt[2],
      duration: MOTION_TIERS.macro.cameraDuration,
      ease: MOTION_TIERS.macro.cameraEase,
      onUpdate: () => camera.lookAt(lookAt.current)
    });

    const tweenFov = animateValue(camera, {
      fov: preset.fov,
      duration: MOTION_TIERS.macro.cameraDuration,
      ease: MOTION_TIERS.macro.cameraEase,
      onUpdate: () => camera.updateProjectionMatrix(),
      onComplete: () => {
        settleTimer = setTimeout(onTransitionEnd, MOTION_TIERS.macro.settleDelay * 1000);
      }
    });

    return () => {
      tweenPosition.kill();
      tweenLookAt.kill();
      tweenFov.kill();
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [camera, isTransitioning, onTransitionEnd, targetKey, viewportTarget]);

  return null;
}
