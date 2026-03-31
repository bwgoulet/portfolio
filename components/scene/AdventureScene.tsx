'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useRef, useState } from 'react';
import type { Group } from 'three';
import { Billboard } from './Billboard';
import { CameraRig } from './CameraRig';
import { LightingAtmosphere } from './LightingAtmosphere';
import { LowPolyEnvironment } from './LowPolyEnvironment';
import { InteractionState } from './types';
import { ANIMATION_CONFIG } from '@/config/sceneConfig';
import { makeTimeline } from '@/lib/animation';

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const [interactionState, setInteractionState] = useState<InteractionState>('idleOverview');

  const isTransitioning = interactionState === 'transitionToBillboard';
  const isInteractive = interactionState === 'idleOverview' || interactionState === 'hoverBillboard';

  const handleHoverChange = useCallback(
    (hovered: boolean) => {
      if (isTransitioning || interactionState === 'billboardCloseup') return;
      setInteractionState(hovered ? 'hoverBillboard' : 'idleOverview');
    },
    [interactionState, isTransitioning]
  );

  const handleBillboardClick = useCallback(() => {
    if (isTransitioning || interactionState === 'billboardCloseup' || !billboardRef.current) return;

    setInteractionState('transitionToBillboard');

    const board = billboardRef.current;
    const startY = board.position.y;
    const startRotationY = board.rotation.y;

    makeTimeline()
      .to(board.position, {
        y: startY + ANIMATION_CONFIG.billboardNudgeAmountY,
        duration: ANIMATION_CONFIG.billboardNudgeDuration,
        ease: 'power2.out'
      })
      .to(
        board.rotation,
        {
          y: startRotationY + ANIMATION_CONFIG.billboardNudgeRotation.y,
          duration: ANIMATION_CONFIG.billboardNudgeDuration,
          ease: 'sine.out'
        },
        '<'
      )
      .to(board.position, {
        y: startY,
        duration: ANIMATION_CONFIG.billboardNudgeDuration,
        ease: 'power1.inOut'
      })
      .to(
        board.rotation,
        {
          y: startRotationY,
          duration: ANIMATION_CONFIG.billboardNudgeDuration,
          ease: 'power1.inOut'
        },
        '<'
      );
  }, [interactionState, isTransitioning]);

  return (
    <main>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.6]}>
        <Suspense fallback={null}>
          <CameraRig
            targetKey={interactionState === 'billboardCloseup' ? 'billboardCloseup' : 'overview'}
            isTransitioning={isTransitioning}
            onTransitionEnd={() => setInteractionState('billboardCloseup')}
          />
          <LightingAtmosphere />
          <LowPolyEnvironment />
          <Billboard
            billboardRef={billboardRef}
            interactiveEnabled={isInteractive}
            interactionState={interactionState}
            onHoverChange={handleHoverChange}
            onClick={handleBillboardClick}
          />
        </Suspense>
      </Canvas>

      <aside className="scene-hud">
        {interactionState === 'billboardCloseup' ? (
          <span>Close-up reached. Replace this state with portal/content UI next.</span>
        ) : (
          <span>
            Click the sign to inspect it. Current state: <code>{interactionState}</code>
          </span>
        )}
      </aside>
    </main>
  );
}
