'use client';

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3 } from 'three';
import { CAMERA_PRESETS, FocusTarget, MOTION_TIERS } from '@/config/sceneConfig';
import { animateValue } from '@/lib/animation';

type CameraRigProps = {
  targetKey: FocusTarget;
  isTransitioning: boolean;
  onTransitionEnd: (target: FocusTarget) => void;
  onTransitionProgress?: (target: FocusTarget, progress: number) => void;
  reducedMotion: boolean;
};

export function CameraRig({ targetKey, isTransitioning, onTransitionEnd, onTransitionProgress, reducedMotion }: CameraRigProps) {
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const lookAt = useRef(new Vector3(...CAMERA_PRESETS.overview.lookAt));
  const onTransitionEndRef = useRef(onTransitionEnd);
  const onTransitionProgressRef = useRef(onTransitionProgress);

  // Transition callbacks are derived from scene state and can change on every
  // render. Keep their latest versions without restarting an in-flight camera
  // tween (which can otherwise happen when a progress callback updates state).
  useEffect(() => {
    onTransitionEndRef.current = onTransitionEnd;
    onTransitionProgressRef.current = onTransitionProgress;
  }, [onTransitionEnd, onTransitionProgress]);

  useEffect(() => {
    const preset = CAMERA_PRESETS[targetKey];
    const transitionStartTime = performance.now();
    const transitionDurationMs = MOTION_TIERS.macro.cameraDuration * 1000;

    if (!isTransitioning || reducedMotion) {
      camera.position.set(...preset.position);
      lookAt.current.set(...preset.lookAt);
      camera.fov = preset.fov;
      camera.lookAt(lookAt.current);
      camera.updateProjectionMatrix();
      onTransitionProgressRef.current?.(targetKey, 1);
      if (isTransitioning) onTransitionEndRef.current(targetKey);
      return;
    }

    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const tweenPosition = animateValue(camera.position, {
      x: preset.position[0],
      y: preset.position[1],
      z: preset.position[2],
      duration: MOTION_TIERS.macro.cameraDuration,
      ease: MOTION_TIERS.macro.cameraEase,
      onUpdate: () => {
        camera.lookAt(lookAt.current);
        const elapsed = performance.now() - transitionStartTime;
        onTransitionProgressRef.current?.(targetKey, Math.min(1, elapsed / transitionDurationMs));
      }
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
        settleTimer = setTimeout(
          () => onTransitionEndRef.current(targetKey),
          MOTION_TIERS.macro.settleDelay * 1000,
        );
      }
    });

    return () => {
      tweenPosition.kill();
      tweenLookAt.kill();
      tweenFov.kill();
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [camera, isTransitioning, reducedMotion, targetKey]);

  return null;
}
