'use client';

import { Environment, Sky } from '@react-three/drei';
import { Color, Fog } from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PALETTE } from '@/config/sceneConfig';

export function LightingAtmosphere() {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    scene.background = new Color(PALETTE.skyBottom);
    scene.fog = new Fog(PALETTE.fog, 8, 35);
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.52} color="#c7ddf4" />
      <directionalLight
        intensity={1.25}
        position={[6, 10, 5]}
        color="#f5ecd8"
        castShadow
      />
      <pointLight intensity={1.5} color={PALETTE.accentGlow} position={[1.3, 2.8, 1.1]} />
      <Sky distance={160} sunPosition={[4, 1, -8]} turbidity={8} rayleigh={1.2} mieCoefficient={0.008} />
      <Environment preset="night" />
    </>
  );
}
