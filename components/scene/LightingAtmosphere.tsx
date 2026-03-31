'use client';

import { Sky } from '@react-three/drei';
import { Color, Fog } from 'three';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PALETTE } from '@/config/sceneConfig';

export function LightingAtmosphere() {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    scene.background = new Color(PALETTE.skyBottom);
    scene.fog = new Fog(PALETTE.fog, 9, 38);
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.55} color="#bed3e8" />
      <directionalLight intensity={1.35} position={[7, 11, 6]} color="#f7e8cb" castShadow />
      <pointLight intensity={1.35} color={PALETTE.accentGlow} position={[-4.8, 2.9, 0.4]} />
      <Sky distance={180} sunPosition={[4, 1, -8]} turbidity={7} rayleigh={1.1} mieCoefficient={0.012} />
    </>
  );
}
