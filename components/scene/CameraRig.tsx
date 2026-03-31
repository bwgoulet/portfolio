'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import { ANIMATION_CONFIG, CAMERA_PRESETS } from '@/config/sceneConfig';
import { animateValue } from '@/lib/animation';

type CameraRigProps = {
  targetKey: 'overview' | 'billboardCloseup';
  isTransitioning: boolean;
  onTransitionEnd: () => void;
};

export function CameraRig({ targetKey, isTransitioning, onTransitionEnd }: CameraRigProps) {
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const lookAt = useRef(new Vector3(...CAMERA_PRESETS.overview.lookAt));

  useEffect(() => {
    const preset = CAMERA_PRESETS[targetKey];

    if (!isTransitioning) {
      camera.position.set(...preset.position);
      lookAt.current.set(...preset.lookAt);
      camera.fov = preset.fov;
      camera.lookAt(lookAt.current);
      camera.updateProjectionMatrix();
      return;
    }

    const tweenPosition = animateValue(camera.position, {
      x: preset.position[0],
      y: preset.position[1],
      z: preset.position[2],
      duration: ANIMATION_CONFIG.cameraDuration,
      ease: ANIMATION_CONFIG.cameraEase,
      onUpdate: () => camera.lookAt(lookAt.current)
    });

    const tweenLookAt = animateValue(lookAt.current, {
      x: preset.lookAt[0],
      y: preset.lookAt[1],
      z: preset.lookAt[2],
      duration: ANIMATION_CONFIG.cameraDuration,
      ease: ANIMATION_CONFIG.cameraEase,
      onUpdate: () => camera.lookAt(lookAt.current)
    });

    const tweenFov = animateValue(camera, {
      fov: preset.fov,
      duration: ANIMATION_CONFIG.cameraDuration,
      ease: ANIMATION_CONFIG.cameraEase,
      onUpdate: () => camera.updateProjectionMatrix(),
      onComplete: onTransitionEnd
    });

    return () => {
      tweenPosition.kill();
      tweenLookAt.kill();
      tweenFov.kill();
    };
  }, [camera, isTransitioning, onTransitionEnd, targetKey]);

  return null;
}
