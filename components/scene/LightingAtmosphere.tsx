'use client';

import { Sky } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { ACESFilmicToneMapping, Color, FogExp2, PCFSoftShadowMap } from 'three';
import { PALETTE } from '@/config/sceneConfig';
import { VISUAL_TOKENS } from '@/config/visualTokens';

export function LightingAtmosphere({
  backgroundColor = PALETTE.skyBottom
}: {
  backgroundColor?: string;
}) {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    scene.background = new Color(backgroundColor);
    scene.fog = new FogExp2(PALETTE.fog, 0.034);

    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = PCFSoftShadowMap;
  }, [backgroundColor, gl, scene]);

  const lighting = VISUAL_TOKENS.lighting;

  return (
    <>
      <hemisphereLight intensity={lighting.hemisphere.intensity} color={lighting.hemisphere.skyTint} groundColor={lighting.hemisphere.groundTint} />
      <ambientLight intensity={lighting.ambient.intensity} color={lighting.ambient.tint} />

      <directionalLight
        intensity={lighting.key.intensity}
        position={[15, 14, 4]}
        color={lighting.key.tint}
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

      <directionalLight intensity={lighting.fill.intensity} position={[-9, 8, -12]} color={lighting.fill.tint} />

      <pointLight intensity={2.1} color={PALETTE.accentGlow} position={[-4.8, 2.9, 0.4]} distance={8} decay={2} />
      <pointLight intensity={1.25} color={lighting.warmBounce.tint} position={[12, 9, -26]} distance={130} decay={2} />
      <pointLight intensity={lighting.rim.intensity} color={lighting.rim.tint} position={[0.5, 2.2, -6.4]} distance={18} decay={2} />

      <mesh position={[12, 8.5, -28]}>
        <sphereGeometry args={[2.2, 20, 20]} />
        <meshBasicMaterial color={lighting.sun.tint} />
      </mesh>

      <Sky
        distance={260}
        sunPosition={[4.5, 1.1, -10]}
        turbidity={8}
        rayleigh={1.2}
        mieCoefficient={0.018}
        mieDirectionalG={0.9}
      />
    </>
  );
}
