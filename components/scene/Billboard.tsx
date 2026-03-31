'use client';

import { Html, Text } from '@react-three/drei';
import gsap from 'gsap';
import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { MOTION_TIERS, PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';
import { PROJECT_NOTES } from './projectNotes';

type BillboardProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  notesInteractive: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
  onNoteClick: (noteId: string) => void;
  detailOpen: boolean;
  billboardRef: RefObject<Group | null>;
  reducedMotion: boolean;
};

export const Billboard = memo(function Billboard({
  interactiveEnabled,
  hovered,
  notesInteractive,
  onHoverChange,
  onClick,
  onNoteClick,
  detailOpen,
  billboardRef,
  reducedMotion
}: BillboardProps) {
  const billboard = VISUAL_TOKENS.scene.billboard;
  const noteRefs = useRef<Record<string, Group | null>>({});
  const boardMaterialRef = useRef<MeshStandardMaterial>(null);
  const labelRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!reducedMotion && boardMaterialRef.current && !hovered) {
      const pulse = (Math.sin(clock.getElapsedTime() * 3.5) + 1) * 0.5;
      boardMaterialRef.current.emissiveIntensity = 0.06 + pulse * 0.015;
    }
    if (hovered || reducedMotion || !labelRef.current) return;
    const t = clock.getElapsedTime();
    labelRef.current.rotation.z = Math.sin(t * 0.42) * 0.01;
    labelRef.current.position.y = 2.26 + Math.sin(t * 0.48) * 0.015;
  });
  return (
    <group ref={billboardRef} position={SCENE_ANCHORS.billboard} rotation={[0, 0.42, 0]}>
      <mesh position={[-1.04, 0.88, -0.02]} castShadow>
        <boxGeometry args={[0.16, 1.78, 0.16]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} roughness={0.72} metalness={0.08} flatShading />
      </mesh>
      <mesh position={[1.04, 0.88, -0.02]} castShadow>
        <boxGeometry args={[0.16, 1.78, 0.16]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} roughness={0.72} metalness={0.08} flatShading />
      </mesh>
      <mesh position={[0, 2.38, -0.02]} castShadow>
        <boxGeometry args={[2.38, 0.16, 0.16]} />
        <meshStandardMaterial color={PALETTE.billboardFrame} roughness={0.72} metalness={0.08} flatShading />
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
          ref={boardMaterialRef}
          color={hovered ? '#dcca9f' : PALETTE.billboardFace}
          emissive={hovered ? PALETTE.brandAccent : '#1f180f'}
          emissiveIntensity={hovered ? 0.14 : 0.05}
          roughness={0.58}
          metalness={0.04}
          flatShading
        />
      </mesh>


      <group ref={labelRef} position={[0, 2.26, 0.106]} rotation={[0, 0, -0.02]} scale={hovered ? 1.14 : 1}>
        <Text
          fontSize={hovered ? 0.158 : 0.14}
          letterSpacing={0.045}
          anchorX="center"
          anchorY="middle"
          color={hovered ? billboard.titlePrimaryHover : billboard.titlePrimaryIdle}
          outlineWidth={hovered ? 0.012 : 0.006}
          outlineColor={hovered ? billboard.titlePrimaryOutlineHover : billboard.titlePrimaryOutlineIdle}
        >
          Projects
        </Text>
        <Text
          position={[0.008, -0.005, -0.004]}
          fontSize={hovered ? 0.158 : 0.14}
          letterSpacing={0.045}
          anchorX="center"
          anchorY="middle"
          color={hovered ? billboard.titleSecondaryHover : billboard.titleSecondaryIdle}
          fillOpacity={hovered ? 1 : 0.92}
        >
          Projects
        </Text>
      </group>
      {!detailOpen &&
        PROJECT_NOTES.map((note) => (
          <group
            key={note.id}
            position={note.position}
            rotation={[0, 0, note.rotation]}
            ref={(group) => {
              noteRefs.current[note.id] = group;
            }}
          >
            <mesh
              onPointerEnter={(event) => {
                if (!notesInteractive) return;
                event.stopPropagation();
                const group = noteRefs.current[note.id];
                if (!group) return;
                gsap.to(group.scale, { x: 1.08, y: 1.08, z: 1.08, duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
                gsap.to(group.position, { z: note.position[2] + 0.028, duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
              }}
              onPointerLeave={(event) => {
                if (!notesInteractive) return;
                event.stopPropagation();
                const group = noteRefs.current[note.id];
                if (!group) return;
                gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
                gsap.to(group.position, { z: note.position[2], duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
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
              <boxGeometry args={[0.38, 0.28, 0.024]} />
              <meshStandardMaterial
                color={note.color}
                emissive={notesInteractive ? '#3d6558' : '#32270d'}
                emissiveIntensity={notesInteractive ? 0.07 : 0.03}
                roughness={0.74}
                metalness={0.03}
                flatShading
              />
            </mesh>
            <mesh position={[0.005, 0.11, 0.013]}>
              <sphereGeometry args={[0.017, 6, 6]} />
              <meshStandardMaterial color={billboard.notePin} flatShading />
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
