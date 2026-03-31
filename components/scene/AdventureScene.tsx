'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import { Billboard } from './Billboard';
import { Cabin } from './Cabin';
import { CameraRig } from './CameraRig';
import { LightingAtmosphere } from './LightingAtmosphere';
import { LowPolyEnvironment } from './LowPolyEnvironment';
import { InteractionState, InteractiveTarget } from './types';
import { ANIMATION_CONFIG } from '@/config/sceneConfig';
import { makeTimeline } from '@/lib/animation';

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const cabinRef = useRef<Group>(null);

  const [interactionState, setInteractionState] = useState<InteractionState>('idleOverview');
  const [focusTarget, setFocusTarget] = useState<'overview' | 'billboard' | 'cabin'>('overview');

  const isTransitioning = interactionState === 'transitioning';
  const isOverviewState = interactionState === 'idleOverview' || interactionState === 'hoverBillboard' || interactionState === 'hoverCabin';

  const updateHover = useCallback(
    (target: InteractiveTarget, hovered: boolean) => {
      if (!isOverviewState || isTransitioning) return;
      if (!hovered) {
        setInteractionState('idleOverview');
        return;
      }
      setInteractionState(target === 'billboard' ? 'hoverBillboard' : 'hoverCabin');
    },
    [isOverviewState, isTransitioning]
  );

  const animateFocusNudge = useCallback((target: InteractiveTarget) => {
    const group = target === 'billboard' ? billboardRef.current : cabinRef.current;
    if (!group) return;

    const startY = group.position.y;
    const startRotationY = group.rotation.y;

    makeTimeline()
      .to(group.position, {
        y: startY + 0.18,
        duration: ANIMATION_CONFIG.nudgeDuration,
        ease: 'power2.out'
      })
      .to(
        group.rotation,
        {
          y: startRotationY + (target === 'billboard' ? -0.12 : 0.09),
          duration: ANIMATION_CONFIG.nudgeDuration,
          ease: 'sine.out'
        },
        '<'
      )
      .to(group.position, {
        y: startY,
        duration: ANIMATION_CONFIG.resetDuration,
        ease: 'power1.inOut'
      })
      .to(
        group.rotation,
        {
          y: startRotationY,
          duration: ANIMATION_CONFIG.resetDuration,
          ease: 'power1.inOut'
        },
        '<'
      );
  }, []);

  const handleFocusClick = useCallback(
    (target: InteractiveTarget) => {
      if (!isOverviewState || isTransitioning) return;

      setInteractionState('transitioning');
      setFocusTarget(target);
      animateFocusNudge(target);
    },
    [animateFocusNudge, isOverviewState, isTransitioning]
  );

  const closeupLabel = useMemo(() => {
    if (interactionState === 'billboardCloseup') return 'Projects Board: ready for post-it portfolio navigation.';
    if (interactionState === 'cabinCloseup') return 'Cabin Interior: ready for About/Gallery entry transition.';
    return null;
  }, [interactionState]);

  return (
    <main>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.7]}>
        <Suspense fallback={null}>
          <CameraRig
            targetKey={focusTarget}
            isTransitioning={isTransitioning}
            onTransitionEnd={() => {
              if (focusTarget === 'overview') {
                setInteractionState('idleOverview');
                return;
              }
              setInteractionState(focusTarget === 'billboard' ? 'billboardCloseup' : 'cabinCloseup');
            }}
          />
          <LightingAtmosphere />
          <LowPolyEnvironment />
          <Billboard
            billboardRef={billboardRef}
            interactiveEnabled={isOverviewState}
            hovered={interactionState === 'hoverBillboard'}
            onHoverChange={(hovered) => updateHover('billboard', hovered)}
            onClick={() => handleFocusClick('billboard')}
          />
          <Cabin
            cabinRef={cabinRef}
            interactiveEnabled={isOverviewState}
            hovered={interactionState === 'hoverCabin'}
            onHoverChange={(hovered) => updateHover('cabin', hovered)}
            onClick={() => handleFocusClick('cabin')}
          />
        </Suspense>
      </Canvas>

      <aside className="scene-hud">
        {closeupLabel ?? (
          <span>
            Click the <code>billboard</code> for projects or the <code>cabin door</code> for about/gallery.
          </span>
        )}
      </aside>

      {!isOverviewState && !isTransitioning && (
        <button
          className="scene-reset"
          onClick={() => {
            setFocusTarget('overview');
            setInteractionState('transitioning');
          }}
        >
          Return to overview
        </button>
      )}
    </main>
  );
}
