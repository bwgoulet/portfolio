'use client';

import { ISLAND_GROUND_INTERACTION_MIN_Y, PALETTE, SCENE_ANCHORS } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';
import { Text, useGLTF, useTexture } from '@react-three/drei';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ClampToEdgeWrapping, LinearMipmapLinearFilter, RepeatWrapping, SRGBColorSpace } from 'three';
import type { Group } from 'three';
import type { InteractiveTarget } from './types';
import { EXPERIENCE_ENTRIES } from './experienceData';

const environmentPalette = VISUAL_TOKENS.scene.environment;
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

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const pineGltf = useGLTF('/models/Pine.glb');
  const pineModel = useMemo(() => {
    const pineScene = pineGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(pineScene);
    pineScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    pineScene.updateMatrixWorld(true);
    const pineBounds = new THREE.Box3().setFromObject(pineScene);
    const pineCenter = pineBounds.getCenter(new THREE.Vector3());
    pineScene.position.x -= pineCenter.x;
    pineScene.position.z -= pineCenter.z;
    pineScene.position.y -= pineBounds.min.y;
    return pineScene;
  }, [pineGltf.scene]);

  return (
    <group position={position} scale={scale}>
      <primitive object={pineModel} />
    </group>
  );
}

type StoneTabletsProps = {
  interactiveEnabled: boolean;
  detailInteractiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: (target: InteractiveTarget) => void;
  onDetailSelect: (entryId: string) => void;
};

function StoneTablets({ interactiveEnabled, detailInteractiveEnabled, hovered, onHoverChange, onClick, onDetailSelect }: StoneTabletsProps) {
  const [hoveredTabletId, setHoveredTabletId] = useState<string | null>(null);
  const tabletTextures = useTexture(EXPERIENCE_ENTRIES.map((entry) => entry.placeholderImageSrc));
  const gl = useThree((state) => state.gl);

  const tabletImageDimensions = useMemo(
    () =>
      tabletTextures.map((texture) => {
        const image = texture.image as { width?: number; height?: number } | undefined;
        const width = image?.width ?? 1;
        const height = image?.height ?? 1;
        return { width, height };
      }),
    [tabletTextures]
  );

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    tabletTextures.forEach((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearMipmapLinearFilter;
      texture.anisotropy = maxAnisotropy;
      texture.wrapS = ClampToEdgeWrapping;
      texture.wrapT = ClampToEdgeWrapping;
      texture.needsUpdate = true;
    });
  }, [gl, tabletTextures]);

  return (
    <group>
      {EXPERIENCE_ENTRIES.map((entry, index) => {
        const x = SCENE_ANCHORS.tabletsStart[0] + index * 0.62;
        const z = SCENE_ANCHORS.tabletsStart[2] + index * 0.14;
        const width = 0.24;
        const height = 1.36;
        const rotationY = index === 3 ? 0.1 : -0.11 + index * 0.09;
        const logoFrameHeight = 0.42;
        const logoAspectRatio = tabletImageDimensions[index].width / tabletImageDimensions[index].height;
        const logoFrameWidth = Math.min(0.28, logoFrameHeight * logoAspectRatio);
        const logoPlaqueWidth = Math.min(0.32, logoFrameWidth + 0.04);
        const logoPlaqueHeight = logoFrameHeight + 0.032;
        const logoY = height * 0.39;
        const logoPlaqueZ = width - 0.004;
        const logoZ = logoPlaqueZ + 0.007;

        return (
          <group key={index} position={[x, SCENE_ANCHORS.tabletsStart[1], z]} rotation={[0, rotationY, 0]}>
            <mesh position={[0, -0.15, -0.02]} castShadow receiveShadow>
              <cylinderGeometry args={[0.31, 0.37, 0.12, 6]} />
              <meshStandardMaterial color={environmentPalette.tabletBase} flatShading />
            </mesh>
            <mesh
              castShadow
              receiveShadow
              onPointerEnter={(event) => {
                event.stopPropagation();
                if (!isAboveIslandGround(event.point.y)) {
                  setHoveredTabletId((current) => (current === entry.id ? null : current));
                  onHoverChange(false);
                  setInteractiveCursor(false);
                  return;
                }
                if (interactiveEnabled || detailInteractiveEnabled) {
                  setHoveredTabletId(entry.id);
                  onHoverChange(true);
                  setInteractiveCursor(true);
                }
              }}
              onPointerMove={(event) => {
                event.stopPropagation();
                if (!isAboveIslandGround(event.point.y)) {
                  setHoveredTabletId((current) => (current === entry.id ? null : current));
                  onHoverChange(false);
                  setInteractiveCursor(false);
                  return;
                }
                if (interactiveEnabled || detailInteractiveEnabled) {
                  setHoveredTabletId(entry.id);
                  onHoverChange(true);
                  setInteractiveCursor(true);
                }
              }}
              onPointerLeave={(event) => {
                event.stopPropagation();
                setHoveredTabletId((current) => (current === entry.id ? null : current));
                onHoverChange(false);
                setInteractiveCursor(false);
              }}
              onClick={(event) => {
                event.stopPropagation();
                if (!isAboveIslandGround(event.point.y)) return;
                if (interactiveEnabled) onClick('tablets');
                if (detailInteractiveEnabled) onDetailSelect(entry.id);
              }}
            >
              <capsuleGeometry args={[width, height, 4, 6]} />
              <meshStandardMaterial
                color={hoveredTabletId === entry.id ? environmentPalette.tabletHover : PALETTE.tablet}
                emissive={hoveredTabletId === entry.id || hovered ? environmentPalette.tabletEmissiveHover : environmentPalette.tabletEmissiveIdle}
                emissiveIntensity={hoveredTabletId === entry.id || hovered ? 0.28 : 0.08}
                flatShading
              />
            </mesh>
            <mesh position={[0, height * 0.58, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.2, 0.09, 6]} />
              <meshStandardMaterial color={environmentPalette.tabletCap} flatShading />
            </mesh>
            <mesh position={[0, logoY, logoPlaqueZ]} receiveShadow>
              <boxGeometry args={[logoPlaqueWidth, logoPlaqueHeight, 0.012]} />
              <meshStandardMaterial color="#ece8de" roughness={0.84} metalness={0.02} />
            </mesh>
            <mesh position={[0, logoY, logoZ]}>
              <planeGeometry args={[logoFrameWidth, logoFrameHeight]} />
              <meshBasicMaterial
                map={tabletTextures[index]}
                color={hoveredTabletId === entry.id ? environmentPalette.tabletImageHover : environmentPalette.tabletImageIdle}
                transparent
                opacity={hoveredTabletId === entry.id ? 0.95 : 0.82}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

useGLTF.preload('/models/Pine.glb');
useGLTF.preload('/models/Wooden Sign.glb');
useGLTF.preload('/models/Mountain.glb');

function MountainRopeBridge() {
  const bridgeGltf = useGLTF('/models/rope bridge.glb');
  const bridgeModel = useMemo(() => {
    const bridgeScene = bridgeGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(bridgeScene);
    bridgeScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    bridgeScene.updateMatrixWorld(true);
    const initialBounds = new THREE.Box3().setFromObject(bridgeScene);
    const initialSize = initialBounds.getSize(new THREE.Vector3());
    const dominantAxis = Math.max(initialSize.x, initialSize.z, 1);
    const normalizedScale = 15 / dominantAxis;
    bridgeScene.scale.setScalar(normalizedScale);
    bridgeScene.updateMatrixWorld(true);

    const bridgeBounds = new THREE.Box3().setFromObject(bridgeScene);
    const bridgeCenter = bridgeBounds.getCenter(new THREE.Vector3());
    bridgeScene.position.x -= bridgeCenter.x;
    bridgeScene.position.z -= bridgeCenter.z;
    bridgeScene.position.y -= bridgeBounds.min.y;
    return bridgeScene;
  }, [bridgeGltf.scene]);

  return (
    <group position={[1.02, 0.52, -14.2]} rotation={[0, Math.PI / 2, 0]}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={bridgeModel} />
      </group>
    </group>
  );
}

function MountainBackdrop() {
  const mountainGltf = useGLTF('/models/Mountain.glb');

  const mountainModel = useMemo(() => {
    const mountainScene = mountainGltf.scene.clone(true);
    mountainScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mountainScene.updateMatrixWorld(true);
    const initialBounds = new THREE.Box3().setFromObject(mountainScene);
    const initialSize = initialBounds.getSize(new THREE.Vector3());
    const dominantAxis = Math.max(initialSize.x, initialSize.z, 1);
    const normalizedScale = 14 / dominantAxis;
    mountainScene.scale.setScalar(normalizedScale);
    mountainScene.updateMatrixWorld(true);

    const mountainBounds = new THREE.Box3().setFromObject(mountainScene);
    const mountainCenter = mountainBounds.getCenter(new THREE.Vector3());
    mountainScene.position.x -= mountainCenter.x;
    mountainScene.position.z -= mountainCenter.z;
    mountainScene.position.y -= mountainBounds.min.y;

    return mountainScene;
  }, [mountainGltf.scene]);

  return (
    <group position={SCENE_ANCHORS.mountain} rotation={[0, 0.16, 0]}>
      <primitive object={mountainModel} />
    </group>
  );
}

function Clouds({ reducedMotion }: { reducedMotion: boolean }) {
  const cloudGroupRef = useRef<Group>(null);
  const cloudOffsets = useMemo(
    () => [0, Math.PI * 0.8, Math.PI * 1.45, Math.PI * 2.15],
    []
  );

  useFrame(({ clock }) => {
    const group = cloudGroupRef.current;
    if (!group) return;
    group.children.forEach((cloud, index) => {
      const offset = cloudOffsets[index] ?? 0;
      if (reducedMotion) return;
      const t = clock.getElapsedTime() * 0.06 + offset;
      cloud.position.x = Math.sin(t) * 10.5;
      cloud.position.z = -18.5 + index * 1.9 + Math.cos(t * 0.7) * 1.3;
      cloud.position.y = 6.45 + Math.sin(t * 1.45) * 0.22;
    });
  });

  return (
    <group ref={cloudGroupRef}>
      {cloudOffsets.map((offset, index) => (
        <group key={offset} position={[index * 4.8 - 8.2, 6.5, -19 + index * 2]} scale={[1.24, 0.56, 0.86]}>
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[1.06, 0]} />
            <meshStandardMaterial color={environmentPalette.cloudMain} flatShading transparent opacity={0.88} />
          </mesh>
          <mesh position={[-1.18, 0.12, 0.12]}>
            <dodecahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial color={environmentPalette.cloudBright} flatShading transparent opacity={0.9} />
          </mesh>
          <mesh position={[1.12, 0.1, 0.04]}>
            <dodecahedronGeometry args={[0.83, 0]} />
            <meshStandardMaterial color={environmentPalette.cloudCool} flatShading transparent opacity={0.86} />
          </mesh>
          <mesh position={[0.22, 0.3, 0.12]} scale={[0.88, 0.78, 0.9]}>
            <dodecahedronGeometry args={[0.63, 0]} />
            <meshStandardMaterial color={environmentPalette.cloudCore} flatShading transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ExperienceEngraving({ hovered }: { hovered: boolean }) {
  const baseScale = hovered ? 0.55 : 0.5;
  const textSize = hovered ? 0.218 : 0.196;

  return (
    <group position={[2.75, 1.37, 4.4]} rotation={[0, -0.16, 0]} scale={baseScale}>
      <mesh position={[0, -0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.26, 0.12]} />
        <meshStandardMaterial color="#6e563d" flatShading />
      </mesh>
      <Text
        position={[0, -0.11, 0.068]}
        fontSize={textSize}
        letterSpacing={0.03}
        anchorX="center"
        anchorY="middle"
        color={hovered ? '#3a2a16' : '#2a1a10'}
        outlineWidth={hovered ? 0.012 : 0.006}
        outlineColor={hovered ? '#3a2a16' : '#2d210f'}
      >
        Experience
      </Text>
      <Text
        position={[0.01, -0.1, 0.074]}
        fontSize={textSize}
        letterSpacing={0.03}
        anchorX="center"
        anchorY="middle"
        color={hovered ? '#ffd8a5' : '#c79b62'}
        fillOpacity={hovered ? 1 : 0.92}
      >
        Experience
      </Text>
    </group>
  );
}

type TrailheadTimelineSignProps = {
  reducedMotion: boolean;
  interactiveEnabled: boolean;
  hovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  onClick: (target: InteractiveTarget) => void;
  signRef: RefObject<Group | null>;
};

function TrailheadTimelineSign({
  reducedMotion,
  interactiveEnabled,
  hovered,
  onHoverChange,
  onClick,
  signRef
}: TrailheadTimelineSignProps) {
  const woodenSignGltf = useGLTF('/models/Wooden Sign.glb');
  const { woodenSignModel, hitAreaSize, hitAreaOffset } = useMemo(() => {
    const signScene = woodenSignGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(signScene);
    signScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    signScene.updateMatrixWorld(true);
    const signBounds = new THREE.Box3().setFromObject(signScene);
    const signCenter = signBounds.getCenter(new THREE.Vector3());
    signScene.position.x -= signCenter.x;
    signScene.position.z -= signCenter.z;
    signScene.position.y -= signBounds.min.y;
    signScene.updateMatrixWorld(true);
    const normalizedBounds = new THREE.Box3().setFromObject(signScene);
    const boundsSize = normalizedBounds.getSize(new THREE.Vector3());
    const boundsCenter = normalizedBounds.getCenter(new THREE.Vector3());
    return {
      woodenSignModel: signScene,
      hitAreaSize: [boundsSize.x, boundsSize.y, boundsSize.z] as [number, number, number],
      hitAreaOffset: [boundsCenter.x, boundsCenter.y, boundsCenter.z] as [number, number, number]
    };
  }, [woodenSignGltf.scene]);
  const signScale = hovered ? 1.15 : 1.12;

  useFrame(({ clock }) => {
    if (reducedMotion || !signRef.current) return;
    const t = clock.getElapsedTime();
    signRef.current.rotation.z = Math.sin(t * 0.18) * 0.012;
    signRef.current.position.y = 1.2 + Math.sin(t * 0.22) * 0.02;
  });

  return (
    <group ref={signRef} position={[-0.9, 1.2, -5.5]} rotation={[0, 0.22, 0]} scale={signScale}>
      <group scale={0.55}>
        <primitive object={woodenSignModel} />
      </group>
      <mesh
        position={hitAreaOffset}
        onPointerEnter={(event) => {
          event.stopPropagation();
          if (!isAboveIslandGround(event.point.y)) {
            onHoverChange(false);
            setInteractiveCursor(false);
            return;
          }
          if (interactiveEnabled) onHoverChange(true);
          setInteractiveCursor(interactiveEnabled);
        }}
        onPointerMove={(event) => {
          event.stopPropagation();
          if (!isAboveIslandGround(event.point.y)) {
            onHoverChange(false);
            setInteractiveCursor(false);
            return;
          }
          if (interactiveEnabled) onHoverChange(true);
          setInteractiveCursor(interactiveEnabled);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHoverChange(false);
          setInteractiveCursor(false);
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (!isAboveIslandGround(event.point.y)) return;
          if (interactiveEnabled) onClick('timeline');
        }}
      >
        <boxGeometry args={hitAreaSize} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <Text
        position={[0.11, 0.76, 0]}
        fontSize={hovered ? 0.06 : 0.06}
        font="https://fonts.gstatic.com/s/rye/v17/r05XGLJT86YDFg.ttf"
        letterSpacing={0.035}
        anchorX="center"
        anchorY="middle"
        color={hovered ? '#f7ebd2' : environmentPalette.signText}
      >
        Timeline
      </Text>
    </group>
  );
}

function GrassGround() {
  return (
    <>
      <mesh position={[0, 1.121, 0]} rotation={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[6.95, 8.05, 0.25, 96, 8]} />
        <meshStandardMaterial
          color={PALETTE.islandTop}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[-1.3, 1.14, -2.8]} rotation={[0, 0.32, 0]} receiveShadow>
        <cylinderGeometry args={[2.4, 2.9, 0.21, 96, 8]} />
        <meshStandardMaterial
          color={environmentPalette.mossA}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <mesh position={[2.5, 1.15, 1.7]} rotation={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2.2, 0.18, 96, 8]} />
        <meshStandardMaterial
          color={environmentPalette.mossB}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </>
  );
}

function SceneFloor() {
  return (
    <mesh position={[0, -0.25, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[60, 256]} />
      <meshStandardMaterial
        color={PALETTE.islandTop}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

type LowPolyEnvironmentProps = {
  tabletsInteractiveEnabled: boolean;
  tabletsDetailInteractiveEnabled: boolean;
  tabletsHovered: boolean;
  onTabletsHoverChange: (hovered: boolean) => void;
  onTabletsClick: (target: InteractiveTarget) => void;
  onTabletDetailSelect: (entryId: string) => void;
  tabletsRef: RefObject<Group | null>;
  timelineSignRef: RefObject<Group | null>;
  timelineInteractiveEnabled: boolean;
  timelineHovered: boolean;
  onTimelineHoverChange: (hovered: boolean) => void;
  onTimelineClick: (target: InteractiveTarget) => void;
  reducedMotion: boolean;
};

export function LowPolyEnvironment({
  tabletsInteractiveEnabled,
  tabletsDetailInteractiveEnabled,
  tabletsHovered,
  onTabletsHoverChange,
  onTabletsClick,
  onTabletDetailSelect,
  tabletsRef,
  timelineSignRef,
  timelineInteractiveEnabled,
  timelineHovered,
  onTimelineHoverChange,
  onTimelineClick,
  reducedMotion
}: LowPolyEnvironmentProps) {
  return (
    <group>
      <SceneFloor />

      <mesh rotation={[0, 0.2, 0]} receiveShadow>
        <cylinderGeometry args={[6.8, 7.9, 2.2, 8]} />
        <meshStandardMaterial color={PALETTE.islandSide} flatShading />
      </mesh>

      <GrassGround />

      <MountainRopeBridge />

      <ExperienceEngraving hovered={tabletsHovered && tabletsInteractiveEnabled} />
      <TrailheadTimelineSign
        reducedMotion={reducedMotion}
        signRef={timelineSignRef}
        interactiveEnabled={timelineInteractiveEnabled}
        hovered={timelineHovered}
        onHoverChange={onTimelineHoverChange}
        onClick={onTimelineClick}
      />

      <Tree position={[-3.5, 1.13, -3.5]} scale={0.6} />
      <Tree position={[-0.8, 1.11, -2.7]} scale={1} />
      <Tree position={[2.2, 1.08, -2.35]} scale={0.8} />
      {/* <Tree position={[-4.2, 1.08, 1.8]} scale={0.4} /> */}

      <mesh position={[2.75, 1.27, -1.65]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={PALETTE.rock} flatShading />
      </mesh>

      <group ref={tabletsRef}>
        <StoneTablets
          interactiveEnabled={tabletsInteractiveEnabled}
          detailInteractiveEnabled={tabletsDetailInteractiveEnabled}
          hovered={tabletsHovered}
          onHoverChange={onTabletsHoverChange}
          onClick={onTabletsClick}
          onDetailSelect={onTabletDetailSelect}
        />
      </group>
      <Clouds reducedMotion={reducedMotion} />
      <MountainBackdrop />
    </group>
  );
}

useGLTF.preload('/models/rope bridge.glb');
