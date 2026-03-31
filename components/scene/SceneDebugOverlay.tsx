'use client';

import { Html, Text } from '@react-three/drei';
import { CAMERA_PRESETS } from '@/config/sceneConfig';
import { LANDMARKS } from './landmarks';

export function SceneDebugOverlay() {
  return (
    <group>
      {LANDMARKS.map((landmark) => (
        <group key={landmark.id} position={landmark.anchor}>
          <mesh>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color="#ff4a68" />
          </mesh>
          <Html transform distanceFactor={8} position={[0, 0.22, 0]} style={{ pointerEvents: 'none' }}>
            <span className="scene-debug-label">
              {landmark.id}: {landmark.hoverCopy}
            </span>
          </Html>
        </group>
      ))}

      {Object.entries(CAMERA_PRESETS).map(([presetKey, preset]) => (
        <group key={presetKey} position={preset.position}>
          <mesh>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshBasicMaterial color="#59d9ff" wireframe />
          </mesh>
          <Text position={[0, 0.2, 0]} fontSize={0.11} anchorX="center" color="#d4f4ff" outlineWidth={0.006} outlineColor="#042630">
            {presetKey}
          </Text>
        </group>
      ))}
    </group>
  );
}
