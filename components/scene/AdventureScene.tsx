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
import { PROJECT_NOTE_RECORD } from './projectNotes';
import { ANIMATION_CONFIG } from '@/config/sceneConfig';
import { EXPERIENCE_ENTRIES } from './experienceData';
import { makeTimeline } from '@/lib/animation';

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const cabinRef = useRef<Group>(null);
  const tabletsRef = useRef<Group>(null);

  const [interactionState, setInteractionState] = useState<InteractionState>('idleOverview');
  const [focusTarget, setFocusTarget] = useState<'overview' | 'billboard' | 'cabin' | 'tablets'>('overview');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const isTransitioning = interactionState === 'transitioning';
  const isOverviewState =
    interactionState === 'idleOverview' ||
    interactionState === 'hoverBillboard' ||
    interactionState === 'hoverCabin' ||
    interactionState === 'hoverTablets';

  const selectedNote = selectedNoteId ? PROJECT_NOTE_RECORD[selectedNoteId] : null;

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
      setFocusTarget(target);
      setSelectedNoteId(null);
      animateFocusNudge(target);
    },
    [animateFocusNudge, isOverviewState, isTransitioning]
  );

  const closeupLabel = useMemo(() => {
    if (interactionState === 'billboardCloseup') {
      return selectedNote
        ? `${selectedNote.title} selected — open project preview + tech stack.`
        : 'Projects Board: click any post-it to open its image and full scribbled note.';
    }
    if (interactionState === 'cabinCloseup') return 'Cabin Interior: ready for About/Gallery entry transition.';
    if (interactionState === 'tabletsCloseup') return 'Stone Tablets: each tablet now maps to one role from my resume experience section.';
    return null;
  }, [interactionState, selectedNote]);

  const hoverLabel = useMemo(() => {
    if (interactionState === 'hoverCabin') return 'About/Gallery: click the cabin door to go inside.';
    if (interactionState === 'hoverBillboard') return 'Projects: click the board to zoom into project notes.';
    if (interactionState === 'hoverTablets') return 'Experience: click the tablets to navigate the 4-tablet experience.';
    return null;
  }, [interactionState]);

  return (
    <main>
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
                  : focusTarget === 'cabin'
                    ? 'cabinCloseup'
                    : 'tabletsCloseup'
              );
            }}
          />
          <LightingAtmosphere />
          <LowPolyEnvironment
            tabletsInteractiveEnabled={isOverviewState}
            tabletsHovered={interactionState === 'hoverTablets'}
            onTabletsHoverChange={(hovered) => updateHover('tablets', hovered)}
            onTabletsClick={handleFocusClick}
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
        </Suspense>
      </Canvas>

      <header className="scene-brand" aria-label="Site title">
        <span className="scene-brand-cloud scene-brand-cloud--left" />
        <span className="scene-brand-cloud scene-brand-cloud--right" />
        <h1>Ben Goulet</h1>
        <p>an interactive portfolio</p>
      </header>

      <aside className="scene-hud">
        {closeupLabel ?? hoverLabel ?? (
          <span>
            Click the <code>billboard</code> for projects, the <code>tablets</code> for tablet navigation, or the <code>cabin door</code> for about/gallery.
          </span>
        )}
      </aside>

      {interactionState === 'billboardCloseup' && selectedNote && (
        <article
          className="note-detail"
          aria-live="polite"
          onClick={() => setSelectedNoteId(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setSelectedNoteId(null);
            }
          }}
        >
          <div
            className="note-detail-card"
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


      {interactionState === 'tabletsCloseup' && (
        <section className="experience-panel" aria-label="Experience copied from resume">
          <h2>Experience</h2>
          <div className="experience-grid">
            {EXPERIENCE_ENTRIES.map((entry) => (
              <article key={entry.id} className="experience-tablet">
                <h3>{entry.role}</h3>
                <p className="experience-meta">{entry.company}</p>
                <p className="experience-meta">{entry.dateLocation}</p>
                <ul>
                  {entry.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {!isOverviewState && !isTransitioning && (
        <button
          className="scene-back"
          aria-label="Return to overview"
          onClick={() => {
            setFocusTarget('overview');
            setInteractionState('transitioning');
            setSelectedNoteId(null);
          }}
        >
          ←
        </button>
      )}
    </main>
  );
}
