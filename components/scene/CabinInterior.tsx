'use client';

import { memo, useMemo } from 'react';
import * as THREE from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

const PHOTO_LAYOUT = [
  [-0.64, 1.42, -0.78],
  [-0.38, 1.56, -0.78],
  [-0.12, 1.44, -0.78],
  [0.14, 1.58, -0.78],
  [0.4, 1.45, -0.78],
  [0.66, 1.56, -0.78],
  [-0.5, 1.22, -0.78],
  [-0.22, 1.1, -0.78],
  [0.06, 1.24, -0.78],
  [0.34, 1.1, -0.78],
  [0.62, 1.25, -0.78]
] as const;

const PHOTO_COLORS = VISUAL_TOKENS.scene.cabinInterior.photoPalette;
const FLOOR_PLANK_X = [-0.73, -0.37, -0.01, 0.35, 0.71] as const;

export const CabinInterior = memo(function CabinInterior() {
  const { cabinInterior } = VISUAL_TOKENS.scene;
  const woodFloorTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = cabinInterior.floorPlankA;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const plankWidth = canvas.width / 6;
    for (let plank = 0; plank < 6; plank += 1) {
      const startX = plank * plankWidth;
      context.fillStyle = plank % 2 === 0 ? cabinInterior.floorPlankA : cabinInterior.floorPlankB;
      context.fillRect(startX, 0, plankWidth, canvas.height);

      context.fillStyle = cabinInterior.floorPlankSeam;
      context.fillRect(startX, 0, 4, canvas.height);

      for (let y = 0; y < canvas.height; y += 9) {
        const wave = Math.sin((y + plank * 17) * 0.04) * 8;
        context.fillStyle = `rgba(32, 18, 10, ${0.08 + ((plank + y) % 5) * 0.02})`;
        context.fillRect(startX + plankWidth * 0.14 + wave, y, plankWidth * 0.74, 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.1, 1.45);
    texture.anisotropy = 4;
    return texture;
  }, [cabinInterior.floorPlankA, cabinInterior.floorPlankB, cabinInterior.floorPlankSeam]);

  return (
    <group position={SCENE_ANCHORS.cabin} rotation={[0, -0.46, 0]} scale={1.28}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1.86, 0.04, 1.52]} />
        <meshStandardMaterial color={cabinInterior.floor} flatShading />
      </mesh>
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.84, 1.5]} />
        <meshStandardMaterial color={cabinInterior.floorPlankA} map={woodFloorTexture ?? undefined} roughness={0.92} metalness={0.02} />
      </mesh>

      <mesh position={[0, 0.94, -0.8]} receiveShadow>
        <boxGeometry args={[1.86, 1.8, 0.08]} />
        <meshStandardMaterial color={cabinInterior.wallBack} flatShading />
      </mesh>

      <mesh position={[-0.89, 0.94, -0.08]} receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.52]} />
        <meshStandardMaterial color={cabinInterior.wallSide} flatShading />
      </mesh>

      <mesh position={[0.89, 0.94, -0.08]} receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.52]} />
        <meshStandardMaterial color={cabinInterior.wallSide} flatShading />
      </mesh>

      <mesh position={[0, 1.82, -0.08]} receiveShadow>
        <boxGeometry args={[1.86, 0.08, 1.52]} />
        <meshStandardMaterial color={cabinInterior.wallSide} flatShading />
      </mesh>

      <mesh position={[-0.63, 0.45, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color={cabinInterior.tableTop} flatShading />
      </mesh>
      <mesh position={[-0.63, 0.39, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.05, 0.44]} />
        <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
      </mesh>
      {[
        [-0.84, -0.34],
        [-0.84, 0.1],
        [-0.42, -0.34],
        [-0.42, 0.1]
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.225, z]} castShadow receiveShadow>
          <boxGeometry args={[0.05, 0.33, 0.05]} />
          <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
        </mesh>
      ))}
      {[
        [0.0, -0.34],
        [0.0, 0.1]
      ].map(([xOffset, z]) => (
        <mesh key={`${xOffset}-${z}`} position={[-0.63 + xOffset, 0.26, z]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.03, 0.03]} />
          <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
        </mesh>
      ))}

      <group position={[-0.63, 0.62, -0.12]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.28, 0.26, 0.26]} />
          <meshStandardMaterial color={'#b8b3a8'} flatShading />
        </mesh>
        <mesh position={[0, 0.03, 0.11]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.18, 0.05]} />
          <meshStandardMaterial color={'#8e8a82'} flatShading />
        </mesh>
        <mesh position={[0, -0.105, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.035, 0.12]} />
          <meshStandardMaterial color={'#a6a097'} flatShading />
        </mesh>
        <mesh position={[0, -0.125, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.21, 0.02, 0.18]} />
          <meshStandardMaterial color={'#8e8a82'} flatShading />
        </mesh>
        <mesh position={[0, 0.035, 0.137]} castShadow>
          <boxGeometry args={[0.19, 0.135, 0.01]} />
          <meshStandardMaterial color={'#2f353a'} flatShading />
        </mesh>
        <mesh position={[0, 0.04, 0.143]}>
          <planeGeometry args={[0.145, 0.1]} />
          <meshStandardMaterial
            color={'#85f2ca'}
            emissive={'#2bb989'}
            emissiveIntensity={0.55}
          />
        </mesh>
        {[-0.05, -0.02, 0.01, 0.04].map((x) => (
          <mesh key={x} position={[x, -0.04, 0.136]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.01, 12]} />
            <meshStandardMaterial color={'#45484c'} flatShading />
          </mesh>
        ))}
        <mesh position={[-0.08, -0.04, 0.136]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.01, 12]} />
          <meshStandardMaterial color={'#b84e44'} flatShading />
        </mesh>
      </group>

      {PHOTO_LAYOUT.map((position, index) => (
        <group key={`${position[0]}-${position[1]}`} position={position} rotation={[0, 0, (index % 3 - 1) * 0.08]}>
          <mesh>
            <planeGeometry args={[0.16, 0.11]} />
            <meshBasicMaterial color={PHOTO_COLORS[index % PHOTO_COLORS.length]} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[0.175, 0.125]} />
            <meshStandardMaterial color={PALETTE.cabinWall} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
});
