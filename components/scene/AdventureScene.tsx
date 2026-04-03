'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';
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
import { FocusTarget, MOTION_TIERS } from '@/config/sceneConfig';
import { IntroductionLandmark } from './IntroductionLandmark';

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const cabinRef = useRef<Group>(null);
  const tabletsRef = useRef<Group>(null);
  const introductionRef = useRef<Group>(null);
  const timelineSignRef = useRef<Group>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const noteTitleId = useId();
  const experienceTitleId = useId();

  const [interactionState, setInteractionState] = useState<InteractionState>('idleOverview');
  const [focusTarget, setFocusTarget] = useState<FocusTarget>('overview');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [closingNoteId, setClosingNoteId] = useState<string | null>(null);
  const [closingExperienceId, setClosingExperienceId] = useState<string | null>(null);
  const [isIntroductionDialogOpen, setIsIntroductionDialogOpen] = useState(false);
  const [isIntroductionCloseupHovered, setIsIntroductionCloseupHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCabinInteriorRevealed, setIsCabinInteriorRevealed] = useState(false);
  const [isCabinDoorOpen, setIsCabinDoorOpen] = useState(false);
  const [cabinTransitionFadeState, setCabinTransitionFadeState] = useState<'idle' | 'fade-out' | 'fade-in'>('idle');
  const [isCabinFadePending, setIsCabinFadePending] = useState(false);
  const cabinFadeTimerRef = useRef<number | null>(null);

  const scheduleCabinFadeReset = useCallback((durationMs: number) => {
    if (cabinFadeTimerRef.current !== null) {
      window.clearTimeout(cabinFadeTimerRef.current);
    }
    cabinFadeTimerRef.current = window.setTimeout(() => {
      setCabinTransitionFadeState('idle');
      cabinFadeTimerRef.current = null;
    }, durationMs);
  }, []);

  const isTransitioning = interactionState === 'transitioning';
  const isDetailDialogOpen = selectedNoteId !== null || selectedExperienceId !== null || isIntroductionDialogOpen;
  const isOverviewState =
    interactionState === 'idleOverview' ||
    interactionState === 'hoverBillboard' ||
    interactionState === 'hoverCabin' ||
    interactionState === 'hoverTablets' ||
    interactionState === 'hoverIntroduction' ||
    interactionState === 'hoverTimeline';

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

  const closeIntroductionDialog = useCallback(() => {
    setIsIntroductionDialogOpen(false);
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

  const updateHover = useCallback(
    (target: InteractiveTarget, hovered: boolean) => {
      if (!isOverviewState || isTransitioning) return;
      if (!hovered) {
        setInteractionState('idleOverview');
        return;
      }
      setInteractionState(
        target === 'billboard'
          ? 'hoverBillboard'
          : target === 'cabin'
            ? 'hoverCabin'
            : target === 'tablets'
              ? 'hoverTablets'
              : target === 'introduction'
                ? 'hoverIntroduction'
                : 'hoverTimeline'
      );
    },
    [isOverviewState, isTransitioning]
  );

  const animateFocusNudge = useCallback(
    (target: InteractiveTarget) => {
      const group =
        target === 'billboard'
          ? billboardRef.current
          : target === 'cabin'
            ? cabinRef.current
            : target === 'tablets'
              ? tabletsRef.current
              : target === 'introduction'
                ? introductionRef.current
                : timelineSignRef.current;
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
      setIsCabinInteriorRevealed(false);
      setIsCabinDoorOpen(target === 'cabin');
      setSelectedNoteId(null);
      setSelectedExperienceId(null);
      setIsIntroductionDialogOpen(false);
      animateFocusNudge(target);

      if (target === 'cabin') {
        if (reducedMotion) {
          setCabinTransitionFadeState('idle');
          setIsCabinFadePending(false);
          setIsCabinInteriorRevealed(true);
        } else {
          setCabinTransitionFadeState('idle');
          setIsCabinFadePending(true);
        }
      } else {
        setCabinTransitionFadeState('idle');
        setIsCabinFadePending(false);
      }
    },
    [animateFocusNudge, isOverviewState, isTransitioning, reducedMotion]
  );

  useEffect(
    () => () => {
      if (cabinFadeTimerRef.current !== null) {
        window.clearTimeout(cabinFadeTimerRef.current);
      }
      document.body.style.cursor = 'auto';
    },
    []
  );

  useEffect(() => {
    if (interactionState !== 'introductionCloseup') {
      setIsIntroductionCloseupHovered(false);
    }
  }, [interactionState]);

  const detailCardStateClass = (isClosing: boolean) =>
    reducedMotion ? 'motion-reduced' : isClosing ? 'anim-exit' : 'anim-enter';

  return (
    <main>
      <div className={`scene-stage ${isDetailDialogOpen ? 'scene-stage--locked' : ''}`} aria-hidden={isDetailDialogOpen}>
        {cabinTransitionFadeState !== 'idle' && (
          <div className={`cabin-transition-fade cabin-transition-fade--${cabinTransitionFadeState}`} aria-hidden="true" />
        )}
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.7]} gl={{ alpha: false }}>
          <Suspense fallback={null}>
          <CameraRig
            targetKey={focusTarget}
            isTransitioning={isTransitioning}
            reducedMotion={reducedMotion}
            onTransitionProgress={(target, progress) => {
              if (reducedMotion) return;
              if (target !== 'cabinInterior' || !isCabinFadePending) return;
              if (progress < 0.94) return;
              setCabinTransitionFadeState('fade-out');
              setIsCabinFadePending(false);
            }}
            onTransitionEnd={(completedTarget) => {
              if (completedTarget === 'cabinInterior') {
                setIsCabinInteriorRevealed(true);
                if (!reducedMotion) {
                  setCabinTransitionFadeState('fade-in');
                  scheduleCabinFadeReset(320);
                }
              }
              if (completedTarget === 'overview') {
                if (!reducedMotion && cabinTransitionFadeState === 'fade-out') {
                  setCabinTransitionFadeState('fade-in');
                  scheduleCabinFadeReset(320);
                } else {
                  setCabinTransitionFadeState('idle');
                }
                setIsCabinFadePending(false);
                setInteractionState('idleOverview');
                return;
              }
              setInteractionState(
                completedTarget === 'billboard'
                  ? 'billboardCloseup'
                  : completedTarget === 'cabinInterior'
                    ? 'cabinCloseup'
                    : completedTarget === 'tablets'
                      ? 'tabletsCloseup'
                      : completedTarget === 'introduction'
                        ? 'introductionCloseup'
                        : 'timelineCloseup'
              );
            }}
          />
          <LightingAtmosphere />
          <LowPolyEnvironment
            tabletsInteractiveEnabled={isOverviewState}
            tabletsDetailInteractiveEnabled={interactionState === 'tabletsCloseup'}
            tabletsHovered={interactionState === 'hoverTablets' || interactionState === 'tabletsCloseup'}
            onTabletsHoverChange={(hovered) => updateHover('tablets', hovered)}
            onTabletsClick={handleFocusClick}
            onTabletDetailSelect={(entryId) => setSelectedExperienceId(entryId)}
            tabletsRef={tabletsRef}
            timelineSignRef={timelineSignRef}
            timelineInteractiveEnabled={isOverviewState}
            timelineHovered={interactionState === 'hoverTimeline'}
            onTimelineHoverChange={(hovered) => updateHover('timeline', hovered)}
            onTimelineClick={handleFocusClick}
            reducedMotion={reducedMotion}
          />
          <IntroductionLandmark
            landmarkRef={introductionRef}
            interactiveEnabled={isOverviewState || interactionState === 'introductionCloseup'}
            hoverEnabled={isOverviewState || interactionState === 'introductionCloseup'}
            hovered={interactionState === 'hoverIntroduction' || isIntroductionCloseupHovered}
            onHoverChange={(hovered) => {
              if (interactionState === 'introductionCloseup') {
                setIsIntroductionCloseupHovered(hovered);
                return;
              }
              updateHover('introduction', hovered);
            }}
            onClick={() => {
              if (interactionState === 'introductionCloseup') {
                setIsIntroductionDialogOpen(true);
                return;
              }
              handleFocusClick('introduction');
            }}
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
          {!isCabinInteriorRevealed && (
            <Cabin
              cabinRef={cabinRef}
              interactiveEnabled={isOverviewState}
              hovered={interactionState === 'hoverCabin'}
              isDoorOpen={isCabinDoorOpen}
              onHoverChange={(hovered) => updateHover('cabin', hovered)}
              onClick={() => handleFocusClick('cabin')}
            />
          )}
          {focusTarget === 'cabinInterior' && isCabinInteriorRevealed && (
            <CabinInterior />
          )}
          </Suspense>
        </Canvas>
      </div>

      <header className={`scene-brand ${reducedMotion ? 'motion-reduced' : 'anim-enter'}`} aria-label="Site title">
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
            if (event.key === 'Escape') {
              event.preventDefault();
              closeNoteDetail();
            }
          }}
        >
          <div
            className={`note-detail-card detail-content-card project-detail-card ${detailCardStateClass(Boolean(closingNoteId))}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={noteTitleId}
            tabIndex={-1}
          >
            <img src={selectedNote.detailImageSrc} alt={`${selectedNote.title} thumbnail`} />
            <h2 id={noteTitleId}>{selectedNote.title}</h2>
            <p className="detail-summary">{selectedNote.detail}</p>
            {selectedNote.resumeMeta && (
              <p className="detail-meta">{selectedNote.resumeMeta}</p>
            )}
            {selectedNote.resumeDate && (
              <p className="detail-meta">{selectedNote.resumeDate}</p>
            )}
            {selectedNote.bullets && selectedNote.bullets.length > 0 && (
              <ul>
                {selectedNote.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            <hr className="detail-divider" aria-hidden="true" />
            <section className="detail-impact">
              <h3>Why It Mattered</h3>
              <p>{selectedNote.whyItMattered}</p>
            </section>
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
            if (event.key === 'Escape') {
              event.preventDefault();
              closeExperienceDetail();
            }
          }}
        >
          <div
            className={`detail-content-card experience-detail-card ${detailCardStateClass(Boolean(closingExperienceId))}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={experienceTitleId}
            tabIndex={-1}
          >
            <img src={selectedExperience.detailImageSrc} alt={`${selectedExperience.company} thumbnail`} />
            <h2 id={experienceTitleId}>{selectedExperience.role}</h2>
            <p className="detail-meta">{selectedExperience.company}</p>
            <p className="detail-meta">{selectedExperience.dateLocation}</p>
            <ul>
              {selectedExperience.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <hr className="detail-divider" aria-hidden="true" />
            <section className="detail-impact">
              <h3>Why It Mattered</h3>
              <p>{selectedExperience.whyItMattered}</p>
            </section>
          </div>
        </article>
      )}

      {interactionState === 'introductionCloseup' && isIntroductionDialogOpen && (
        <article
          className={`note-detail ${detailCardStateClass(false)}`}
          aria-live="polite"
          onClick={closeIntroductionDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeIntroductionDialog();
            }
          }}
        >
          <div
            className={`detail-content-card introduction-detail-card ${detailCardStateClass(false)}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="introduction-title"
            tabIndex={-1}
          >
            <button className="detail-close" onClick={closeIntroductionDialog} aria-label="Close introduction details">
              Close
            </button>
            <div className="introduction-detail-layout">
              <img src="/introimage.png" alt="Introduction thumbnail" />
              <section className="introduction-detail-copy">
                <h2 id="introduction-title">Introduction</h2>
                <p>
                  I&apos;m Ben Goulet, a software engineer focused on building thoughtful, user-facing software across
                  product, backend, and creative technical work.
                </p>
                <p>
                  Currently, I&apos;m focused on building interactive web experiences, pursuing strong engineering
                  opportunities, and creating projects that blend technical depth with personality and design.
                </p>
                <p>Explore the island to view projects, experience, and more about me.</p>
              </section>
            </div>
          </div>
        </article>
      )}

      {!isOverviewState && !isTransitioning && (
        <button
          className="scene-back"
          aria-label="Return to overview"
          onClick={() => {
            const exitingCabin = focusTarget === 'cabinInterior';
            if (exitingCabin && !reducedMotion) {
              setCabinTransitionFadeState('fade-out');
            } else {
              setCabinTransitionFadeState('idle');
            }
            setIsCabinDoorOpen(false);
            setIsCabinInteriorRevealed(false);
            setFocusTarget('overview');
            setInteractionState('transitioning');
            setSelectedNoteId(null);
            setSelectedExperienceId(null);
            setIsIntroductionDialogOpen(false);
          }}
        >
          ←
        </button>
      )}

    </main>
  );
}
