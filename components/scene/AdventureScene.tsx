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

  const activeNoteId = selectedNoteId ?? closingNoteId;
  const activeExperienceId = selectedExperienceId ?? closingExperienceId;
  const selectedNote = activeNoteId ? PROJECT_NOTE_RECORD[activeNoteId] : null;
  const selectedExperience = activeExperienceId ? EXPERIENCE_RECORD[activeExperienceId] : null;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const closeNoteDetail = useCallback(() => {
    if (!selectedNoteId) return;
    if (reducedMotion) {
      setSelectedNoteId(null);
      setClosingNoteId(null);
      return;
    }
    setClosingNoteId(selectedNoteId);
    setSelectedNoteId(null);
    window.setTimeout(() => setClosingNoteId(null), MOTION_TIERS.macro.overlayFadeDuration * 1000);
  }, [reducedMotion, selectedNoteId]);

  const closeExperienceDetail = useCallback(() => {
    if (!selectedExperienceId) return;
    if (reducedMotion) {
      setSelectedExperienceId(null);
      setClosingExperienceId(null);
      return;
    }
    setClosingExperienceId(selectedExperienceId);
    setSelectedExperienceId(null);
    window.setTimeout(() => setClosingExperienceId(null), MOTION_TIERS.macro.overlayFadeDuration * 1000);
  }, [reducedMotion, selectedExperienceId]);

  const closeNoteDialog = useCallback(() => {
    setSelectedNoteId(null);
  }, []);

  const closeExperienceDialog = useCallback(() => {
    setSelectedExperienceId(null);
  }, []);

  useEffect(() => {
    if (!isDetailDialogOpen || !modalRef.current) return;
    const dialog = modalRef.current;
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',');
    const focusableNodes = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelectors));
    const firstFocusable = focusableNodes[0] ?? dialog;
    const lastFocusable = focusableNodes[focusableNodes.length - 1] ?? dialog;
    firstFocusable.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      if (focusableNodes.length < 2) {
        event.preventDefault();
        firstFocusable.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    dialog.addEventListener('keydown', onKeyDown);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
    };
  }, [isDetailDialogOpen]);

  useEffect(() => {
    if (isDetailDialogOpen) return;
    lastTriggerRef.current?.focus();
  }, [isDetailDialogOpen]);

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

  const detailCardStateClass = (isClosing: boolean) =>
    reducedMotion ? 'motion-reduced' : isClosing ? 'anim-exit' : 'anim-enter';

  return (
    <main>
      <div className={`scene-stage ${isDetailDialogOpen ? 'scene-stage--locked' : ''}`} aria-hidden={isDetailDialogOpen}>
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
                reducedMotion={reducedMotion}
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

      <header className={`scene-brand ${reducedMotion ? 'motion-reduced' : 'anim-enter'}`} aria-label="Site title">
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
