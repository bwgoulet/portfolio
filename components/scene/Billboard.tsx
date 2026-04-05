'use client';

import { Text, useFBX } from '@react-three/drei';
import gsap from 'gsap';
import { memo, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { RefObject } from 'react';
import { Group, MeshStandardMaterial, Mesh } from 'three';
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
  const hoveredNoteIdRef = useRef<string | null>(null);
  const boardMaterialRef = useRef<MeshStandardMaterial>(null);
  const labelRef = useRef<Group>(null);
  const corkboardSource = useFBX('/models/Wall_corkboard_with_post_it_notes.fbx');
  const corkboard = useMemo(() => {
    const clone = corkboardSource.clone();
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [corkboardSource]);

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

      <primitive
        object={corkboard}
        position={[-0.02, 1.72, 0.085]}
        rotation={[0, Math.PI / 2, 0]}
        scale={0.006}
      />
      <mesh position={[0, 1.72, -0.02]}>
        <boxGeometry args={[2.2, 1.5, 0.02]} />
        <meshStandardMaterial
          ref={boardMaterialRef}
          color={hovered ? '#dcca9f' : PALETTE.billboardFace}
          emissive={hovered ? '#433318' : '#1f180f'}
          emissiveIntensity={hovered ? 0.12 : 0.04}
          flatShading
          transparent
          opacity={0.18}
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

useFBX.preload('/models/Wall_corkboard_with_post_it_notes.fbx');
