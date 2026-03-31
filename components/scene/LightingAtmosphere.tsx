'use client';

import { Sky } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { ACESFilmicToneMapping, Color, FogExp2, PCFSoftShadowMap } from 'three';
import { PALETTE } from '@/config/sceneConfig';

type LightProfile = {
  fogDensity: number;
  fogColor: string;
  exposure: number;
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  hemiIntensity: number;
  ambientIntensity: number;
  sunColor: string;
  skySunPosition: [number, number, number];
  skyRayleigh: number;
  skyTurbidity: number;
};

const ATMOSPHERE_PROFILES: Record<'day' | 'goldenHour', LightProfile> = {
  day: {
    fogDensity: 0.024,
    fogColor: '#aec7da',
    exposure: 1,
    keyIntensity: 1.75,
    fillIntensity: 0.85,
    rimIntensity: 0.65,
    hemiIntensity: 0.52,
    ambientIntensity: 0.18,
    sunColor: '#ffe2b8',
    skySunPosition: [4.9, 2.5, -10],
    skyRayleigh: 1.45,
    skyTurbidity: 7.1
  },
  goldenHour: {
    fogDensity: 0.032,
    fogColor: '#e39e74',
    exposure: 1.08,
    keyIntensity: 2.2,
    fillIntensity: 0.66,
    rimIntensity: 1.05,
    hemiIntensity: 0.6,
    ambientIntensity: 0.24,
    sunColor: '#ffbc84',
    skySunPosition: [4.4, 1.05, -10],
    skyRayleigh: 1.12,
    skyTurbidity: 8.2
  }
};

function getProfileVariant() {
  const utcHour = new Date().getUTCHours();
  return utcHour >= 16 && utcHour <= 23 ? 'goldenHour' : 'day';
}

export function LightingAtmosphere() {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const profileVariant = useMemo(getProfileVariant, []);
  const profile = ATMOSPHERE_PROFILES[profileVariant];

  useEffect(() => {
    scene.background = new Color(PALETTE.skyBottom);
    scene.fog = new FogExp2(profile.fogColor, profile.fogDensity);

    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = profile.exposure;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;
  }, [gl, profile.exposure, profile.fogColor, profile.fogDensity, scene]);

  return (
    <>
      <hemisphereLight intensity={profile.hemiIntensity} color="#ffe3c6" groundColor="#2d3a34" />
      <ambientLight intensity={profile.ambientIntensity} color="#ffd8bf" />

      <directionalLight
        intensity={profile.keyIntensity}
        position={[15, 14, 4]}
        color={profile.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={65}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0003}
      />

      <directionalLight intensity={profile.fillIntensity} position={[-9, 8, -12]} color="#9ab8ff" />
      <directionalLight intensity={profile.rimIntensity} position={[8, 3, -16]} color="#ffc98a" />

      <pointLight intensity={2.1} color={PALETTE.accentGlow} position={[-4.8, 2.9, 0.4]} distance={8} decay={2} />
      <pointLight intensity={1.25} color="#ffc47a" position={[12, 9, -26]} distance={130} decay={2} />
      <pointLight intensity={0.62} color="#9ac1ff" position={[0.5, 2.2, -6.4]} distance={18} decay={2} />

      <mesh position={[12, 8.5, -28]}>
        <sphereGeometry args={[2.2, 20, 20]} />
        <meshBasicMaterial color="#ffcc72" />
      </mesh>

      <Sky
        distance={260}
        sunPosition={profile.skySunPosition}
        turbidity={profile.skyTurbidity}
        rayleigh={profile.skyRayleigh}
        mieCoefficient={0.018}
        mieDirectionalG={0.9}
      />
    </>
  );
}
