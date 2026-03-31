'use client';

import { memo } from 'react';
import type { RefObject } from 'react';
import { Group } from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';

type ProjectNote = {
  id: string;
  position: [number, number, number];
  rotation: number;
  color: string;
};

const PROJECT_NOTES: ProjectNote[] = [
  { id: 'summit-ui', position: [-0.66, 1.94, 0.19], rotation: -0.14, color: '#f5dfa4' },
  { id: 'trail-maps', position: [-0.2, 1.92, 0.19], rotation: -0.03, color: '#efe3b4' },
  { id: 'night-camp', position: [0.26, 1.9, 0.19], rotation: 0.09, color: '#f8e6ad' },
  { id: 'route-planner', position: [-0.36, 1.58, 0.19], rotation: -0.08, color: '#f0dca3' },
  { id: 'gear-check', position: [0.1, 1.56, 0.19], rotation: 0.06, color: '#f7e5b8' }
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
          color={hovered ? '#dcca9f' : PALETTE.billboardFace}
          emissive={hovered ? '#433318' : '#1f180f'}
          emissiveIntensity={hovered ? 0.18 : 0.06}
          flatShading
        />
      </mesh>

      {PROJECT_NOTES.map((note) => (
        <group key={note.id} position={note.position} rotation={[0, 0, note.rotation]}>
          <mesh
            onClick={(event) => {
              if (!notesInteractive) return;
              event.stopPropagation();
              onNoteClick(note.id);
            }}
          >
            <boxGeometry args={[0.38, 0.28, 0.024]} />
            <meshStandardMaterial
              color={note.color}
              emissive={notesInteractive ? '#534212' : '#32270d'}
              emissiveIntensity={notesInteractive ? 0.12 : 0.04}
              flatShading
            />
          </mesh>
          <mesh position={[0.005, 0.11, 0.013]}>
            <sphereGeometry args={[0.017, 6, 6]} />
            <meshStandardMaterial color="#b9a277" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
});
