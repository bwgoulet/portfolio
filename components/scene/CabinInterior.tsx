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

      <mesh position={[0, 0.03, -0.08]} receiveShadow>
        <boxGeometry args={[1.06, 0.015, 0.9]} />
        <meshStandardMaterial color={cabinInterior.rug} flatShading />
      </mesh>
      {[-0.26, 0, 0.26].map((x) => (
        <mesh key={`rug-stripe-${x}`} position={[x, 0.04, -0.08]} receiveShadow>
          <boxGeometry args={[0.1, 0.008, 0.84]} />
          <meshStandardMaterial color={cabinInterior.rugStripe} flatShading />
        </mesh>
      ))}

      <mesh position={[-0.67, 0.42, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.08, 0.86]} />
        <meshStandardMaterial color={cabinInterior.tableTop} flatShading />
      </mesh>
      {[-0.44, -0.16, 0.12].map((z) => (
        <mesh key={z} position={[-0.71, 0.23, z]} castShadow receiveShadow>
          <boxGeometry args={[0.06, 0.38, 0.06]} />
          <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
        </mesh>
      ))}

      <group position={[-0.67, 0.56, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.2, 0.18]} />
          <meshStandardMaterial color={cabinInterior.monitorBody} flatShading />
        </mesh>
        <mesh position={[0, -0.01, 0.095]}>
          <planeGeometry args={[0.2, 0.12]} />
          <meshBasicMaterial color={cabinInterior.monitorScreen} />
        </mesh>
      </group>

      {[-0.44, 0.44].map((x) => (
        <group key={`sconce-${x}`} position={[x, 1.3, -0.75]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
            <meshStandardMaterial color={cabinInterior.lampMetal} flatShading />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={cabinInterior.lampGlow} emissive={cabinInterior.lampGlow} emissiveIntensity={1.2} flatShading />
          </mesh>
          <pointLight
            color={cabinInterior.lampGlow}
            intensity={0.85}
            distance={1.6}
            decay={1.8}
            position={[0, -0.08, 0.16]}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
        </group>
      ))}

      <group position={[0, 1.66, -0.07]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.018, 0.18, 8]} />
          <meshStandardMaterial color={cabinInterior.lampMetal} flatShading />
        </mesh>
        <mesh position={[0, -0.14, 0]}>
          <coneGeometry args={[0.18, 0.18, 12]} />
          <meshStandardMaterial color={cabinInterior.lampMetal} flatShading />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={cabinInterior.lampGlow} emissive={cabinInterior.lampGlow} emissiveIntensity={1.35} flatShading />
        </mesh>
        <pointLight color={cabinInterior.lampGlow} intensity={1.05} distance={2.3} decay={1.8} position={[0, -0.24, 0]} castShadow />
      </group>

      <group position={[0.63, 1.02, -0.72]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[0.5, 0.045, 0.11]} />
          <meshStandardMaterial color={cabinInterior.shelfWood} flatShading />
        </mesh>
        <mesh position={[0, -0.32, 0]} receiveShadow>
          <boxGeometry args={[0.5, 0.045, 0.11]} />
          <meshStandardMaterial color={cabinInterior.shelfWood} flatShading />
        </mesh>
        <mesh position={[-0.15, 0.08, 0]}>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookA} flatShading />
        </mesh>
        <mesh position={[-0.06, 0.07, 0]}>
          <boxGeometry args={[0.07, 0.14, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookB} flatShading />
        </mesh>
        <mesh position={[0.12, 0.08, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.16, 10]} />
          <meshStandardMaterial color={cabinInterior.decorVase} flatShading />
        </mesh>
        <mesh position={[0.12, 0.17, 0.03]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={'#628e5e'} flatShading />
        </mesh>
        <mesh position={[-0.08, -0.23, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookB} flatShading />
        </mesh>
        <mesh position={[0.04, -0.25, 0]}>
          <boxGeometry args={[0.09, 0.24, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookA} flatShading />
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
