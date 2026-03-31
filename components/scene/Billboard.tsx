'use client';

import { Html } from '@react-three/drei';
import { memo } from 'react';
import type { RefObject } from 'react';
import { Group } from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { PROJECT_NOTES } from './projectNotes';

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
            <boxGeometry args={[0.42, 0.31, 0.024]} />
            <meshStandardMaterial
              color={note.color}
              emissive={notesInteractive ? '#534212' : '#32270d'}
              emissiveIntensity={notesInteractive ? 0.12 : 0.04}
              flatShading
            />
          </mesh>
          <mesh position={[0.005, 0.122, 0.013]}>
            <sphereGeometry args={[0.017, 6, 6]} />
            <meshStandardMaterial color="#b9a277" flatShading />
          </mesh>
          <Html transform position={[0, -0.01, 0.015]} distanceFactor={1.2} style={{ pointerEvents: "none" }}>
            <div className="note-preview" aria-hidden>
              <img src={note.imageSrc} alt="" />
              <div className="note-scribbles">
                <span />
                <span />
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
});
