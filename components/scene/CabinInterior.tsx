'use client';

import gsap from 'gsap';
import { memo, useMemo, useRef } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

export type GalleryPhoto = {
  id: string;
  position: [number, number, number];
  size: [number, number];
  rotation: number;
  pinOffsetX: number;
  imageSrc: string;
  title: string;
  description: string;
};

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: 'photo-01', position: [-0.7, 1.56, -0.759], size: [0.17, 0.12], rotation: -0.09, pinOffsetX: -0.02, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'HackNC 2023', description: 'A picture of the team and I from HackNC 2023' },
  { id: 'photo-02', position: [-0.47, 0.6, -0.759], size: [0.11, 0.17], rotation: 0.06, pinOffsetX: 0.018, imageSrc: '/gallery/hellopio.jpg', title: 'Late-Night Build', description: '' },
  { id: 'photo-03', position: [-0.2, 1.4, -0.759], size: [0.18, 0.12], rotation: -0.03, pinOffsetX: -0.015, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Team Snapshot', description: '' },
  { id: 'photo-04', position: [0, 0.85, -0.759], size: [0.115, 0.17], rotation: 0.08, pinOffsetX: 0.016, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Focused Work', description: '' },
  { id: 'photo-05', position: [0.4, 1.6, -0.759], size: [0.17, 0.12], rotation: -0.05, pinOffsetX: -0.018, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Community', description: '' },
  { id: 'photo-06', position: [0.7, 1.5, -0.759], size: [0.11, 0.165], rotation: 0.04, pinOffsetX: 0.02, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Behind the Scenes', description: '' },
  { id: 'photo-07', position: [-0.64, 1.2, -0.759], size: [0.17, 0.12], rotation: 0.07, pinOffsetX: 0.014, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Momentum', description: '' },
  { id: 'photo-08', position: [-0.34, 1.04, -0.759], size: [0.18, 0.12], rotation: -0.07, pinOffsetX: -0.016, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Shared Wins', description: '' },
  { id: 'photo-09', position: [0.15, 1.3, -0.759], size: [0.105, 0.16], rotation: 0.05, pinOffsetX: 0.016, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'On the Move', description: '' },
  { id: 'photo-10', position: [0.2, 0.5, -0.759], size: [0.17, 0.12], rotation: -0.06, pinOffsetX: -0.014, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Big Picture', description: '' },
  { id: 'photo-11', position: [-0.7, 0.86, -0.759], size: [0.16, 0.115], rotation: 0.06, pinOffsetX: 0.015, imageSrc: '/gallery/hacknc_jump.jpeg', title: 'Gratitude', description: '' }
];

const setInteractiveCursor = (isPointer: boolean) => {
  document.body.style.cursor = isPointer ? 'pointer' : 'auto';
};

const PHOTO_COLORS = VISUAL_TOKENS.scene.cabinInterior.photoPalette;
type CabinInteriorProps = {
  photosInteractive: boolean;
  onPhotoSelect: (photoId: string) => void;
};

export const CabinInterior = memo(function CabinInterior({ photosInteractive, onPhotoSelect }: CabinInteriorProps) {
  const { cabinInterior } = VISUAL_TOKENS.scene;
  const chairGltf = useGLTF('/models/Chair.glb');
  const tableGltf = useGLTF('/models/Table.glb');
  const crtGltf = useGLTF('/models/CRT.glb');
  const chairModel = useMemo(() => {
    const chairScene = chairGltf.scene.clone(true);
    chairScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return chairScene;
  }, [chairGltf.scene]);
  const tableModel = useMemo(() => {
    const tableScene = tableGltf.scene.clone(true);
    tableScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    tableScene.updateMatrixWorld(true);
    const tableBounds = new THREE.Box3().setFromObject(tableScene);
    const tableCenter = tableBounds.getCenter(new THREE.Vector3());
    tableScene.position.x -= tableCenter.x;
    tableScene.position.z -= tableCenter.z;
    tableScene.position.y -= tableBounds.min.y;
    return tableScene;
  }, [tableGltf.scene]);
  const crtModel = useMemo(() => {
    const crtScene = crtGltf.scene.clone(true);
    crtScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    crtScene.updateMatrixWorld(true);
    const crtBounds = new THREE.Box3().setFromObject(crtScene);
    const crtSize = crtBounds.getSize(new THREE.Vector3());
    const crtCenter = crtBounds.getCenter(new THREE.Vector3());
    crtScene.position.x -= crtCenter.x;
    crtScene.position.z -= crtCenter.z;
    crtScene.position.y -= crtBounds.min.y;
    return { scene: crtScene, size: crtSize };
  }, [crtGltf.scene]);
  const crtScale = useMemo(() => {
    if (crtModel.size.y <= Number.EPSILON) return 1;
    const desiredMonitorHeight = 0.28;
    return desiredMonitorHeight / crtModel.size.y;
  }, [crtModel.size.y]);
  const galleryTextureSources = useMemo(
    () => Array.from(new Set(GALLERY_PHOTOS.map((photo) => photo.imageSrc))),
    []
  );
  const galleryTextures = useTexture(galleryTextureSources);
  const galleryTextureBySrc = useMemo(
    () =>
      galleryTextureSources.reduce<Record<string, THREE.Texture>>((texturesBySrc, source, index) => {
        const texture = galleryTextures[index];
        if (texture) {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 4;
          texture.needsUpdate = true;
          texturesBySrc[source] = texture;
        }
        return texturesBySrc;
      }, {}),
    [galleryTextureSources, galleryTextures]
  );
  const photoRefs = useRef<Record<string, THREE.Group | null>>({});
  const hoveredPhotoIdRef = useRef<string | null>(null);

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

  const startPhotoHover = (photo: GalleryPhoto) => {
    if (!photosInteractive || hoveredPhotoIdRef.current === photo.id) return;
    hoveredPhotoIdRef.current = photo.id;
    const group = photoRefs.current[photo.id];
    if (!group) return;
    setInteractiveCursor(true);
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    gsap.to(group.scale, { x: 1.07, y: 1.07, z: 1.07, duration: 0.18, ease: 'power2.out' });
    gsap.to(group.position, { z: photo.position[2] + 0.018, duration: 0.18, ease: 'power2.out' });
  };

  const endPhotoHover = (photo: GalleryPhoto) => {
    if (hoveredPhotoIdRef.current !== photo.id) return;
    hoveredPhotoIdRef.current = null;
    const group = photoRefs.current[photo.id];
    if (!group) return;
    setInteractiveCursor(false);
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 0.18, ease: 'power2.out' });
    gsap.to(group.position, { z: photo.position[2], duration: 0.18, ease: 'power2.out' });
  };

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

      <group position={[-0.67, 0.03, -0.12]} scale={0.015}>
        <primitive object={tableModel} />
      </group>
      <primitive object={chairModel} position={[-0.2, 0.05, 0]} rotation={[0, -Math.PI/4, 0]} scale={0.05} />

      <group position={[-0.67, 0.58, -0.02]} rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={crtModel.scene} scale={crtScale} />
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
        <mesh position={[-0.15, 0.1025, 0]}>
          <boxGeometry args={[0.08, 0.16, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookA} flatShading />
        </mesh>
        <mesh position={[-0.06, 0.0925, 0]}>
          <boxGeometry args={[0.07, 0.14, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookB} flatShading />
        </mesh>
        <mesh position={[0.12, 0.1025, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.16, 10]} />
          <meshStandardMaterial color={cabinInterior.decorVase} flatShading />
        </mesh>
        <mesh position={[0.12, 0.1925, 0.03]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color={'#628e5e'} flatShading />
        </mesh>
        <mesh position={[-0.08, -0.1975, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookB} flatShading />
        </mesh>
        <mesh position={[0.04, -0.2175, 0]}>
          <boxGeometry args={[0.09, 0.24, 0.08]} />
          <meshStandardMaterial color={cabinInterior.decorBookA} flatShading />
        </mesh>
      </group>

      {GALLERY_PHOTOS.map((photo, index) => (
        <group
          key={photo.id}
          position={photo.position}
          rotation={[0, 0, photo.rotation]}
          ref={(group) => {
            photoRefs.current[photo.id] = group;
          }}
        >
          <mesh>
            <planeGeometry args={photo.size} />
            <meshBasicMaterial color={PHOTO_COLORS[index % PHOTO_COLORS.length]} />
          </mesh>
          <mesh name={`gallery-photo-${photo.id}`} position={[0, 0, 0.001]}>
            <planeGeometry args={[photo.size[0] * 0.88, photo.size[1] * 0.84]} />
            <meshStandardMaterial
              color={'#ffffff'}
              map={galleryTextureBySrc[photo.imageSrc]}
              roughness={0.85}
              metalness={0.03}
            />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[photo.size[0] + 0.016, photo.size[1] + 0.016]} />
            <meshStandardMaterial color={PALETTE.cabinWall} flatShading />
          </mesh>
          <mesh position={[photo.pinOffsetX, photo.size[1] * 0.5 + 0.012, 0.004]} castShadow>
            <cylinderGeometry args={[0.007, 0.007, 0.012, 10]} />
            <meshStandardMaterial color={cabinInterior.lampMetal} roughness={0.45} metalness={0.5} />
          </mesh>
          <mesh
            position={[0, 0, 0.012]}
            onPointerEnter={(event) => {
              if (!photosInteractive) return;
              event.stopPropagation();
              startPhotoHover(photo);
            }}
            onPointerMove={(event) => {
              if (!photosInteractive) return;
              event.stopPropagation();
              startPhotoHover(photo);
            }}
            onPointerLeave={(event) => {
              if (!photosInteractive) return;
              event.stopPropagation();
              endPhotoHover(photo);
            }}
            onClick={(event) => {
              if (!photosInteractive) return;
              event.stopPropagation();
              onPhotoSelect(photo.id);
            }}
          >
            <boxGeometry args={[photo.size[0] + 0.08, photo.size[1] + 0.08, 0.1]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

useGLTF.preload('/models/Chair.glb');
useGLTF.preload('/models/CRT.glb');
