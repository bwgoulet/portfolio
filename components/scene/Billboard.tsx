'use client';

import { Html, Text } from '@react-three/drei';
import gsap from 'gsap';
import Image from 'next/image';
import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Group, MeshStandardMaterial } from 'three';
import { MOTION_TIERS, PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';
import { PROJECT_NOTES } from './projectNotes';

const setInteractiveCursor = (isPointer: boolean) => {
  document.body.style.cursor = isPointer ? 'pointer' : 'auto';
};

type BillboardProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  notesInteractive: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
  onNoteClick: (noteId: string) => void;
  detailOpen: boolean;
  hideThumbnails: boolean;
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
  hideThumbnails,
  billboardRef,
  reducedMotion
}: BillboardProps) {
  const billboard = VISUAL_TOKENS.scene.billboard;
  const noteRefs = useRef<Record<string, Group | null>>({});
  const hoveredNoteIdRef = useRef<string | null>(null);
  const boardMaterialRef = useRef<MeshStandardMaterial>(null);
  const labelRef = useRef<Group>(null);

  const startNoteHover = (noteId: string) => {
    if (!notesInteractive || hoveredNoteIdRef.current === noteId) return;
    hoveredNoteIdRef.current = noteId;
    setInteractiveCursor(true);
    const note = PROJECT_NOTES.find((entry) => entry.id === noteId);
    const group = noteRefs.current[noteId];
    if (!group || !note) return;
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    gsap.to(group.scale, { x: 1.08, y: 1.08, z: 1.08, duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
    gsap.to(group.position, { z: note.position[2] + 0.028, duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
  };

  const endNoteHover = (noteId: string) => {
    if (hoveredNoteIdRef.current !== noteId) return;
    hoveredNoteIdRef.current = null;
    setInteractiveCursor(false);
    const note = PROJECT_NOTES.find((entry) => entry.id === noteId);
    const group = noteRefs.current[noteId];
    if (!group || !note) return;
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
    gsap.to(group.position, { z: note.position[2], duration: MOTION_TIERS.micro.hoverPopDuration, ease: MOTION_TIERS.micro.ease });
  };

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
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.18, 1.46, 0.1]} />
        <meshStandardMaterial
          ref={boardMaterialRef}
          color={hovered ? '#dcca9f' : PALETTE.billboardFace}
          emissive={hovered ? '#433318' : '#1f180f'}
          emissiveIntensity={hovered ? 0.18 : 0.06}
          flatShading
        />
      </mesh>
      <mesh
        position={[0, 1.72, 0.11]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (interactiveEnabled) {
            onHoverChange(true);
            setInteractiveCursor(true);
          }
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHoverChange(false);
          setInteractiveCursor(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (interactiveEnabled) onClick();
        }}
      >
        <boxGeometry args={[2.24, 1.52, 0.16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
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
            <mesh>
              <boxGeometry args={[0.38, 0.28, 0.024]} />
              <meshStandardMaterial
                color={note.color}
                emissive={notesInteractive ? billboard.noteEmissiveActive : billboard.noteEmissiveIdle}
                emissiveIntensity={notesInteractive ? 0.12 : 0.04}
                flatShading
              />
            </mesh>
            <mesh position={[0.005, 0.11, 0.013]}>
              <sphereGeometry args={[0.017, 6, 6]} />
              <meshStandardMaterial color={billboard.notePin} flatShading />
            </mesh>
              <Html
                transform
                position={[0, -0.01, 0.015]}
                distanceFactor={1.2}
                zIndexRange={[2, 0]}
                pointerEvents="none"
                style={{ opacity: hideThumbnails ? 0 : 1 }}
              >
              <div className="note-preview" aria-hidden>
                <Image
                  src={note.imageSrc}
                  alt=""
                  width={130}
                  height={94}
                  sizes="65px"
                  quality={95}
                />
              </div>
            </Html>
            <mesh
              position={[0, 0, 0.03]}
              onPointerEnter={(event) => {
                if (notesInteractive) event.stopPropagation();
                startNoteHover(note.id);
              }}
              onPointerMove={(event) => {
                if (notesInteractive) event.stopPropagation();
                startNoteHover(note.id);
              }}
              onPointerLeave={(event) => {
                if (notesInteractive) event.stopPropagation();
                endNoteHover(note.id);
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
              <boxGeometry args={[0.46, 0.36, 0.08]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        ))}
    </group>
  );
});
