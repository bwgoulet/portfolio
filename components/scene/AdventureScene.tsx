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
import { ANIMATION_CONFIG } from '@/config/sceneConfig';
import { EXPERIENCE_RECORD } from './experienceData';
import { makeTimeline } from '@/lib/animation';

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const cabinRef = useRef<Group>(null);
  const tabletsRef = useRef<Group>(null);

  const [interactionState, setInteractionState] = useState<InteractionState>('idleOverview');
  const [focusTarget, setFocusTarget] = useState<'overview' | 'billboard' | 'cabinInterior' | 'tablets'>('overview');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const noteTitleId = useId();
  const experienceTitleId = useId();

  const isTransitioning = interactionState === 'transitioning';
  const isDetailDialogOpen = selectedNoteId !== null || selectedExperienceId !== null;
  const isOverviewState =
    interactionState === 'idleOverview' ||
    interactionState === 'hoverBillboard' ||
    interactionState === 'hoverCabin' ||
    interactionState === 'hoverTablets';

  const selectedNote = selectedNoteId ? PROJECT_NOTE_RECORD[selectedNoteId] : null;
  const selectedExperience = selectedExperienceId ? EXPERIENCE_RECORD[selectedExperienceId] : null;

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

  const animateFocusNudge = useCallback((target: InteractiveTarget) => {
    const group = target === 'billboard' ? billboardRef.current : target === 'cabin' ? cabinRef.current : tabletsRef.current;
    if (!group) return;

    const startY = group.position.y;
    const startRotationY = group.rotation.y;

    makeTimeline()
      .to(group.position, {
        y: startY + 0.18,
        duration: ANIMATION_CONFIG.nudgeDuration,
        ease: 'power2.out'
      })
      .to(group.rotation, { y: startRotationY + (target === 'billboard' ? -0.12 : target === 'cabin' ? 0.09 : 0.05), duration: ANIMATION_CONFIG.nudgeDuration, ease: 'sine.out' }, '<')
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
      setFocusTarget(target === 'cabin' ? 'cabinInterior' : target);
      setSelectedNoteId(null);
      setSelectedExperienceId(null);
      animateFocusNudge(target);
    },
    [animateFocusNudge, isOverviewState, isTransitioning]
  );

  return (
    <main>
      <div className={`scene-stage ${isDetailDialogOpen ? 'scene-stage--locked' : ''}`} aria-hidden={isDetailDialogOpen}>
        <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.7]} gl={{ alpha: false }}>
          <Suspense fallback={null}>
          <CameraRig
            targetKey={focusTarget}
            isTransitioning={isTransitioning}
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
      </div>

      <header className="scene-brand" aria-label="Site title">
        <span className="scene-brand-cloud scene-brand-cloud--left" />
        <span className="scene-brand-cloud scene-brand-cloud--right" />
        <h1>Ben Goulet</h1>
        <p>an interactive portfolio</p>
      </header>

      {isOverviewState && !isTransitioning && (
        <section className="scene-hotspots" aria-label="Scene quick actions">
          <button className="scene-hotspot" onClick={() => handleFocusClick('billboard')}>
            Open Projects board
          </button>
          <button className="scene-hotspot" onClick={() => handleFocusClick('cabin')}>
            Enter About/Gallery cabin
          </button>
          <button className="scene-hotspot" onClick={() => handleFocusClick('tablets')}>
            Open Experience tablets
          </button>
        </section>
      )}

      {interactionState === 'billboardCloseup' && selectedNote && (
        <article
          className="note-detail"
          aria-live="polite"
          onClick={closeNoteDialog}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeNoteDialog();
            }
          }}
        >
          <div
            ref={modalRef}
            className="note-detail-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={noteTitleId}
            tabIndex={-1}
          >
            <button className="detail-close" onClick={closeNoteDialog} aria-label="Close project details">
              Close
            </button>
            <img src={selectedNote.imageSrc} alt={`${selectedNote.title} post-it sketch`} />
            <h2 id={noteTitleId}>{selectedNote.title}</h2>
            <p>{selectedNote.detail}</p>
          </div>
        </article>
      )}

      {interactionState === 'tabletsCloseup' && selectedExperience && (
        <article
          className="note-detail"
          aria-live="polite"
          onClick={closeExperienceDialog}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              closeExperienceDialog();
            }
          }}
        >
          <div
            ref={modalRef}
            className="experience-detail-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={experienceTitleId}
            tabIndex={-1}
          >
            <button className="detail-close" onClick={closeExperienceDialog} aria-label="Close experience details">
              Close
            </button>
            <h2 id={experienceTitleId}>{selectedExperience.role}</h2>
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

      {interactionState === 'billboardCloseup' && !selectedNote && (
        <section className="detail-actions" aria-label="Project note actions">
          {Object.values(PROJECT_NOTE_RECORD).map((note) => (
            <button
              key={note.id}
              className="detail-action"
              onClick={(event) => {
                lastTriggerRef.current = event.currentTarget;
                setSelectedNoteId(note.id);
              }}
            >
              {note.title}
            </button>
          ))}
        </section>
      )}

      {interactionState === 'tabletsCloseup' && !selectedExperience && (
        <section className="detail-actions" aria-label="Experience entry actions">
          {Object.values(EXPERIENCE_RECORD).map((entry) => (
            <button
              key={entry.id}
              className="detail-action"
              onClick={(event) => {
                lastTriggerRef.current = event.currentTarget;
                setSelectedExperienceId(entry.id);
              }}
            >
              {entry.role}
            </button>
          ))}
        </section>
      )}
    </main>
  );
}
