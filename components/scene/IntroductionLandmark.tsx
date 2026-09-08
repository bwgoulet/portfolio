'use client';

import { Text, useGLTF, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { memo, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import {
  ClampToEdgeWrapping,
  DoubleSide,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  type Group
} from 'three';
import { ISLAND_GROUND_INTERACTION_MIN_Y, SCENE_ANCHORS } from '@/config/sceneConfig';
import type { InteractiveTarget } from './types';

const setInteractiveCursor = (isPointer: boolean) => {
  document.body.style.cursor = isPointer ? 'pointer' : 'auto';
};

const isAboveIslandGround = (worldY: number) => worldY >= ISLAND_GROUND_INTERACTION_MIN_Y;

const clearTextureSlot = (material: THREE.Material, slot: string) => {
  if (!(slot in material)) return;
  (material as THREE.Material & Record<string, unknown>)[slot] = null;
};

const stripMaterialToDiffuseMap = (material: THREE.Material) => {
  if (!(material instanceof THREE.MeshStandardMaterial) && !(material instanceof THREE.MeshLambertMaterial)) return material;
  const nextMaterial = material.clone();
  ['normalMap', 'bumpMap', 'displacementMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap'].forEach((slot) =>
    clearTextureSlot(nextMaterial, slot)
  );
  nextMaterial.needsUpdate = true;
  return nextMaterial;
};

const forceDiffuseOnlyOnSceneMaterials = (scene: THREE.Object3D) => {
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    if (Array.isArray(child.material)) {
      child.material = child.material.map(stripMaterialToDiffuseMap);
      return;
    }
    child.material = stripMaterialToDiffuseMap(child.material);
  });
};

const updateBackpackHoverState = (scene: THREE.Object3D, hovered: boolean) => {
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      material.emissive.set(hovered ? '#2d3742' : '#171d24');
      material.emissiveIntensity = hovered ? 0.16 : 0.04;
      material.needsUpdate = true;
    });
  });
};

type IntroductionLandmarkProps = {
  interactiveEnabled: boolean;
  detailInteractiveEnabled?: boolean;
  hoverEnabled?: boolean;
  hovered: boolean;
  keyCardHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onKeyCardHoverChange: (hovered: boolean) => void;
  onKeyCardClick: () => void;
  onClick: (target: InteractiveTarget) => void;
  landmarkRef: RefObject<Group | null>;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  reducedMotion: boolean;
};

export const IntroductionLandmark = memo(function IntroductionLandmark({
  interactiveEnabled,
  detailInteractiveEnabled = false,
  hoverEnabled = interactiveEnabled,
  hovered,
  keyCardHovered,
  onHoverChange,
  onKeyCardHoverChange,
  onKeyCardClick,
  onClick,
  landmarkRef,
  position = SCENE_ANCHORS.introductionLandmark,
  rotation = [0, -0.1, 0],
  scale = 1,
  reducedMotion
}: IntroductionLandmarkProps) {
  const engravingGroupRef = useRef<Group>(null);
  const introTexture = useTexture('/introimage.png');
  const backpackGltf = useGLTF('/models/Backpack.glb');
  const keyCardGltf = useGLTF('/models/Pickup Key Card.glb');
  const gl = useThree((state) => state.gl);
  const imageWidth = 0.4;
  const imageHeight = imageWidth / (858 / 1356);
  const isBackpackHovered = hovered && !detailInteractiveEnabled;
  const isKeyCardInteractive = detailInteractiveEnabled;

  const backpackModel = useMemo(() => {
    const model = backpackGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(model);
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= bounds.min.y;
    return model;
  }, [backpackGltf.scene]);

  const keyCardModel = useMemo(() => {
    const model = keyCardGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(model);
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= bounds.min.y;
    return model;
  }, [keyCardGltf.scene]);

  useEffect(() => {
    updateBackpackHoverState(backpackModel, isBackpackHovered);
  }, [backpackModel, isBackpackHovered]);

  useEffect(() => {
    updateBackpackHoverState(keyCardModel, keyCardHovered);
  }, [keyCardHovered, keyCardModel]);

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    introTexture.colorSpace = SRGBColorSpace;
    introTexture.minFilter = LinearMipmapLinearFilter;
    introTexture.anisotropy = maxAnisotropy;
    introTexture.wrapS = ClampToEdgeWrapping;
    introTexture.wrapT = ClampToEdgeWrapping;
    introTexture.needsUpdate = true;
  }, [gl, introTexture]);

  useFrame(({ clock }) => {
    if (!engravingGroupRef.current || reducedMotion || detailInteractiveEnabled) return;
    engravingGroupRef.current.position.y = 1.2 + Math.sin(clock.getElapsedTime() * 0.66) * 0.008;
  });

  return (
    <group ref={landmarkRef} position={position} rotation={rotation} scale={scale}>
      <group position={[-.15, 0, 1]} scale={isBackpackHovered ? 1.03 : 1}>
        <primitive object={backpackModel} />
        <group
          position={[0.07, 0.32, 0.4]}
          rotation={[0, 0, -1.55]}
          scale={keyCardHovered ? 0.275 : 0.25}
          onPointerEnter={(event) => {
            if (!isKeyCardInteractive || !isAboveIslandGround(event.point.y)) return;
            event.stopPropagation();
            onHoverChange(false);
            onKeyCardHoverChange(true);
            setInteractiveCursor(true);
          }}
          onPointerMove={(event) => {
            if (!isKeyCardInteractive || !isAboveIslandGround(event.point.y)) return;
            event.stopPropagation();
            onKeyCardHoverChange(true);
            setInteractiveCursor(true);
          }}
          onPointerLeave={(event) => {
            if (!isKeyCardInteractive) return;
            event.stopPropagation();
            onKeyCardHoverChange(false);
            setInteractiveCursor(false);
          }}
          onClick={(event) => {
            if (!isKeyCardInteractive || !isAboveIslandGround(event.point.y)) return;
            event.stopPropagation();
            onKeyCardHoverChange(false);
            setInteractiveCursor(false);
            onKeyCardClick();
          }}
        >
          <primitive object={keyCardModel.clone(true)} />
        </group>
      </group>

      {!detailInteractiveEnabled && (
        <mesh
          position={[0, 0.84, 0.24]}
          onPointerEnter={(event) => {
            event.stopPropagation();
            if (!isAboveIslandGround(event.point.y)) {
              onHoverChange(false);
              setInteractiveCursor(false);
              return;
            }
            if (!hoverEnabled) return;
            onHoverChange(true);
            setInteractiveCursor(true);
          }}
          onPointerMove={(event) => {
            event.stopPropagation();
            if (!isAboveIslandGround(event.point.y)) {
              onHoverChange(false);
              setInteractiveCursor(false);
              return;
            }
            if (!hoverEnabled) return;
            onHoverChange(true);
            setInteractiveCursor(true);
          }}
          onPointerLeave={(event) => {
            event.stopPropagation();
            onHoverChange(false);
            setInteractiveCursor(false);
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (!isAboveIslandGround(event.point.y)) {
              setInteractiveCursor(false);
              return;
            }
            onHoverChange(false);
            setInteractiveCursor(false);
            if (interactiveEnabled) onClick('introduction');
          }}
        >
          <capsuleGeometry args={[0.5, 0.88, 8, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      <group ref={engravingGroupRef} position={[0, 1.2, 0.5]} rotation={[0.04, 0, 0]}>
        <Text
          position={[-.17, -0.45, 0.9]}
          rotation={[0, 0, 0]}
          fontSize={isBackpackHovered ? 0.088 : 0.078}
          anchorX="center"
          anchorY="middle"
          color={isBackpackHovered ? '#ffffff' : '#dce2e9'}
          outlineWidth={isBackpackHovered ? 0.01 : 0.008}
          outlineColor={isBackpackHovered ? '#1a2430' : '#324353'}
          fontWeight="700"
        >
          Introduction
        </Text>
      </group>

      <group position={[-.35, 0.32, 1.4]} rotation={[0.06, 0, 0]} scale={0.5}>
        <mesh
          onPointerEnter={(event) => {
            event.stopPropagation();
            if (!detailInteractiveEnabled || !isAboveIslandGround(event.point.y)) {
              onHoverChange(false);
              setInteractiveCursor(false);
              return;
            }
            onHoverChange(true);
            setInteractiveCursor(true);
          }}
          onPointerMove={(event) => {
            event.stopPropagation();
            if (!detailInteractiveEnabled || !isAboveIslandGround(event.point.y)) {
              onHoverChange(false);
              setInteractiveCursor(false);
              return;
            }
            onHoverChange(true);
            setInteractiveCursor(true);
          }}
          onPointerLeave={(event) => {
            event.stopPropagation();
            onHoverChange(false);
            setInteractiveCursor(false);
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (!detailInteractiveEnabled || !isAboveIslandGround(event.point.y)) return;
            setInteractiveCursor(false);
            onClick('introduction');
          }}
        >
          <planeGeometry args={[imageWidth, imageHeight]} />
          <meshBasicMaterial
            map={introTexture}
            side={DoubleSide}
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>

        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[imageWidth + 0.06, imageHeight + 0.06]} />
          <meshStandardMaterial color={hovered && detailInteractiveEnabled ? '#9ba5ad' : '#7b858f'} emissive="#2d343a" emissiveIntensity={0.12} />
        </mesh>
      </group>
    </group>
  );
});

useGLTF.preload('/models/Backpack.glb');
useGLTF.preload('/models/Pickup Key Card.glb');
