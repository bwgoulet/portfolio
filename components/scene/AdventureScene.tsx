'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
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
import { MOTION_TIERS } from '@/config/sceneConfig';

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const cabinRef = useRef<Group>(null);
  const tabletsRef = useRef<Group>(null);

  const [interactionState, setInteractionState] = useState<InteractionState>('idleOverview');
  const [focusTarget, setFocusTarget] = useState<'overview' | 'billboard' | 'cabinInterior' | 'tablets'>('overview');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [closingNoteId, setClosingNoteId] = useState<string | null>(null);
  const [closingExperienceId, setClosingExperienceId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const isTransitioning = interactionState === 'transitioning';
  const isOverviewState =
    interactionState === 'idleOverview' ||
    interactionState === 'hoverBillboard' ||
    interactionState === 'hoverCabin' ||
    interactionState === 'hoverTablets';

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

  const updateHover = useCallback(
    (target: InteractiveTarget, hovered: boolean) => {
      if (!isOverviewState || isTransitioning) return;
      if (!hovered) {
        setInteractionState('idleOverview');
        return;
      }
      setInteractionState(target === 'billboard' ? 'hoverBillboard' : target === 'cabin' ? 'hoverCabin' : 'hoverTablets');
    },
    [isOverviewState, isTransitioning]
  );

  const animateFocusNudge = useCallback(
    (target: InteractiveTarget) => {
      const group = target === 'billboard' ? billboardRef.current : target === 'cabin' ? cabinRef.current : tabletsRef.current;
      if (!group) return;
      if (reducedMotion) return;

      const startY = group.position.y;
      const startRotationY = group.rotation.y;

      makeTimeline()
        .to(group.position, {
          y: startY + 0.18,
          duration: MOTION_TIERS.medium.landmarkNudgeDuration,
          ease: MOTION_TIERS.medium.easeOut
        })
        .to(
          group.rotation,
          {
            y: startRotationY + (target === 'billboard' ? -0.12 : target === 'cabin' ? 0.09 : 0.05),
            duration: MOTION_TIERS.medium.landmarkNudgeDuration,
            ease: MOTION_TIERS.medium.easeOut
          },
          '<'
        )
        .to(group.position, {
          y: startY,
          duration: MOTION_TIERS.medium.landmarkResetDuration,
          ease: MOTION_TIERS.medium.easeInOut
        })
        .to(
          group.rotation,
          {
            y: startRotationY,
            duration: MOTION_TIERS.medium.landmarkResetDuration,
            ease: MOTION_TIERS.medium.easeInOut
          },
          '<'
        );
    },
    [reducedMotion]
  );

  const handleFocusClick = useCallback(
    (target: InteractiveTarget) => {
      if (!isOverviewState || isTransitioning) return;

      setInteractionState('transitioning');
      setFocusTarget(target === 'cabin' ? 'cabinInterior' : target);
      setSelectedNoteId(null);
      setSelectedExperienceId(null);
      animateFocusNudge(target);
    },
    [animateFocusNudge, isOverviewState, isTransitioning]
  );

  const detailCardStateClass = (isClosing: boolean) =>
    reducedMotion ? 'motion-reduced' : isClosing ? 'anim-exit' : 'anim-enter';

  return (
    <main>
      <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.7]} gl={{ alpha: false }}>
        <Suspense fallback={null}>
          <CameraRig
            targetKey={focusTarget}
            isTransitioning={isTransitioning}
            reducedMotion={reducedMotion}
            onTransitionEnd={() => {
              if (focusTarget === 'overview') {
                setInteractionState('idleOverview');
                return;
              }
              setInteractionState(
                focusTarget === 'billboard'
                  ? 'billboardCloseup'
                  : focusTarget === 'cabinInterior'
                    ? 'cabinCloseup'
                    : 'tabletsCloseup'
              );
            }}
          />
          <LightingAtmosphere />
          {interactionState !== 'cabinCloseup' && (
            <>
              <LowPolyEnvironment
                tabletsInteractiveEnabled={isOverviewState}
                tabletsDetailInteractiveEnabled={interactionState === 'tabletsCloseup'}
                tabletsHovered={interactionState === 'hoverTablets' || interactionState === 'tabletsCloseup'}
                onTabletsHoverChange={(hovered) => updateHover('tablets', hovered)}
                onTabletsClick={handleFocusClick}
                onTabletDetailSelect={(entryId) => setSelectedExperienceId(entryId)}
                tabletsRef={tabletsRef}
                reducedMotion={reducedMotion}
              />
              <Billboard
                billboardRef={billboardRef}
                interactiveEnabled={isOverviewState}
                notesInteractive={interactionState === 'billboardCloseup'}
                hovered={interactionState === 'hoverBillboard'}
                onHoverChange={(hovered) => updateHover('billboard', hovered)}
                onClick={() => handleFocusClick('billboard')}
                onNoteClick={(noteId) => setSelectedNoteId(noteId)}
                detailOpen={selectedNoteId !== null}
                reducedMotion={reducedMotion}
              />
              <Cabin
                cabinRef={cabinRef}
                interactiveEnabled={isOverviewState}
                hovered={interactionState === 'hoverCabin'}
                onHoverChange={(hovered) => updateHover('cabin', hovered)}
                onClick={() => handleFocusClick('cabin')}
              />
            </>
          )}
          {interactionState === 'cabinCloseup' && <CabinInterior />}
        </Suspense>
      </Canvas>

      <header className={`scene-brand ${reducedMotion ? 'motion-reduced' : 'anim-enter'}`} aria-label="Site title">
        <span className="scene-brand-cloud scene-brand-cloud--left" />
        <span className="scene-brand-cloud scene-brand-cloud--right" />
        <h1>Ben Goulet</h1>
        <p>an interactive portfolio</p>
      </header>

      {interactionState === 'billboardCloseup' && selectedNote && (
        <article
          className={`note-detail ${detailCardStateClass(Boolean(closingNoteId))}`}
          aria-live="polite"
          onClick={closeNoteDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              closeNoteDetail();
            }
          }}
        >
          <div
            className={`note-detail-card ${detailCardStateClass(Boolean(closingNoteId))}`}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedNote.title} details`}
          >
            <img src={selectedNote.imageSrc} alt={`${selectedNote.title} post-it sketch`} />
            <h2>{selectedNote.title}</h2>
            <p>{selectedNote.detail}</p>
          </div>
        </article>
      )}

      {interactionState === 'tabletsCloseup' && selectedExperience && (
        <article
          className={`note-detail ${detailCardStateClass(Boolean(closingExperienceId))}`}
          aria-live="polite"
          onClick={closeExperienceDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              closeExperienceDetail();
            }
          }}
        >
          <div
            className={`experience-detail-card ${detailCardStateClass(Boolean(closingExperienceId))}`}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedExperience.role} details`}
          >
            <h2>{selectedExperience.role}</h2>
            <p className="experience-detail-meta">{selectedExperience.company}</p>
            <p className="experience-detail-meta">{selectedExperience.dateLocation}</p>
            <ul>
              {selectedExperience.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </article>
      )}

      {!isOverviewState && !isTransitioning && (
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
    </main>
  );
}
