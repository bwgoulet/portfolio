"use client";

import {
  ISLAND_GROUND_INTERACTION_MIN_Y,
  PALETTE,
  SCENE_ANCHORS,
} from "@/config/sceneConfig";
import { VISUAL_TOKENS } from "@/config/visualTokens";
import { Clone, Text, useGLTF, useTexture } from "@react-three/drei";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  ClampToEdgeWrapping,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import type { Group } from "three";
import type { InteractiveTarget } from "./types";
import { EXPERIENCE_ENTRIES } from "./experienceData";

const environmentPalette = VISUAL_TOKENS.scene.environment;
const setInteractiveCursor = (isPointer: boolean) => {
  document.body.style.cursor = isPointer ? "pointer" : "auto";
};

const isAboveIslandGround = (worldY: number) =>
  worldY >= ISLAND_GROUND_INTERACTION_MIN_Y;

const clearTextureSlot = (material: THREE.Material, slot: string) => {
  if (!(slot in material)) return;
  (material as THREE.Material & Record<string, unknown>)[slot] = null;
};

const stripMaterialToDiffuseMap = (material: THREE.Material) => {
  if (
    !(material instanceof THREE.MeshStandardMaterial) &&
    !(material instanceof THREE.MeshLambertMaterial)
  )
    return material;
  const nextMaterial = material.clone();
  [
    "normalMap",
    "bumpMap",
    "displacementMap",
    "roughnessMap",
    "metalnessMap",
    "aoMap",
    "emissiveMap",
    "alphaMap",
  ].forEach((slot) => clearTextureSlot(nextMaterial, slot));
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

const updateModelHoverState = (
  scene: THREE.Object3D,
  hovered: boolean,
  hoveredEmissiveIntensity: number,
  idleEmissiveIntensity: number,
  hoveredEmissiveColor: string,
  idleEmissiveColor: string
) => {
  scene.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      material.emissive.set(hovered ? hoveredEmissiveColor : idleEmissiveColor);
      material.emissiveIntensity = hovered
        ? hoveredEmissiveIntensity
        : idleEmissiveIntensity;
      material.needsUpdate = true;
    });
  });
};

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const pineGltf = useGLTF("/models/Pine.glb");
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

function StoneTablets({
  interactiveEnabled,
  detailInteractiveEnabled,
  hovered,
  onHoverChange,
  onClick,
  onDetailSelect,
}: StoneTabletsProps) {
  const [hoveredTabletId, setHoveredTabletId] = useState<string | null>(null);
  const bonfireGltf = useGLTF("/models/Bonfire.glb");
  const treeStumpGltf = useGLTF("/models/Tree stump.glb");
  const tabletTextures = useTexture(
    EXPERIENCE_ENTRIES.map((entry) => entry.placeholderImageSrc)
  );
  const gl = useThree((state) => state.gl);

  const bonfireModel = useMemo(() => {
    const bonfireScene = bonfireGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(bonfireScene);
    bonfireScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    bonfireScene.updateMatrixWorld(true);
    const bonfireBounds = new THREE.Box3().setFromObject(bonfireScene);
    const bonfireCenter = bonfireBounds.getCenter(new THREE.Vector3());
    bonfireScene.position.x -= bonfireCenter.x;
    bonfireScene.position.z -= bonfireCenter.z;
    bonfireScene.position.y -= bonfireBounds.min.y;
    return bonfireScene;
  }, [bonfireGltf.scene]);

  const treeStumpModel = useMemo(() => {
    const stumpScene = treeStumpGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(stumpScene);
    stumpScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    stumpScene.updateMatrixWorld(true);
    const stumpBounds = new THREE.Box3().setFromObject(stumpScene);
    const stumpCenter = stumpBounds.getCenter(new THREE.Vector3());
    stumpScene.position.x -= stumpCenter.x;
    stumpScene.position.z -= stumpCenter.z;
    stumpScene.position.y -= stumpBounds.min.y;
    return stumpScene;
  }, [treeStumpGltf.scene]);

  const stumpPositions = useMemo<[number, number, number][]>(
    () => [
      [0.2, 1.12, 4.5],
      [0.6, 1.12, 3.7],
      [1.45, 1.12, 3.1],
      [2.1, 1.12, 3.95],
      [2.35, 1.12, 4.85],
    ],
    []
  );

  const tabletImageDimensions = useMemo(
    () =>
      tabletTextures.map((texture) => {
        const image = texture.image as
          | { width?: number; height?: number }
          | undefined;
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

  const isExperienceHovered =
    hovered && (interactiveEnabled || detailInteractiveEnabled);

  useEffect(() => {
    updateModelHoverState(
      bonfireModel,
      isExperienceHovered,
      0.2,
      0.05,
      "#7a3b17",
      "#2b150b"
    );
    updateModelHoverState(
      treeStumpModel,
      isExperienceHovered,
      0.14,
      0.03,
      "#5e2d17",
      "#24130b"
    );
  }, [bonfireModel, isExperienceHovered, treeStumpModel]);

  const handleSectionPointerEnter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (!(interactiveEnabled || detailInteractiveEnabled)) return;
    onHoverChange(true);
    setInteractiveCursor(true);
  };

  const handleSectionPointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHoverChange(false);
    setInteractiveCursor(false);
  };

  const handleSectionClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (interactiveEnabled) onClick("tablets");
  };

  return (
    <group>
      <group
        position={[1.3, 1.25, 4.5]}
        rotation={[0., -0.12, 0]}
        scale={isExperienceHovered ? 2.08 : 2}
        onPointerEnter={handleSectionPointerEnter}
        onPointerMove={handleSectionPointerEnter}
        onPointerLeave={handleSectionPointerLeave}
        onClick={handleSectionClick}
      >
        <Clone object={bonfireModel} />
      </group>
      {stumpPositions.map((stumpPosition, index) => {
        const entry = EXPERIENCE_ENTRIES[index % EXPERIENCE_ENTRIES.length];
        const hasExperience = Boolean(entry);
        const hasLogoImage = index < EXPERIENCE_ENTRIES.length;
        const logoFrameHeight = 0.17;
        const logoAspectRatio = hasLogoImage
          ? tabletImageDimensions[index].width / tabletImageDimensions[index].height
          : 1;
        const logoFrameWidth = Math.min(0.2, logoFrameHeight * logoAspectRatio);
        const logoPlaqueWidth = Math.min(0.24, logoFrameWidth + 0.038);
        const logoPlaqueHeight = logoFrameHeight + 0.028;
        // Tree stump mesh is normalized then rendered at scale 0.12, which places
        // the visible top surface notably above the stump group's origin.
        // Keep the thumbnail plaque anchored just above that top surface.
        const logoY = 0.34;
        const logoZ = 0;
        const stumpHovered = hoveredTabletId === entry.id;
        const stumpRotation = -0.6 + index * 0.42;
        const handleStumpPointerEnter = (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          if (!hasExperience) return;
          if (interactiveEnabled || detailInteractiveEnabled) {
            setHoveredTabletId(entry.id);
            onHoverChange(true);
            setInteractiveCursor(true);
          }
        };
        const handleStumpPointerLeave = (event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          if (!hasExperience) return;
          setHoveredTabletId((current) => (current === entry.id ? null : current));
          onHoverChange(false);
          setInteractiveCursor(false);
        };
        const handleStumpClick = (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (!hasExperience) return;
          if (interactiveEnabled) onClick("tablets");
          if (detailInteractiveEnabled) onDetailSelect(entry.id);
        };

        return (
          <group
            key={`stump-${index}`}
            position={stumpPosition}
            rotation={[0, stumpRotation, 0]}
            scale={isExperienceHovered ? 1.05 : 1}
            onPointerEnter={handleStumpPointerEnter}
            onPointerMove={handleStumpPointerEnter}
            onPointerLeave={handleStumpPointerLeave}
            onClick={handleStumpClick}
          >
            <group scale={0.12}>
              <Clone object={treeStumpModel} />
            </group>
            {hasLogoImage && (
              <>
                <mesh
                  position={[0, logoY, logoZ]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  receiveShadow
                >
                  <boxGeometry args={[logoPlaqueWidth, logoPlaqueHeight, 0.012]} />
                  <meshStandardMaterial
                    color="#ece8de"
                    roughness={0.84}
                    metalness={0.02}
                  />
                </mesh>
                <mesh
                  position={[0, logoY + 0.008, logoZ]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <planeGeometry args={[logoFrameWidth, logoFrameHeight]} />
                  <meshBasicMaterial
                    map={tabletTextures[index]}
                    color={
                      stumpHovered
                        ? environmentPalette.tabletImageHover
                        : environmentPalette.tabletImageIdle
                    }
                    transparent
                    opacity={stumpHovered ? 0.95 : 0.82}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                </mesh>
                <mesh
                  position={[0, 0.18, 0.08]}
                  rotation={[-Math.PI / 2.6, 0, 0]}
                  visible={stumpHovered || hovered}
                >
                  <ringGeometry args={[0.11, 0.135, 6]} />
                  <meshStandardMaterial
                    color={environmentPalette.tabletHover}
                    emissive={environmentPalette.tabletEmissiveHover}
                    emissiveIntensity={0.32}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              </>
            )}
            <mesh
              position={[0, 0.07, 0]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.12, 0.18, 0.14, 6]} />
              <meshStandardMaterial
                color={environmentPalette.tabletBase}
                flatShading
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

useGLTF.preload("/models/Pine.glb");
useGLTF.preload("/models/Wooden Sign.glb");
useGLTF.preload("/models/Mountain.glb");
useGLTF.preload("/models/Bonfire.glb");
useGLTF.preload("/models/Tree stump.glb");

function MountainRopeBridge() {
  const bridgeGltf = useGLTF("/models/rope bridge.glb");
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
  const mountainGltf = useGLTF("/models/Mountain.glb");

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
        <group
          key={offset}
          position={[index * 4.8 - 8.2, 6.5, -19 + index * 2]}
          scale={[1.24, 0.56, 0.86]}
        >
          <mesh position={[0, 0, 0]}>
            <dodecahedronGeometry args={[1.06, 0]} />
            <meshStandardMaterial
              color={environmentPalette.cloudMain}
              flatShading
              transparent
              opacity={0.88}
            />
          </mesh>
          <mesh position={[-1.18, 0.12, 0.12]}>
            <dodecahedronGeometry args={[0.75, 0]} />
            <meshStandardMaterial
              color={environmentPalette.cloudBright}
              flatShading
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[1.12, 0.1, 0.04]}>
            <dodecahedronGeometry args={[0.83, 0]} />
            <meshStandardMaterial
              color={environmentPalette.cloudCool}
              flatShading
              transparent
              opacity={0.86}
            />
          </mesh>
          <mesh position={[0.22, 0.3, 0.12]} scale={[0.88, 0.78, 0.9]}>
            <dodecahedronGeometry args={[0.63, 0]} />
            <meshStandardMaterial
              color={environmentPalette.cloudCore}
              flatShading
              transparent
              opacity={0.9}
            />
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
    <group
      position={[1.15, 1.37, 5.5]}
      rotation={[0, -0.16, 0]}
      scale={baseScale}
    >
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
        color={hovered ? "#3a2a16" : "#2a1a10"}
        outlineWidth={hovered ? 0.012 : 0.006}
        outlineColor={hovered ? "#3a2a16" : "#2d210f"}
      >
        Experience
      </Text>
      <Text
        position={[0.01, -0.1, 0.074]}
        fontSize={textSize}
        letterSpacing={0.03}
        anchorX="center"
        anchorY="middle"
        color={hovered ? "#ffd8a5" : "#c79b62"}
        fillOpacity={hovered ? 1 : 0.92}
      >
        Experience
      </Text>
      <mesh
        position={[0, -0.12, 0.1]}
        renderOrder={-1}
      >
        <boxGeometry args={[1.34, 0.32, 0.28]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
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
  signRef,
}: TrailheadTimelineSignProps) {
  const woodenSignGltf = useGLTF("/models/Wooden Sign.glb");
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
      hitAreaSize: [boundsSize.x, boundsSize.y, boundsSize.z] as [
        number,
        number,
        number
      ],
      hitAreaOffset: [boundsCenter.x, boundsCenter.y, boundsCenter.z] as [
        number,
        number,
        number
      ],
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
    <group
      ref={signRef}
      position={[-0.9, 1.2, -5.5]}
      rotation={[0, 0.22, 0]}
      scale={signScale}
    >
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
          if (interactiveEnabled) onClick("timeline");
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
        color={hovered ? "#f7ebd2" : environmentPalette.signText}
      >
        Timeline
      </Text>
    </group>
  );
}

function GrassGround() {
  const gl = useThree((state) => state.gl);
  const mainIslandTexture = useTexture(
    "/textures-optimized/aerial_grass_rock_diff_4k.jpg"
  );
  const mainIslandHalfCircleCenterZ = 10;

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
    mainIslandTexture.colorSpace = SRGBColorSpace;
    mainIslandTexture.wrapS = RepeatWrapping;
    mainIslandTexture.wrapT = RepeatWrapping;
    mainIslandTexture.repeat.set(2.85, 2.85);
    mainIslandTexture.anisotropy = maxAnisotropy;
    mainIslandTexture.needsUpdate = true;
  }, [gl, mainIslandTexture]);

  return (
    <mesh
      position={[0, 1, mainIslandHalfCircleCenterZ]}
      rotation={[0, -Math.PI / 2, 0]}
      scale={2}
      receiveShadow
    >
      <cylinderGeometry
        args={[8.9, 10.2, 0.25, 96, 8, false, Math.PI, Math.PI]}
      />
      <meshStandardMaterial
        map={mainIslandTexture}
        color="#bfd19c"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function SceneFloor() {
  return (
    <mesh
      position={[0, -0.25, -1]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
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
  reducedMotion,
}: LowPolyEnvironmentProps) {
  const handleExperienceSectionHover = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      if (!(tabletsInteractiveEnabled || tabletsDetailInteractiveEnabled)) return;
      onTabletsHoverChange(true);
      setInteractiveCursor(true);
    },
    [
      onTabletsHoverChange,
      tabletsDetailInteractiveEnabled,
      tabletsInteractiveEnabled,
    ]
  );

  const handleExperienceSectionLeave = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      onTabletsHoverChange(false);
      setInteractiveCursor(false);
    },
    [onTabletsHoverChange]
  );

  const handleExperienceSectionClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      if (tabletsInteractiveEnabled) onTabletsClick("tablets");
    },
    [onTabletsClick, tabletsInteractiveEnabled]
  );

  return (
    <group>
      <SceneFloor />

      <mesh
        position={[0, 0, 3.2]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[8.2, 9.4, 2.2, 96, 1, false, Math.PI, Math.PI]}
        />
        <meshStandardMaterial color={PALETTE.islandSide} flatShading />
      </mesh>

      <GrassGround />

      <MountainRopeBridge />

      <group
        onPointerEnter={handleExperienceSectionHover}
        onPointerMove={handleExperienceSectionHover}
        onPointerLeave={handleExperienceSectionLeave}
        onClick={handleExperienceSectionClick}
      >
        <ExperienceEngraving
          hovered={tabletsHovered && tabletsInteractiveEnabled}
        />
      </group>
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
      <Tree position={[-7.5, 1.08, 1.8]} scale={0.7} />
      <Tree position={[-9.5, 1.08, -2]} scale={0.9} />
      <Tree position={[-6, 1.08, -2]} scale={1.1} />
      <Tree position={[9, 1.08, -2]} scale={1.1} />
      <Tree position={[8, 1.08, 2]} scale={1.1} />

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

useGLTF.preload("/models/rope bridge.glb");
