'use client';

import { Sky } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { ACESFilmicToneMapping, Color, FogExp2, PCFSoftShadowMap } from 'three';
import type { ColorRepresentation } from 'three';
import { PALETTE, SCENE_QUALITY_PRESETS, type SceneQualityTier } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

export function LightingAtmosphere({
  backgroundColor = PALETTE.skyBottom,
  qualityTier,
}: {
  backgroundColor?: ColorRepresentation;
  qualityTier: SceneQualityTier;
}) {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    scene.background = new Color(backgroundColor);
    scene.fog = new FogExp2(PALETTE.fog, 0.022);

    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
    gl.shadowMap.enabled = SCENE_QUALITY_PRESETS[qualityTier].shadows;
    gl.shadowMap.type = PCFSoftShadowMap;
  }, [backgroundColor, gl, qualityTier, scene]);

  const lighting = VISUAL_TOKENS.lighting;
  const quality = SCENE_QUALITY_PRESETS[qualityTier];

  return (
    <>
      <hemisphereLight intensity={lighting.hemisphere.intensity} color={lighting.hemisphere.skyTint} groundColor={lighting.hemisphere.groundTint} />
      <ambientLight intensity={lighting.ambient.intensity} color={lighting.ambient.tint} />

      <directionalLight
        intensity={lighting.key.intensity}
        position={[15, 14, 4]}
        color={lighting.key.tint}
        castShadow={quality.shadows && quality.shadowCastingLights > 0}
        shadow-mapSize-width={quality.shadowMapResolution}
        shadow-mapSize-height={quality.shadowMapResolution}
        shadow-camera-near={1}
        shadow-camera-far={65}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0003}
      />

      <directionalLight intensity={lighting.fill.intensity} position={[-9, 8, -12]} color={lighting.fill.tint} />

      {quality.decorativeEffects && <pointLight intensity={2.1} color={PALETTE.accentGlow} position={[-4.8, 2.9, 0.4]} distance={8} decay={2} />}
      <pointLight intensity={1.25} color={lighting.warmBounce.tint} position={[12, 9, -26]} distance={130} decay={2} />
      <pointLight intensity={lighting.rim.intensity} color={lighting.rim.tint} position={[0.5, 2.2, -6.4]} distance={18} decay={2} />

      <mesh position={[12, 8.5, -28]}>
        <sphereGeometry args={[2.2, 20, 20]} />
        <meshBasicMaterial color={lighting.sun.tint} />
      </mesh>

      {quality.decorativeEffects && <Sky
        distance={260}
        sunPosition={[8, 1.35, -12]}
        turbidity={7}
        rayleigh={1.45}
        mieCoefficient={0.014}
        mieDirectionalG={0.88}
      />}
    </>
  );
}
