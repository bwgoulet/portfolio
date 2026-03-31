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
      <ambientLight intensity={0.62} color="#ffd7ba" />
      <directionalLight intensity={1.45} position={[7, 11, 6]} color="#ffca9e" castShadow />
      <pointLight intensity={1.35} color={PALETTE.accentGlow} position={[-4.8, 2.9, 0.4]} />
      <Sky distance={220} sunPosition={[2, 0.2, -9]} turbidity={9} rayleigh={0.85} mieCoefficient={0.02} />
    </>
  );
}
