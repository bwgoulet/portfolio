'use client';

import { memo, useRef } from 'react';
import type { RefObject } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

type CabinProps = {
  interactiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: () => void;
  cabinRef: RefObject<Group | null>;
};

export const Cabin = memo(function Cabin({
  interactiveEnabled,
  hovered,
  onHoverChange,
  onClick,
  cabinRef
}: CabinProps) {
  const { cabin } = VISUAL_TOKENS.scene;
  const engravingRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (hovered || !engravingRef.current) return;
    const t = clock.getElapsedTime();
    engravingRef.current.rotation.z = Math.sin(t * 0.44) * 0.008;
    engravingRef.current.position.y = 0.9 + Math.sin(t * 0.5) * 0.01;
  });

  const handleHoverStart = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (interactiveEnabled) onHoverChange(true);
  };

  const handleHoverEnd = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onHoverChange(false);
  };

  const handleClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    if (interactiveEnabled) onClick();
  };

  return (
    <group ref={cabinRef} position={SCENE_ANCHORS.cabin} rotation={[0, -0.46, 0]}>
      <mesh position={[0, 0.11, 0.03]} castShadow receiveShadow>
        <cylinderGeometry args={[0.94, 1.02, 0.2, 6]} />
        <meshStandardMaterial color={cabin.base} flatShading />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.92, 1.1]} />
        <meshStandardMaterial color={PALETTE.cabinWall} flatShading />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.46, 0.1, 1.2]} />
        <meshStandardMaterial color={cabin.trim} flatShading />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.18, 0.96, 4]} />
        <meshStandardMaterial color={PALETTE.cabinRoof} flatShading />
      </mesh>
      <mesh position={[0.54, 1.18, -0.14]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.18]} />
        <meshStandardMaterial color={cabin.chimney} flatShading />
      </mesh>
      <mesh position={[0, 0.2, 0.67]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.12, 0.3]} />
        <meshStandardMaterial color={cabin.porch} flatShading />
      </mesh>

      <mesh
        position={[0, 0.35, 0.58]}
        onPointerEnter={handleHoverStart}
        onPointerLeave={handleHoverEnd}
        onClick={handleClick}
      >
        <boxGeometry args={[0.36, 0.56, 0.06]} />
        <meshStandardMaterial
          color={PALETTE.cabinDoor}
          emissive={hovered ? cabin.doorHover : cabin.doorIdle}
          emissiveIntensity={hovered ? 0.26 : 0.05}
          flatShading
        />
      </mesh>

      <mesh position={[-0.3, 0.52, 0.57]}>
        <planeGeometry args={[0.22, 0.19]} />
        <meshBasicMaterial color={cabin.windowGlow} />
      </mesh>
      <mesh position={[-0.3, 0.52, 0.565]}>
        <boxGeometry args={[0.26, 0.23, 0.03]} />
        <meshStandardMaterial color={cabin.windowFrame} flatShading />
      </mesh>
      <mesh position={[0.31, 0.52, 0.57]}>
        <planeGeometry args={[0.22, 0.19]} />
        <meshBasicMaterial color={cabin.windowGlow} />
      </mesh>
      <mesh position={[0.31, 0.52, 0.565]}>
        <boxGeometry args={[0.26, 0.23, 0.03]} />
        <meshStandardMaterial color={cabin.windowFrame} flatShading />
      </mesh>

      <mesh
        position={[0, 0.9, 0.62]}
        onPointerEnter={handleHoverStart}
        onPointerLeave={handleHoverEnd}
        onClick={handleClick}
      >
        <planeGeometry args={[0.9, 0.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group ref={engravingRef} position={[0, 0.9, 0.62]} scale={hovered ? 1.1 : 1}>
        <Text
          fontSize={hovered ? 0.11 : 0.098}
          maxWidth={0.9}
          letterSpacing={0.028}
          anchorX="center"
          anchorY="middle"
          color={hovered ? cabin.label : '#7a592f'}
          outlineWidth={hovered ? 0.012 : 0.006}
          outlineColor={hovered ? cabin.labelOutline : '#2d210f'}
        >
          About/Gallery
        </Text>
        <Text
          position={[0.006, -0.004, -0.004]}
          fontSize={hovered ? 0.11 : 0.098}
          maxWidth={0.9}
          letterSpacing={0.028}
          anchorX="center"
          anchorY="middle"
          color={hovered ? cabin.labelSubtle : '#c79b62'}
          fillOpacity={hovered ? 1 : 0.92}
        >
          About/Gallery
        </Text>
      </group>
    </group>
  );
});
