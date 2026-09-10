"use client";

import gsap from "gsap";
import { memo, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, SCENE_ANCHORS, SCENE_QUALITY_PRESETS, type SceneQualityTier } from "@/config/sceneConfig";
import { VISUAL_TOKENS } from "@/config/visualTokens";

import {
  CABIN_INTERIOR_ARTWORKS,
  CABIN_INTERIOR_MODEL_ASSETS,
  CABIN_INTERIOR_TEXTURE_ASSETS,
  GALLERY_PHOTOS,
  type GalleryPhoto,
} from "./cabinAssets";

const configureRepeatingTexture = (
  texture: THREE.Texture,
  repeatX: number,
  repeatY: number,
  maxAnisotropy: number,
) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = maxAnisotropy;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
};

const setInteractiveCursor = (isPointer: boolean) => {
  document.body.style.cursor = isPointer ? "pointer" : "auto";
};

const PHOTO_COLORS = VISUAL_TOKENS.scene.cabinInterior.photoPalette;

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

type CabinInteriorProps = {
  visible: boolean;
  photosInteractive: boolean;
  onPhotoSelect: (photoId: string) => void;
  onDartboardSelect: () => void;
  qualityTier: SceneQualityTier;
};

/** Starts cabin-only network work without doing anything at module evaluation time. */
export function preloadCabinInteriorAssets() {
  CABIN_INTERIOR_MODEL_ASSETS.forEach((assetPath) => {
    useGLTF.preload(assetPath);
  });
  useTexture.preload([...CABIN_INTERIOR_TEXTURE_ASSETS]);
}

export function clearCabinInteriorAssets() {
  CABIN_INTERIOR_MODEL_ASSETS.forEach((assetPath) => {
    useGLTF.clear(assetPath);
  });
  CABIN_INTERIOR_TEXTURE_ASSETS.forEach((assetPath) => {
    useTexture.clear(assetPath);
  });
}

export const CabinInterior = memo(function CabinInterior({
  visible,
  photosInteractive,
  onPhotoSelect,
  onDartboardSelect,
  qualityTier,
}: CabinInteriorProps) {
  const quality = SCENE_QUALITY_PRESETS[qualityTier];
  const { cabinInterior } = VISUAL_TOKENS.scene;
  const chairGltf = useGLTF("/models/Chair.glb");
  const tableGltf = useGLTF("/models/Table.glb");
  const crtGltf = useGLTF("/models/CRT.glb");
  const dartboardGltf = useGLTF("/models/Dartboard.glb");
  const mirrorCubeGltf = useGLTF("/models/Mirror Cube.glb");
  const gameCubeControllerGltf = useGLTF("/models/Game Cube Controller.glb");
  const chairModel = useMemo(() => {
    const chairScene = chairGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(chairScene);
    chairScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = quality.shadows;
        child.receiveShadow = quality.shadows;
      }
    });
    return chairScene;
  }, [chairGltf.scene, quality.shadows]);
  const tableModel = useMemo(() => {
    const tableScene = tableGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(tableScene);
    tableScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = quality.shadows;
        child.receiveShadow = quality.shadows;
      }
    });
    tableScene.updateMatrixWorld(true);
    const tableBounds = new THREE.Box3().setFromObject(tableScene);
    const tableCenter = tableBounds.getCenter(new THREE.Vector3());
    tableScene.position.x -= tableCenter.x;
    tableScene.position.z -= tableCenter.z;
    tableScene.position.y -= tableBounds.min.y;
    return tableScene;
  }, [quality.shadows, tableGltf.scene]);
  const crtModel = useMemo(() => {
    const crtScene = crtGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(crtScene);
    crtScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = quality.shadows;
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
  }, [crtGltf.scene, quality.shadows]);
  const dartboardModel = useMemo(() => {
    const dartboardScene = dartboardGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(dartboardScene);
    dartboardScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = quality.shadows;
      }
    });
    dartboardScene.updateMatrixWorld(true);
    const dartboardBounds = new THREE.Box3().setFromObject(dartboardScene);
    const dartboardSize = dartboardBounds.getSize(new THREE.Vector3());
    const dartboardCenter = dartboardBounds.getCenter(new THREE.Vector3());
    dartboardScene.position.x -= dartboardCenter.x;
    dartboardScene.position.y -= dartboardCenter.y;
    dartboardScene.position.z -= dartboardCenter.z;
    return { scene: dartboardScene, size: dartboardSize };
  }, [dartboardGltf.scene, quality.shadows]);
  const mirrorCubeModel = useMemo(() => {
    const mirrorCubeScene = mirrorCubeGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(mirrorCubeScene);
    mirrorCubeScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = quality.shadows;
      }
    });
    mirrorCubeScene.updateMatrixWorld(true);
    const mirrorCubeBounds = new THREE.Box3().setFromObject(mirrorCubeScene);
    const mirrorCubeSize = mirrorCubeBounds.getSize(new THREE.Vector3());
    const mirrorCubeCenter = mirrorCubeBounds.getCenter(new THREE.Vector3());
    mirrorCubeScene.position.x -= mirrorCubeCenter.x;
    mirrorCubeScene.position.y -= mirrorCubeCenter.y;
    mirrorCubeScene.position.z -= mirrorCubeCenter.z;
    return { scene: mirrorCubeScene, size: mirrorCubeSize };
  }, [mirrorCubeGltf.scene, quality.shadows]);
  const gameCubeControllerModel = useMemo(() => {
    const controllerScene = gameCubeControllerGltf.scene.clone(true);
    forceDiffuseOnlyOnSceneMaterials(controllerScene);
    controllerScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = quality.shadows;
      }
    });
    controllerScene.updateMatrixWorld(true);
    const controllerBounds = new THREE.Box3().setFromObject(controllerScene);
    const controllerSize = controllerBounds.getSize(new THREE.Vector3());
    const controllerCenter = controllerBounds.getCenter(new THREE.Vector3());
    controllerScene.position.x -= controllerCenter.x;
    controllerScene.position.z -= controllerCenter.z;
    controllerScene.position.y -= controllerCenter.y;
    return { scene: controllerScene, size: controllerSize };
  }, [gameCubeControllerGltf.scene, quality.shadows]);
  const crtScale = useMemo(() => {
    if (crtModel.size.y <= Number.EPSILON) return 1;
    const desiredMonitorHeight = 0.22;
    return desiredMonitorHeight / crtModel.size.y;
  }, [crtModel.size.y]);
  const dartboardScale = useMemo(() => {
    if (dartboardModel.size.y <= Number.EPSILON) return 1;
    const desiredDartboardHeight = 0.38;
    return desiredDartboardHeight / dartboardModel.size.y;
  }, [dartboardModel.size.y]);
  const mirrorCubeScale = useMemo(() => {
    if (mirrorCubeModel.size.y <= Number.EPSILON) return 1;
    const desiredCubeHeight = 0.17;
    return desiredCubeHeight / mirrorCubeModel.size.y;
  }, [mirrorCubeModel.size.y]);
  const gameCubeControllerScale = useMemo(() => {
    if (gameCubeControllerModel.size.x <= Number.EPSILON) return 1;
    const desiredControllerWidth = 0.18;
    return desiredControllerWidth / gameCubeControllerModel.size.x;
  }, [gameCubeControllerModel.size.x]);
  const gameCubeControllerPosition = useMemo<[number, number, number]>(
    () => [-0.3, -0.11, 0],
    [],
  );
  const gameCubeControllerRotation = useMemo<[number, number, number]>(
    () => [Math.PI / 2, 2, -Math.PI / 2],
    [],
  );
  const galleryTextureSources = useMemo(
    () => Array.from(new Set(GALLERY_PHOTOS.map((photo) => photo.textureSrc))),
    [],
  );
  const galleryTextures = useTexture(galleryTextureSources);
  const galleryTextureBySrc = useMemo(
    () =>
      galleryTextureSources.reduce<Record<string, THREE.Texture>>(
        (texturesBySrc, source, index) => {
          const texture = galleryTextures[index];
          if (texture) {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 4;
            texture.needsUpdate = true;
            texturesBySrc[source] = texture;
          }
          return texturesBySrc;
        },
        {},
      ),
    [galleryTextureSources, galleryTextures],
  );
  const [primaryPaintingTexture, secondaryPaintingTexture] = useTexture([
    CABIN_INTERIOR_ARTWORKS[0].textureSrc,
    CABIN_INTERIOR_ARTWORKS[1].textureSrc,
  ]);
  const [mirrorCubeUpperTexture, mirrorCubeLowerTexture] = useTexture([
    CABIN_INTERIOR_ARTWORKS[2].textureSrc,
    CABIN_INTERIOR_ARTWORKS[3].textureSrc,
  ]);
  const crtThumbnailTexture = useTexture("/gallery/vidthumb.webp");
  const [framedPaintingTexture, wallMountedPaintingTexture] = useMemo(() => {
    const configureTexture = (texture: THREE.Texture | undefined) => {
      if (!texture) return null;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      texture.needsUpdate = true;
      return texture;
    };
    return [
      configureTexture(primaryPaintingTexture),
      configureTexture(secondaryPaintingTexture),
    ];
  }, [primaryPaintingTexture, secondaryPaintingTexture]);
  const [configuredMirrorCubeUpperTexture, configuredMirrorCubeLowerTexture] =
    useMemo(() => {
      const configureTexture = (texture: THREE.Texture | undefined) => {
        if (!texture) return null;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        texture.needsUpdate = true;
        return texture;
      };
      return [
        configureTexture(mirrorCubeUpperTexture),
        configureTexture(mirrorCubeLowerTexture),
      ];
    }, [mirrorCubeLowerTexture, mirrorCubeUpperTexture]);
  const photoRefs = useRef<Record<string, THREE.Group | null>>({});
  const cabinInteriorRef = useRef<THREE.Group | null>(null);
  const framedPaintingInteractiveRef = useRef<THREE.Group | null>(null);
  const wallMountedPaintingInteractiveRef = useRef<THREE.Group | null>(null);
  const dartboardInteractiveRef = useRef<THREE.Group | null>(null);
  const crtInteractiveRef = useRef<THREE.Group | null>(null);
  const mirrorCubeUpperInteractiveRef = useRef<THREE.Group | null>(null);
  const mirrorCubeLowerInteractiveRef = useRef<THREE.Group | null>(null);
  const hoveredPhotoIdRef = useRef<string | null>(null);
  const [woodFloorTexture, wallTexture, tableTexture] = useTexture([
    "/textures-optimized/wood_floor_worn_diff_4k.jpg",
    "/textures-optimized/stained_pine_diff_4k.jpg",
    "/textures-optimized/oak_veneer_01_diff_4k.jpg",
  ]);
  const gl = useThree((state) => state.gl);
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

  useMemo(() => {
    crtThumbnailTexture.colorSpace = THREE.SRGBColorSpace;
    crtThumbnailTexture.anisotropy = maxAnisotropy;
    crtThumbnailTexture.needsUpdate = true;
    configureRepeatingTexture(woodFloorTexture, 1.1, 1.45, maxAnisotropy);
    configureRepeatingTexture(wallTexture, 2.2, 1.6, maxAnisotropy);
    wallTexture.center.set(0.5, 0.5);
    wallTexture.rotation = Math.PI / 2;
    configureRepeatingTexture(tableTexture, 1.4, 1.4, maxAnisotropy);
  }, [
    crtThumbnailTexture,
    maxAnisotropy,
    tableTexture,
    wallTexture,
    woodFloorTexture,
  ]);

  useEffect(() => {
    tableModel.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const applyTextureToMaterial = (material: THREE.Material) => {
        if (
          !(material instanceof THREE.MeshStandardMaterial) &&
          !(material instanceof THREE.MeshLambertMaterial)
        )
          return;
        material.map = tableTexture;
        material.color.set("#c7956f");
        material.needsUpdate = true;
      };
      if (Array.isArray(child.material)) {
        child.material.forEach(applyTextureToMaterial);
        return;
      }
      applyTextureToMaterial(child.material);
    });
  }, [tableModel, tableTexture]);

  const startPhotoHover = (photo: GalleryPhoto) => {
    if (!photosInteractive || hoveredPhotoIdRef.current === photo.id) return;
    hoveredPhotoIdRef.current = photo.id;
    const group = photoRefs.current[photo.id];
    if (!group) return;
    setInteractiveCursor(true);
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    gsap.to(group.scale, {
      x: 1.07,
      y: 1.07,
      z: 1.07,
      duration: 0.18,
      ease: "power2.out",
    });
    gsap.to(group.position, {
      z: photo.position[2] + 0.018,
      duration: 0.18,
      ease: "power2.out",
    });
  };

  const endPhotoHover = (photo: GalleryPhoto) => {
    if (hoveredPhotoIdRef.current !== photo.id) return;
    hoveredPhotoIdRef.current = null;
    const group = photoRefs.current[photo.id];
    if (!group) return;
    setInteractiveCursor(false);
    gsap.killTweensOf(group.scale);
    gsap.killTweensOf(group.position);
    gsap.to(group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.18,
      ease: "power2.out",
    });
    gsap.to(group.position, {
      z: photo.position[2],
      duration: 0.18,
      ease: "power2.out",
    });
  };

  const startArtworkHover = (
    artworkRef: MutableRefObject<THREE.Group | null>,
    baseScale: number,
  ) => {
    if (!photosInteractive) return;
    const artworkGroup = artworkRef.current;
    if (!artworkGroup) return;
    setInteractiveCursor(true);
    gsap.killTweensOf(artworkGroup.scale);
    const hoverScale = baseScale * 1.03;
    gsap.to(artworkGroup.scale, {
      x: hoverScale,
      y: hoverScale,
      z: hoverScale,
      duration: 0.18,
      ease: "power2.out",
    });
  };

  const endArtworkHover = (
    artworkRef: MutableRefObject<THREE.Group | null>,
    baseScale: number,
  ) => {
    const artworkGroup = artworkRef.current;
    if (!artworkGroup) return;
    setInteractiveCursor(false);
    gsap.killTweensOf(artworkGroup.scale);
    gsap.to(artworkGroup.scale, {
      x: baseScale,
      y: baseScale,
      z: baseScale,
      duration: 0.18,
      ease: "power2.out",
    });
  };

  const startDartboardHover = () => {
    if (!photosInteractive) return;
    const dartboardGroup = dartboardInteractiveRef.current;
    if (!dartboardGroup) return;
    setInteractiveCursor(true);
    gsap.killTweensOf(dartboardGroup.scale);
    gsap.to(dartboardGroup.scale, {
      x: 1.03,
      y: 1.03,
      z: 1.03,
      duration: 0.18,
      ease: "power2.out",
    });
  };

  const endDartboardHover = () => {
    const dartboardGroup = dartboardInteractiveRef.current;
    if (!dartboardGroup) return;
    setInteractiveCursor(false);
    gsap.killTweensOf(dartboardGroup.scale);
    gsap.to(dartboardGroup.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.18,
      ease: "power2.out",
    });
  };

  const isMirrorCubeHoverAllowed = <TEvent extends Event>(
    event: ThreeEvent<TEvent>,
  ) => {
    if (!photosInteractive) return false;
    const cabinGroup = cabinInteriorRef.current;
    if (!cabinGroup) return false;
    const localCamera = cabinGroup.worldToLocal(event.ray.origin.clone());
    const localHitPoint = cabinGroup.worldToLocal(event.point.clone());
    const rightInteriorWallX = 0.85;
    const isCameraInsideRightWall = localCamera.x < rightInteriorWallX;
    const isHitInsideRightWall = localHitPoint.x < rightInteriorWallX;
    return isCameraInsideRightWall && isHitInsideRightWall;
  };

  return (
    <group
      visible={visible}
      position={SCENE_ANCHORS.cabin}
      rotation={[0, -0.46, 0]}
      scale={1.28}
      ref={cabinInteriorRef}
    >
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1.86, 0.22, 3]} />
        <meshStandardMaterial
          color="#ffffff"
          map={woodFloorTexture}
          roughness={1}
          metalness={0.02}
        />
      </mesh>

      <mesh position={[0, 0.94, -0.8]} receiveShadow>
        <boxGeometry args={[1.86, 1.8, 0.08]} />
        <meshStandardMaterial
          color="#ffffff"
          map={wallTexture}
          roughness={1}
          metalness={0.01}
        />
      </mesh>

      <mesh position={[-0.89, 0.94, -0.08]} receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.52]} />
        <meshStandardMaterial
          color="#ffffff"
          map={wallTexture}
          roughness={1}
          metalness={0.01}
        />
      </mesh>

      <mesh position={[0.89, 0.94, -0.08]} receiveShadow>
        <boxGeometry args={[0.08, 1.8, 4]} />
        <meshStandardMaterial
          color="#ffffff"
          map={wallTexture}
          roughness={1}
          metalness={0.01}
        />
      </mesh>

      <mesh position={[0, 1.82, -0.08]} receiveShadow>
        <boxGeometry args={[1.86, 0.08, 1.52]} />
        <meshStandardMaterial
          color="#ffffff"
          map={wallTexture}
          roughness={1}
          metalness={0.01}
        />
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

      <group
        position={[-0.62, 0.13, -0.12]}
        scale={0.015}
        rotation={[0, Math.PI / 2, 0]}
      >
        <primitive object={tableModel} />
      </group>

      <group position={gameCubeControllerPosition}>
        <group rotation={gameCubeControllerRotation}>
          <primitive
            object={gameCubeControllerModel.scene}
            scale={gameCubeControllerScale}
          />
        </group>
      </group>

      <primitive
        object={chairModel}
        position={[-0.2, 0.05, 0]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={0.05}
      />

      <group
        position={[-0.98, -0.02, -0.5]}
        rotation={[0, -Math.PI / 1.6, 0]}
        ref={crtInteractiveRef}
        onPointerEnter={(event) => {
          if (!photosInteractive) return;
          event.stopPropagation();
          startArtworkHover(crtInteractiveRef, 1);
        }}
        onPointerMove={(event) => {
          if (!photosInteractive) return;
          event.stopPropagation();
          startArtworkHover(crtInteractiveRef, 1);
        }}
        onPointerLeave={(event) => {
          if (!photosInteractive) return;
          event.stopPropagation();
          endArtworkHover(crtInteractiveRef, 1);
        }}
        onClick={(event) => {
          if (!photosInteractive) return;
          event.stopPropagation();
          onPhotoSelect("artwork-crt-video");
        }}
      >
        <primitive object={crtModel.scene} scale={crtScale} />
        <mesh position={[-0.01, 1.12, -0.675]} scale={crtScale}>
          <planeGeometry args={[1.55, 0.872]} />
          <meshBasicMaterial map={crtThumbnailTexture} toneMapped={false} />
        </mesh>
        <mesh
          position={[0, 0.12, 0]}
          onPointerEnter={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startArtworkHover(crtInteractiveRef, 1);
          }}
          onPointerMove={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startArtworkHover(crtInteractiveRef, 1);
          }}
          onPointerLeave={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            endArtworkHover(crtInteractiveRef, 1);
          }}
          onClick={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            onPhotoSelect("artwork-crt-video");
          }}
        >
          <boxGeometry args={[0.3, 0.24, 0.25]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      <group
        position={[0.85, 0.5, 0]}
        rotation={[0, -Math.PI, 0]}
        ref={dartboardInteractiveRef}
      >
        <primitive object={dartboardModel.scene} scale={dartboardScale} />
        <mesh
          position={[0, 0.5, 0]}
          rotation={[0, 0, Math.PI / 2]}
          onPointerEnter={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startDartboardHover();
          }}
          onPointerMove={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startDartboardHover();
          }}
          onPointerLeave={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            endDartboardHover();
          }}
          onClick={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            onDartboardSelect();
          }}
        >
          <cylinderGeometry args={[0.18, 0.18, 0.1, 36]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      <group
        position={[0.9, 1.41, -0.45]}
        rotation={[0.07, -Math.PI / 2, 0.06]}
        scale={2}
        ref={mirrorCubeUpperInteractiveRef}
      >
        <primitive
          object={mirrorCubeModel.scene.clone()}
          scale={mirrorCubeScale}
        />
        <mesh position={[0, 0, 0.084]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshStandardMaterial
            color="#ffffff"
            map={configuredMirrorCubeUpperTexture ?? undefined}
            roughness={0.7}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh
          onPointerEnter={(event) => {
            if (!isMirrorCubeHoverAllowed(event)) return;
            event.stopPropagation();
            startArtworkHover(mirrorCubeUpperInteractiveRef, 2);
          }}
          onPointerMove={(event) => {
            if (!isMirrorCubeHoverAllowed(event)) {
              endArtworkHover(mirrorCubeUpperInteractiveRef, 2);
              return;
            }
            event.stopPropagation();
            startArtworkHover(mirrorCubeUpperInteractiveRef, 2);
          }}
          onPointerLeave={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            endArtworkHover(mirrorCubeUpperInteractiveRef, 2);
          }}
          onClick={(event) => {
            if (!isMirrorCubeHoverAllowed(event)) return;
            event.stopPropagation();
            onPhotoSelect("artwork-mirror-cube-upper");
          }}
        >
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      <group
        position={[0.9, 0.7, -0.45]}
        rotation={[0.07, -Math.PI / 2, 0.06]}
        scale={2}
        ref={mirrorCubeLowerInteractiveRef}
      >
        <primitive
          object={mirrorCubeModel.scene.clone()}
          scale={mirrorCubeScale * 0.94}
        />
        <mesh position={[0, 0, 0.079]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshStandardMaterial
            color="#ffffff"
            map={configuredMirrorCubeLowerTexture ?? undefined}
            roughness={0.7}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh
          onPointerEnter={(event) => {
            if (!isMirrorCubeHoverAllowed(event)) return;
            event.stopPropagation();
            startArtworkHover(mirrorCubeLowerInteractiveRef, 2);
          }}
          onPointerMove={(event) => {
            if (!isMirrorCubeHoverAllowed(event)) {
              endArtworkHover(mirrorCubeLowerInteractiveRef, 2);
              return;
            }
            event.stopPropagation();
            startArtworkHover(mirrorCubeLowerInteractiveRef, 2);
          }}
          onPointerLeave={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            endArtworkHover(mirrorCubeLowerInteractiveRef, 2);
          }}
          onClick={(event) => {
            if (!isMirrorCubeHoverAllowed(event)) return;
            event.stopPropagation();
            onPhotoSelect("artwork-mirror-cube-lower");
          }}
        >
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      <group
        position={[-0.85, 1.2, -0.4]}
        rotation={[0.05, -Math.PI / 15, 0]}
        scale={0.4}
        ref={framedPaintingInteractiveRef}
      >
        {/* <primitive object={paintingModel} /> */}
        <mesh
          position={[0.18, 0.034, 0.8]}
          rotation={[-0.01, 96, -0.05]} // [x, y, z] in radians
          scale={0.911}
        >
          <planeGeometry args={[0.72, 0.48]} />
          <meshStandardMaterial
            color={"#ffffff"}
            map={framedPaintingTexture ?? undefined}
            roughness={0.82}
            metalness={0.04}
          />
        </mesh>
        <mesh
          position={[0.18, 0.034, 0.84]}
          onPointerEnter={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startArtworkHover(framedPaintingInteractiveRef, 0.4);
          }}
          onPointerMove={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startArtworkHover(framedPaintingInteractiveRef, 0.4);
          }}
          onPointerLeave={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            endArtworkHover(framedPaintingInteractiveRef, 0.4);
          }}
          onClick={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            onPhotoSelect("artwork-framed-painting");
          }}
        >
          <boxGeometry args={[0.84, 0.6, 0.08]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      <group
        position={[-0.84, 1.2, 0]}
        rotation={[0, Math.PI / 1, 1.6]}
        scale={0.0007}
        ref={wallMountedPaintingInteractiveRef}
      >
        {/* <primitive object={wallPaintingModel} /> */}
        <mesh
          position={[0, -10, 550]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2.01]}
        >
          <planeGeometry args={[210, 255]} />
          <meshStandardMaterial
            color="#ffffff"
            map={wallMountedPaintingTexture ?? undefined}
            roughness={0.82}
            metalness={0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh
          position={[0, -10, 550]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2.01]}
          onPointerEnter={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startArtworkHover(wallMountedPaintingInteractiveRef, 0.0007);
          }}
          onPointerMove={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            startArtworkHover(wallMountedPaintingInteractiveRef, 0.0007);
          }}
          onPointerLeave={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            endArtworkHover(wallMountedPaintingInteractiveRef, 0.0007);
          }}
          onClick={(event) => {
            if (!photosInteractive) return;
            event.stopPropagation();
            onPhotoSelect("artwork-wall-mounted-painting");
          }}
        >
          <boxGeometry args={[235, 275, 20]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
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
            <meshStandardMaterial
              color={cabinInterior.lampGlow}
              emissive={cabinInterior.lampGlow}
              emissiveIntensity={1.2}
              flatShading
            />
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
          <meshStandardMaterial
            color={cabinInterior.lampGlow}
            emissive={cabinInterior.lampGlow}
            emissiveIntensity={1.35}
            flatShading
          />
        </mesh>
        <pointLight
          color={cabinInterior.lampGlow}
          intensity={1.05}
          distance={2.3}
          decay={1.8}
          position={[0, -0.24, 0]}
          castShadow
        />
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
          <meshStandardMaterial color={"#628e5e"} flatShading />
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
            <meshBasicMaterial
              color={PHOTO_COLORS[index % PHOTO_COLORS.length]}
            />
          </mesh>
          <mesh name={`gallery-photo-${photo.id}`} position={[0, 0, 0.001]}>
            <planeGeometry
              args={[photo.size[0] * 0.88, photo.size[1] * 0.84]}
            />
            <meshStandardMaterial
              color={"#ffffff"}
              map={galleryTextureBySrc[photo.textureSrc]}
              roughness={0.85}
              metalness={0.03}
            />
          </mesh>
          <mesh position={[0, 0, -0.002]}>
            <planeGeometry
              args={[photo.size[0] + 0.016, photo.size[1] + 0.016]}
            />
            <meshStandardMaterial color={PALETTE.cabinWall} flatShading />
          </mesh>
          <mesh
            position={[photo.pinOffsetX, photo.size[1] * 0.5 + 0.012, 0.004]}
            castShadow
          >
            <cylinderGeometry args={[0.007, 0.007, 0.012, 10]} />
            <meshStandardMaterial
              color={cabinInterior.lampMetal}
              roughness={0.45}
              metalness={0.5}
            />
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
            <boxGeometry
              args={[photo.size[0] + 0.08, photo.size[1] + 0.08, 0.1]}
            />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
});
