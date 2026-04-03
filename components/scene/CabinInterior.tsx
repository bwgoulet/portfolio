'use client';

import { memo, useMemo } from 'react';
import * as THREE from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

const PHOTO_GALLERY = [
  { id: 'photo-01', position: [-0.71, 1.57, -0.759], size: [0.17, 0.12], rotation: -0.09, pinOffsetX: -0.02 },
  { id: 'photo-02', position: [-0.47, 1.68, -0.759], size: [0.11, 0.17], rotation: 0.06, pinOffsetX: 0.018 },
  { id: 'photo-03', position: [-0.2, 1.57, -0.759], size: [0.18, 0.12], rotation: -0.03, pinOffsetX: -0.015 },
  { id: 'photo-04', position: [0.08, 1.68, -0.759], size: [0.115, 0.17], rotation: 0.08, pinOffsetX: 0.016 },
  { id: 'photo-05', position: [0.36, 1.56, -0.759], size: [0.17, 0.12], rotation: -0.05, pinOffsetX: -0.018 },
  { id: 'photo-06', position: [0.56, 1.67, -0.759], size: [0.11, 0.165], rotation: 0.04, pinOffsetX: 0.02 },
  { id: 'photo-07', position: [-0.64, 1.2, -0.759], size: [0.17, 0.12], rotation: 0.07, pinOffsetX: 0.014 },
  { id: 'photo-08', position: [-0.34, 1.04, -0.759], size: [0.18, 0.12], rotation: -0.07, pinOffsetX: -0.016 },
  { id: 'photo-09', position: [-0.02, 1.14, -0.759], size: [0.105, 0.16], rotation: 0.05, pinOffsetX: 0.016 },
  { id: 'photo-10', position: [0.27, 1.02, -0.759], size: [0.17, 0.12], rotation: -0.06, pinOffsetX: -0.014 },
  { id: 'photo-11', position: [-0.47, 0.86, -0.759], size: [0.16, 0.115], rotation: 0.06, pinOffsetX: 0.015 }
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
        <boxGeometry args={[0.36, 0.06, 0.86]} />
        <meshStandardMaterial color={cabinInterior.tableTop} flatShading />
      </mesh>
      <mesh position={[-0.67, 0.37, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.04, 0.8]} />
        <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
      </mesh>
      {[
        [-0.8, -0.49],
        [-0.8, 0.25],
        [-0.54, -0.49],
        [-0.54, 0.25]
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.21, z]} castShadow receiveShadow>
          <boxGeometry args={[0.045, 0.36, 0.045]} />
          <meshStandardMaterial color={cabinInterior.tableLeg} flatShading />
        </mesh>
      ))}

      <group position={[-0.67, 0.58, -0.02]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.24, 0.24]} />
          <meshStandardMaterial color={cabinInterior.monitorBody} flatShading />
        </mesh>
        <mesh position={[0, -0.085, -0.02]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 0.05, 0.2]} />
          <meshStandardMaterial color={cabinInterior.monitorBody} flatShading />
        </mesh>
        <mesh position={[0, -0.11, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.02, 0.08]} />
          <meshStandardMaterial color={cabinInterior.monitorBody} flatShading />
        </mesh>
        <mesh position={[0, 0.01, 0.115]}>
          <boxGeometry args={[0.23, 0.15, 0.02]} />
          <meshStandardMaterial color={'#2f3740'} flatShading />
        </mesh>
        <mesh position={[0, 0.02, 0.126]}>
          <planeGeometry args={[0.19, 0.12]} />
          <meshStandardMaterial
            color={cabinInterior.monitorScreen}
            emissive={cabinInterior.monitorScreen}
            emissiveIntensity={0.3}
          />
        </mesh>
        {[-0.065, -0.03, 0.005, 0.04].map((x) => (
          <mesh key={x} position={[x, -0.09, 0.122]} castShadow>
            <boxGeometry args={[0.015, 0.01, 0.015]} />
            <meshStandardMaterial color={'#232a31'} flatShading />
          </mesh>
        ))}
        <mesh position={[-0.11, -0.09, 0.122]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
          <meshStandardMaterial color={'#992f2f'} flatShading />
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

      {PHOTO_GALLERY.map((photo, index) => (
        <group key={photo.id} position={photo.position} rotation={[0, 0, photo.rotation]}>
          <mesh>
            <planeGeometry args={photo.size} />
            <meshBasicMaterial color={PHOTO_COLORS[index % PHOTO_COLORS.length]} />
          </mesh>
          <mesh name={`gallery-photo-${photo.id}`} position={[0, 0, 0.001]}>
            <planeGeometry args={[photo.size[0] * 0.88, photo.size[1] * 0.84]} />
            <meshStandardMaterial color={'#fbf7ef'} roughness={0.85} metalness={0.03} />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[photo.size[0] + 0.016, photo.size[1] + 0.016]} />
            <meshStandardMaterial color={PALETTE.cabinWall} flatShading />
          </mesh>
          <mesh position={[photo.pinOffsetX, photo.size[1] * 0.5 + 0.012, 0.004]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.012, 10]} />
            <meshStandardMaterial color={cabinInterior.lampMetal} roughness={0.45} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
});
