'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Image from 'next/image';
import { Suspense, useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react';
import type { Group } from 'three';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Billboard } from './Billboard';
import { Cabin } from './Cabin';
import { CameraRig } from './CameraRig';
import { LightingAtmosphere } from './LightingAtmosphere';
import { LowPolyEnvironment } from './LowPolyEnvironment';
import { InteractionState, InteractiveTarget } from './types';
import { CABIN_INTERIOR_ARTWORKS, CabinInterior, GALLERY_PHOTOS } from './CabinInterior';
import { PROJECT_NOTE_RECORD } from './projectNotes';
import { EXPERIENCE_RECORD } from './experienceData';
import { makeTimeline } from '@/lib/animation';
import { FocusTarget, MOTION_TIERS } from '@/config/sceneConfig';
import { IntroductionLandmark } from './IntroductionLandmark';

const FREE_MODE_VIEW_PRESETS: Record<'overview' | 'cabinInterior', { position: [number, number, number]; lookAt: [number, number, number] }> = {
  overview: {
    position: [-10.2, 9.2, 14.3],
    lookAt: [0.25, 1.75, -2.9]
  },
  cabinInterior: {
    position: [4.9, 4.3, 2.4],
    lookAt: [4.35, 2.2, -1.45]
  }
};

function FreeModeCameraPositioner({
  enabled,
  focusTarget
}: {
  enabled: boolean;
  focusTarget: FocusTarget;
}) {
  const camera = useThree((state) => state.camera);
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    if (enabled && !wasEnabledRef.current && (focusTarget === 'overview' || focusTarget === 'cabinInterior')) {
      const preset = FREE_MODE_VIEW_PRESETS[focusTarget];
      camera.position.set(...preset.position);
      camera.lookAt(...preset.lookAt);
      camera.updateProjectionMatrix();
    }
    wasEnabledRef.current = enabled;
  }, [camera, enabled, focusTarget]);

  return null;
}

function FreeModeKeyboardPan({
  enabled,
  controlsRef
}: {
  enabled: boolean;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const pressedKeysRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false
  });

  useEffect(() => {
    if (!enabled) {
      pressedKeysRef.current = { left: false, right: false, up: false, down: false };
      return;
    }

    const updateKeyState = (event: KeyboardEvent, isPressed: boolean) => {
      const eventTarget = event.target;
      if (
        eventTarget instanceof HTMLElement &&
        (eventTarget.tagName === 'INPUT' || eventTarget.tagName === 'TEXTAREA' || eventTarget.tagName === 'SELECT')
      ) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        pressedKeysRef.current.left = isPressed;
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        pressedKeysRef.current.right = isPressed;
        event.preventDefault();
      } else if (event.key === 'ArrowUp') {
        pressedKeysRef.current.up = isPressed;
        event.preventDefault();
      } else if (event.key === 'ArrowDown') {
        pressedKeysRef.current.down = isPressed;
        event.preventDefault();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => updateKeyState(event, true);
    const onKeyUp = (event: KeyboardEvent) => updateKeyState(event, false);
    const clearKeys = () => {
      pressedKeysRef.current = { left: false, right: false, up: false, down: false };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearKeys);
      clearKeys();
    };
  }, [enabled]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const controls = controlsRef.current;
    if (!controls) return;
    const { left, right, up, down } = pressedKeysRef.current;
    if (!left && !right && !up && !down) return;

    const camera = controls.object;
    const moveSpeedPerSecond = 7;
    const step = moveSpeedPerSecond * delta;
    const moveDirection = new Vector3((right ? 1 : 0) - (left ? 1 : 0), 0, (up ? 1 : 0) - (down ? 1 : 0));
    if (moveDirection.lengthSq() === 0) return;
    moveDirection.normalize();

    const forward = new Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() > 0) {
      forward.normalize();
    }

    const rightVector = new Vector3().crossVectors(forward, camera.up).normalize();
    const panOffset = rightVector.multiplyScalar(moveDirection.x).add(forward.multiplyScalar(moveDirection.z)).multiplyScalar(step);

    camera.position.add(panOffset);
    controls.target.add(panOffset);
    controls.update();
  });

  return null;
}

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
  const [selectedGalleryPhotoId, setSelectedGalleryPhotoId] = useState<string | null>(null);
  const [closingNoteId, setClosingNoteId] = useState<string | null>(null);
  const [closingExperienceId, setClosingExperienceId] = useState<string | null>(null);
  const [isIntroductionDialogOpen, setIsIntroductionDialogOpen] = useState(false);
  const [isIntroductionCloseupHovered, setIsIntroductionCloseupHovered] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isTimelineCloseupHovered, setIsTimelineCloseupHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCabinInteriorRevealed, setIsCabinInteriorRevealed] = useState(false);
  const [isCabinDoorOpen, setIsCabinDoorOpen] = useState(false);
  const [cabinTransitionFadeState, setCabinTransitionFadeState] = useState<'idle' | 'fade-out' | 'black' | 'fade-in'>('idle');
  const [isCabinFadePending, setIsCabinFadePending] = useState(false);
  const [isCabinExitTransitionPending, setIsCabinExitTransitionPending] = useState(false);
  const [isFreeModeEnabled, setIsFreeModeEnabled] = useState(false);
  const freeModeControlsRef = useRef<OrbitControlsImpl>(null);
  const cabinFadeTimerRef = useRef<number | null>(null);
  const cabinExitTimerRef = useRef<number | null>(null);

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
  const isDetailDialogOpen =
    selectedNoteId !== null ||
    selectedExperienceId !== null ||
    selectedGalleryPhotoId !== null ||
    isIntroductionDialogOpen ||
    isTimelineDialogOpen;
  const isOverviewState =
    interactionState === 'idleOverview' ||
    interactionState === 'hoverBillboard' ||
    interactionState === 'hoverCabin' ||
    interactionState === 'hoverTablets' ||
    interactionState === 'hoverIntroduction' ||
    interactionState === 'hoverTimeline';
  const canToggleFreeMode =
    !isDetailDialogOpen &&
    !isTransitioning &&
    !isCabinExitTransitionPending &&
    (focusTarget === 'overview' || focusTarget === 'cabinInterior');

  const activeNoteId = selectedNoteId ?? closingNoteId;
  const activeExperienceId = selectedExperienceId ?? closingExperienceId;
  const selectedNote = activeNoteId ? PROJECT_NOTE_RECORD[activeNoteId] : null;
  const selectedExperience = activeExperienceId ? EXPERIENCE_RECORD[activeExperienceId] : null;
  const selectedGalleryPhoto = selectedGalleryPhotoId
    ? [...GALLERY_PHOTOS, ...CABIN_INTERIOR_ARTWORKS].find((photo) => photo.id === selectedGalleryPhotoId) ?? null
    : null;

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

  const closeGalleryDetail = useCallback(() => {
    setSelectedGalleryPhotoId(null);
  }, []);

  const closeTimelineDialog = useCallback(() => {
    setIsTimelineDialogOpen(false);
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

  const updateHover = useCallback((target: InteractiveTarget, hovered: boolean) => {
    setInteractionState((currentState) => {
      const isCurrentOverviewState =
        currentState === 'idleOverview' ||
        currentState === 'hoverBillboard' ||
        currentState === 'hoverCabin' ||
        currentState === 'hoverTablets' ||
        currentState === 'hoverIntroduction' ||
        currentState === 'hoverTimeline';

      if (!isCurrentOverviewState) return currentState;
      if (!hovered) return 'idleOverview';

      return target === 'billboard'
        ? 'hoverBillboard'
        : target === 'cabin'
          ? 'hoverCabin'
          : target === 'tablets'
            ? 'hoverTablets'
            : target === 'introduction'
              ? 'hoverIntroduction'
              : 'hoverTimeline';
    });
  }, []);

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

      setIsFreeModeEnabled(false);
      setInteractionState('transitioning');
      setFocusTarget(target === 'cabin' ? 'cabinInterior' : target);
      setIsCabinInteriorRevealed(false);
      setIsCabinDoorOpen(target === 'cabin');
      setSelectedNoteId(null);
      setSelectedExperienceId(null);
      setSelectedGalleryPhotoId(null);
      setIsIntroductionDialogOpen(false);
      setIsTimelineDialogOpen(false);
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
      if (cabinExitTimerRef.current !== null) {
        window.clearTimeout(cabinExitTimerRef.current);
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

  useEffect(() => {
    if (interactionState !== 'timelineCloseup') {
      setIsTimelineCloseupHovered(false);
    }
  }, [interactionState]);

  const detailCardStateClass = (isClosing: boolean) =>
    reducedMotion ? 'motion-reduced' : isClosing ? 'anim-exit' : 'anim-enter';

  const beginOverviewTransition = useCallback(() => {
    setIsFreeModeEnabled(false);
    setIsCabinDoorOpen(false);
    setIsCabinInteriorRevealed(false);
    setFocusTarget('overview');
    setInteractionState('transitioning');
    setSelectedNoteId(null);
    setSelectedExperienceId(null);
    setSelectedGalleryPhotoId(null);
    setIsIntroductionDialogOpen(false);
    setIsTimelineDialogOpen(false);
  }, []);

  const handleReturnToOverview = useCallback(() => {
    const exitingCabin = focusTarget === 'cabinInterior';
    if (exitingCabin && !reducedMotion) {
      if (isCabinExitTransitionPending) return;
      setIsCabinExitTransitionPending(true);
      setCabinTransitionFadeState('fade-out');
      if (cabinExitTimerRef.current !== null) {
        window.clearTimeout(cabinExitTimerRef.current);
      }
      cabinExitTimerRef.current = window.setTimeout(() => {
        setCabinTransitionFadeState('black');
        setIsCabinExitTransitionPending(false);
        beginOverviewTransition();
        cabinExitTimerRef.current = null;
      }, 240);
      return;
    }
    setCabinTransitionFadeState('idle');
    beginOverviewTransition();
  }, [beginOverviewTransition, focusTarget, isCabinExitTransitionPending, reducedMotion]);

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
              if (progress < 0.99) return;
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
                if (!reducedMotion && (cabinTransitionFadeState === 'fade-out' || cabinTransitionFadeState === 'black')) {
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
          <FreeModeCameraPositioner enabled={isFreeModeEnabled} focusTarget={focusTarget} />
          <FreeModeKeyboardPan enabled={isFreeModeEnabled} controlsRef={freeModeControlsRef} />
          {isFreeModeEnabled && (
            <OrbitControls
              ref={freeModeControlsRef}
              enableDamping
              dampingFactor={0.08}
              minDistance={1.4}
              maxDistance={42}
              enablePan
              panSpeed={0.9}
              zoomSpeed={0.85}
              screenSpacePanning={false}
              maxPolarAngle={Math.PI * 0.47}
              minPolarAngle={Math.PI * 0.14}
              target={
                focusTarget === 'cabinInterior'
                  ? [0.35, 1.15, -1.4]
                  : [0.2, 0.9, 0.5]
              }
            />
          )}
          <LightingAtmosphere backgroundColor={focusTarget === 'cabinInterior' && !isCabinInteriorRevealed ? '#060709' : undefined} />
          <LowPolyEnvironment
            tabletsInteractiveEnabled={isOverviewState && !isFreeModeEnabled}
            tabletsDetailInteractiveEnabled={interactionState === 'tabletsCloseup'}
            tabletsHovered={interactionState === 'hoverTablets' || interactionState === 'tabletsCloseup'}
            onTabletsHoverChange={(hovered) => updateHover('tablets', hovered)}
            onTabletsClick={handleFocusClick}
            onTabletDetailSelect={(entryId) => setSelectedExperienceId(entryId)}
            tabletsRef={tabletsRef}
            timelineSignRef={timelineSignRef}
            timelineInteractiveEnabled={!isFreeModeEnabled && (isOverviewState || interactionState === 'timelineCloseup')}
            timelineHovered={interactionState === 'hoverTimeline' || isTimelineCloseupHovered}
            onTimelineHoverChange={(hovered) => {
              if (interactionState === 'timelineCloseup') {
                setIsTimelineCloseupHovered(hovered);
                return;
              }
              updateHover('timeline', hovered);
            }}
            onTimelineClick={(target) => {
              if (interactionState === 'timelineCloseup') {
                setIsTimelineDialogOpen(true);
                return;
              }
              handleFocusClick(target);
            }}
            reducedMotion={reducedMotion}
          />
          <IntroductionLandmark
            landmarkRef={introductionRef}
            interactiveEnabled={!isFreeModeEnabled && (isOverviewState || interactionState === 'introductionCloseup')}
            hoverEnabled={!isFreeModeEnabled && (isOverviewState || interactionState === 'introductionCloseup')}
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
            interactiveEnabled={isOverviewState && !isFreeModeEnabled}
            notesInteractive={interactionState === 'billboardCloseup'}
            hovered={interactionState === 'hoverBillboard'}
            onHoverChange={(hovered) => updateHover('billboard', hovered)}
            onClick={() => handleFocusClick('billboard')}
            onNoteClick={(noteId) => setSelectedNoteId(noteId)}
            detailOpen={selectedNoteId !== null}
            hideThumbnails={cabinTransitionFadeState !== 'idle'}
            reducedMotion={reducedMotion}
          />
          {!isCabinInteriorRevealed && (
            <Cabin
              cabinRef={cabinRef}
              interactiveEnabled={isOverviewState && !isFreeModeEnabled}
              hovered={interactionState === 'hoverCabin'}
              isDoorOpen={isCabinDoorOpen}
              onHoverChange={(hovered) => updateHover('cabin', hovered)}
              onClick={() => handleFocusClick('cabin')}
            />
          )}
          {focusTarget === 'cabinInterior' && isCabinInteriorRevealed && (
            <CabinInterior
              photosInteractive={interactionState === 'cabinCloseup' && !isFreeModeEnabled}
              onPhotoSelect={(photoId) => setSelectedGalleryPhotoId(photoId)}
            />
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
            <Image src={selectedNote.detailImageSrc} alt={`${selectedNote.title} thumbnail`} width={720} height={380} />
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
              <h3>Personal Relevance</h3>
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
            <Image src={selectedExperience.detailImageSrc} alt={`${selectedExperience.company} thumbnail`} width={720} height={380} />
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
              <h3>Personal Relevance</h3>
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
            <div className="introduction-detail-layout">
              <Image src="/introimage.png" alt="Introduction thumbnail" width={520} height={460} />
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

      {interactionState === 'timelineCloseup' && isTimelineDialogOpen && (
        <article
          className={`note-detail ${detailCardStateClass(false)}`}
          aria-live="polite"
          onClick={closeTimelineDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeTimelineDialog();
            }
          }}
        >
          <div
            className={`detail-content-card introduction-detail-card ${detailCardStateClass(false)}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeline-title"
            tabIndex={-1}
          >
            <div className="introduction-detail-layout">
              <Image src="/projects/timeline.png" alt="Timeline thumbnail" width={520} height={460} />
              <section className="introduction-detail-copy">
                <h2 id="timeline-title">Timeline</h2>
                <p>
                  This trail marks key chapters of my journey as a builder, from early curiosity to internships,
                  leadership roles, and personal projects.
                </p>
                <p>
                  I designed this section to show how each experience built on the last one and shaped the way I
                  approach engineering today.
                </p>
                <p>More timeline milestones and stories are coming soon.</p>
              </section>
            </div>
          </div>
        </article>
      )}

      {interactionState === 'cabinCloseup' && selectedGalleryPhoto && (
        <article
          className={`note-detail ${detailCardStateClass(false)}`}
          aria-live="polite"
          onClick={closeGalleryDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeGalleryDetail();
            }
          }}
        >
          <div
            className={`detail-content-card gallery-detail-card ${detailCardStateClass(false)}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-title"
            tabIndex={-1}
          >
            <Image src={selectedGalleryPhoto.imageSrc} alt={selectedGalleryPhoto.title} width={720} height={480} />
            <h2 id="gallery-title">{selectedGalleryPhoto.title}</h2>
            <p>{selectedGalleryPhoto.description}</p>
          </div>
        </article>
      )}

      {!isOverviewState && !isTransitioning && !isCabinExitTransitionPending && (
        <button
          className="scene-back"
          aria-label="Return to overview"
          onClick={handleReturnToOverview}
        >
          ←
        </button>
      )}
      {canToggleFreeMode && (
        <button
          className={`scene-free-mode ${isFreeModeEnabled ? 'is-enabled' : ''}`}
          type="button"
          aria-pressed={isFreeModeEnabled}
          onClick={() => setIsFreeModeEnabled((current) => !current)}
        >
          Free Mode: {isFreeModeEnabled ? 'On' : 'Off'}
        </button>
      )}

    </main>
  );
}
