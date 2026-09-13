"use client";

import { Html } from "@react-three/drei";
import usa from "@svg-maps/usa";
import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, LinearFilter } from "three";

type UnitedStatesMapProps = {
  interactive: boolean;
  onStateSelect: (stateId: string, trigger: SVGPathElement) => void;
};

type MapLocation = { id: string; name: string; path: string };

const MAP_VIEW_BOX = usa.viewBox.split(" ").map(Number);
const [, , MAP_WIDTH, MAP_HEIGHT] = MAP_VIEW_BOX;
const MAP_WORLD_WIDTH = 5.7;
const MAP_WORLD_HEIGHT = MAP_WORLD_WIDTH * (MAP_HEIGHT / MAP_WIDTH);

function MapTexture({ hoveredState }: { hoveredState: string | null }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;
    const canvasTexture = new CanvasTexture(canvas);
    canvasTexture.minFilter = LinearFilter;
    canvasTexture.magFilter = LinearFilter;
    return canvasTexture;
  }, []);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) return;

    const [viewBoxX, viewBoxY] = MAP_VIEW_BOX;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(-viewBoxX, -viewBoxY);
    context.lineJoin = "round";
    context.lineCap = "round";

    for (const location of usa.locations as MapLocation[]) {
      const path = new Path2D(location.path);
      if (location.id === hoveredState) {
        context.fillStyle = "rgba(224, 188, 114, 0.45)";
        context.fill(path);
        context.strokeStyle = "#fff4d4";
        context.lineWidth = 5;
        context.shadowColor = "rgba(255, 236, 184, 0.95)";
        context.shadowBlur = 8;
      } else {
        context.strokeStyle = "#d8ccb6";
        context.lineWidth = 2.4;
        context.shadowColor = "transparent";
        context.shadowBlur = 0;
      }
      context.stroke(path);
    }

    context.restore();
    texture.needsUpdate = true;
  }, [hoveredState, texture]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[MAP_WORLD_WIDTH, MAP_WORLD_HEIGHT]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function UnitedStatesMap({ interactive, onStateSelect }: UnitedStatesMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <group position={[0.25, 4, -20.72]} rotation={[0, 0.02, 0]}>
      <MapTexture hoveredState={hoveredState} />
      <Html
        transform
        center
        scale={0.3}
        zIndexRange={[4, 0]}
        style={{ pointerEvents: interactive ? "auto" : "none", opacity: 0 }}
      >
        <section
          className="mountain-map"
          data-interactive={interactive || undefined}
          aria-label="Map of the United States"
        >
          <svg viewBox={usa.viewBox} role="group" aria-label={usa.label}>
            {(usa.locations as MapLocation[]).map((location) => {
              const isFeatured = location.id === "nc" || location.id === "vt";
              return (
                <path
                  key={location.id}
                  d={location.path}
                  className={`mountain-map__state${isFeatured ? " mountain-map__state--featured" : ""}`}
                  data-hovered={hoveredState === location.id || undefined}
                  role={interactive ? "button" : undefined}
                  tabIndex={interactive ? 0 : -1}
                  aria-label={`${location.name}${isFeatured ? ", highlighted place" : ""}`}
                  aria-disabled={!interactive || undefined}
                  onPointerEnter={() => {
                    if (interactive) setHoveredState(location.id);
                  }}
                  onPointerLeave={() => setHoveredState(null)}
                  onFocus={() => {
                    if (interactive) setHoveredState(location.id);
                  }}
                  onBlur={() => setHoveredState(null)}
                  onClick={(event) => {
                    if (interactive)
                      onStateSelect(location.id, event.currentTarget);
                  }}
                  onKeyDown={(event) => {
                    if (
                      interactive &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onStateSelect(location.id, event.currentTarget);
                    }
                  }}
                />
              );
            })}
          </svg>
        </section>
      </Html>
    </group>
  );
}
