'use client';

import { Html } from '@react-three/drei';
import { memo } from 'react';
import type { RefObject } from 'react';
import { Group } from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';

type ProjectNote = {
  id: string;
  title: string;
  imageLabel: string;
  position: [number, number, number];
  rotation: number;
};

const PROJECT_NOTES: ProjectNote[] = [
  { id: 'summit-ui', title: 'Summit UI', imageLabel: 'UI Preview', position: [-0.74, 1.96, 0.19], rotation: -0.08 },
  { id: 'trail-maps', title: 'Trail Maps', imageLabel: 'Map Shot', position: [-0.08, 1.95, 0.19], rotation: -0.02 },
  { id: 'night-camp', title: 'Night Camp', imageLabel: 'Hero Image', position: [0.58, 1.88, 0.19], rotation: 0.06 },
  { id: 'route-planner', title: 'Route Planner', imageLabel: 'Dashboard', position: [-0.4, 1.52, 0.19], rotation: -0.05 },
  { id: 'gear-check', title: 'Gear Check', imageLabel: 'Mobile View', position: [0.3, 1.54, 0.19], rotation: 0.04 }
];

type BillboardProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  notesInteractive: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
  onNoteClick: (noteId: string) => void;
  billboardRef: RefObject<Group | null>;
};

export const Billboard = memo(function Billboard({
  interactiveEnabled,
  hovered,
  notesInteractive,
  onHoverChange,
  onClick,
  onNoteClick,
  billboardRef
}: BillboardProps) {
  return (
    <group ref={billboardRef} position={SCENE_ANCHORS.billboard} rotation={[0, 0.42, 0]}>
      <mesh position={[-1.04, 0.88, -0.02]} castShadow>
        <boxGeometry args={[0.16, 1.78, 0.16]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} flatShading />
      </mesh>
      <mesh position={[1.04, 0.88, -0.02]} castShadow>
        <boxGeometry args={[0.16, 1.78, 0.16]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} flatShading />
      </mesh>

      <mesh position={[0, 2.38, -0.02]} castShadow>
        <boxGeometry args={[2.38, 0.16, 0.16]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} flatShading />
      </mesh>

      <mesh
        position={[0, 1.72, 0.05]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (interactiveEnabled) onHoverChange(true);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHoverChange(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (interactiveEnabled) onClick();
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.18, 1.46, 0.1]} />
        <meshStandardMaterial
          color={hovered ? '#e2cfab' : PALETTE.billboardFace}
          emissive={hovered ? '#4a3b1f' : '#1f180f'}
          emissiveIntensity={hovered ? 0.3 : 0.09}
          flatShading
        />
      </mesh>

      {PROJECT_NOTES.map((note) => (
        <group key={note.id} position={note.position} rotation={[0, 0, note.rotation]}>
          <mesh
            onPointerDown={(event) => {
              if (!notesInteractive) return;
              event.stopPropagation();
            }}
            onClick={(event) => {
              if (!notesInteractive) return;
              event.stopPropagation();
              onNoteClick(note.id);
            }}
          >
            <boxGeometry args={[0.56, 0.42, 0.03]} />
            <meshStandardMaterial color="#f7e2a9" emissive="#6b5616" emissiveIntensity={0.08} flatShading />
          </mesh>

          <Html
            transform
            distanceFactor={8}
            position={[0, 0, 0.02]}
            style={{
              width: '88px',
              pointerEvents: notesInteractive ? 'auto' : 'none',
              cursor: notesInteractive ? 'pointer' : 'default'
            }}
            onPointerDown={(event) => {
              if (!notesInteractive) return;
              event.stopPropagation();
            }}
            onClick={(event) => {
              if (!notesInteractive) return;
              event.stopPropagation();
              onNoteClick(note.id);
            }}
          >
            <div className="postit-note-content">
              <div className="postit-image-placeholder">{note.imageLabel}</div>
              <p>{note.title}</p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
});
