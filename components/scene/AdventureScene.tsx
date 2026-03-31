'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import { Billboard } from './Billboard';
import { Cabin } from './Cabin';
import { CameraRig } from './CameraRig';
import { LightingAtmosphere } from './LightingAtmosphere';
import { LowPolyEnvironment } from './LowPolyEnvironment';
import { InteractionState, InteractiveTarget } from './types';
import { CabinInterior } from './CabinInterior';
import { PROJECT_NOTE_RECORD } from './projectNotes';
import { ANIMATION_CONFIG } from '@/config/sceneConfig';
import { EXPERIENCE_RECORD } from './experienceData';
import { makeTimeline } from '@/lib/animation';
import { ExperienceDetailOverlay } from './ExperienceDetailOverlay';
import { ProjectDetailOverlay } from './ProjectDetailOverlay';
import { getCloseupStateForFocus, getHoverStateForLandmark, getNudgeRotationDelta, isOverviewState } from './interactionController';
import { LANDMARKS } from './landmarks';
import { SceneDebugOverlay } from './SceneDebugOverlay';

const IS_DEV = process.env.NODE_ENV !== 'production';

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const cabinRef = useRef<Group>(null);
  const tabletsRef = useRef<Group>(null);
  const landmarkRefs = useMemo(
    () => ({
      billboard: billboardRef,
      cabin: cabinRef,
      tablets: tabletsRef
    }),
    []
  );

  const [interactionState, setInteractionState] = useState<InteractionState>('idleOverview');
  const [focusTarget, setFocusTarget] = useState<'overview' | 'billboard' | 'cabinInterior' | 'tablets'>('overview');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [debugEnabled, setDebugEnabled] = useState(false);

  useEffect(() => {
    if (!IS_DEV) return;
    const debugFromUrl = new URLSearchParams(window.location.search).get('sceneDebug') === '1';
    setDebugEnabled(debugFromUrl);
  }, [landmarkRefs]);

  const isTransitioning = interactionState === 'transitioning';
  const inOverviewState = isOverviewState(interactionState);

  const selectedNote = selectedNoteId ? PROJECT_NOTE_RECORD[selectedNoteId] : null;
  const selectedExperience = selectedExperienceId ? EXPERIENCE_RECORD[selectedExperienceId] : null;

  const landmarksById = useMemo(() => Object.fromEntries(LANDMARKS.map((landmark) => [landmark.id, landmark])), []);
  const landmarksByFocus = useMemo(() => Object.fromEntries(LANDMARKS.map((landmark) => [landmark.focusPresetKey, landmark])), []);
  const activeLandmark = focusTarget === 'overview' ? null : landmarksByFocus[focusTarget];

  const updateHover = useCallback(
    (target: InteractiveTarget, hovered: boolean) => {
      if (!inOverviewState || isTransitioning) return;
      setInteractionState(hovered ? getHoverStateForLandmark(target) : 'idleOverview');
    },
    [inOverviewState, isTransitioning]
  );

  const animateFocusNudge = useCallback((target: InteractiveTarget) => {
    const group = landmarkRefs[target].current;
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
          y: startRotationY + getNudgeRotationDelta(target),
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
  }, [landmarkRefs]);

  const handleFocusClick = useCallback(
    (target: InteractiveTarget) => {
      if (!inOverviewState || isTransitioning) return;

      setInteractionState('transitioning');
      setFocusTarget(landmarksById[target].focusPresetKey);
      setSelectedNoteId(null);
      setSelectedExperienceId(null);
      animateFocusNudge(target);
    },
    [animateFocusNudge, inOverviewState, isTransitioning, landmarksById]
  );

  return (
    <main>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.7]} gl={{ alpha: false }}>
        <Suspense fallback={null}>
          <CameraRig
            targetKey={focusTarget}
            isTransitioning={isTransitioning}
            onTransitionEnd={() => setInteractionState(getCloseupStateForFocus(focusTarget))}
          />
          <LightingAtmosphere />
          {interactionState !== 'cabinCloseup' && (
            <>
              <LowPolyEnvironment
                tabletsInteractiveEnabled={inOverviewState}
                tabletsDetailInteractiveEnabled={interactionState === 'tabletsCloseup'}
                tabletsHovered={interactionState === 'hoverTablets' || interactionState === 'tabletsCloseup'}
                onTabletsHoverChange={(hovered) => updateHover('tablets', hovered)}
                onTabletsClick={handleFocusClick}
                onTabletDetailSelect={(entryId) => setSelectedExperienceId(entryId)}
                tabletsRef={landmarkRefs.tablets}
              />
              <Billboard
                billboardRef={landmarkRefs.billboard}
                interactiveEnabled={inOverviewState}
                notesInteractive={interactionState === 'billboardCloseup'}
                hovered={interactionState === 'hoverBillboard'}
                onHoverChange={(hovered) => updateHover('billboard', hovered)}
                onClick={() => handleFocusClick('billboard')}
                onNoteClick={(noteId) => setSelectedNoteId(noteId)}
                detailOpen={selectedNoteId !== null}
              />
              <Cabin
                cabinRef={landmarkRefs.cabin}
                interactiveEnabled={inOverviewState}
                hovered={interactionState === 'hoverCabin'}
                onHoverChange={(hovered) => updateHover('cabin', hovered)}
                onClick={() => handleFocusClick('cabin')}
              />
            </>
          )}
          {interactionState === 'cabinCloseup' && <CabinInterior />}
          {IS_DEV && debugEnabled && <SceneDebugOverlay />}
        </Suspense>
      </Canvas>

      <header className="scene-brand" aria-label="Site title">
        <span className="scene-brand-cloud scene-brand-cloud--left" />
        <span className="scene-brand-cloud scene-brand-cloud--right" />
        <h1>Ben Goulet</h1>
        <p>an interactive portfolio</p>
      </header>

      {activeLandmark?.detailRendererKey === 'project' && interactionState === 'billboardCloseup' && selectedNote && (
        <ProjectDetailOverlay note={selectedNote} onClose={() => setSelectedNoteId(null)} />
      )}

      {activeLandmark?.detailRendererKey === 'experience' && interactionState === 'tabletsCloseup' && selectedExperience && (
        <ExperienceDetailOverlay experience={selectedExperience} onClose={() => setSelectedExperienceId(null)} />
      )}

      {!inOverviewState && !isTransitioning && (
        <button
          className="scene-back"
          aria-label="Return to overview"
          onClick={() => {
            setFocusTarget('overview');
            setInteractionState('transitioning');
            setSelectedNoteId(null);
            setSelectedExperienceId(null);
          }}
        >
          ←
        </button>
      )}

      {IS_DEV && (
        <button className="scene-debug-toggle" onClick={() => setDebugEnabled((current) => !current)}>
          {debugEnabled ? 'Hide scene debug' : 'Show scene debug'}
        </button>
      )}
    </main>
  );
}
