"use client";

import { Html } from "@react-three/drei";
import usa from "@svg-maps/usa";
import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, LinearFilter } from "three";
import { STATE_STORIES } from "./stateEntries";

type UnitedStatesMapProps = {
  interactive: boolean;
  onStateSelect: (stateId: string, trigger: SVGPathElement) => void;
  onMapPointerMove: () => void;
};

type MapLocation = { id: string; name: string; path: string };

const MAP_VIEW_BOX = usa.viewBox.split(" ").map(Number);
const [, , MAP_WIDTH, MAP_HEIGHT] = MAP_VIEW_BOX;
const MAP_TEXTURE_PADDING = 12;
const MAP_WORLD_WIDTH = 5.7;
const MAP_WORLD_UNITS_PER_PIXEL = MAP_WORLD_WIDTH / MAP_WIDTH;
const MAP_TEXTURE_WIDTH = MAP_WIDTH + MAP_TEXTURE_PADDING * 2;
const MAP_TEXTURE_HEIGHT = MAP_HEIGHT + MAP_TEXTURE_PADDING * 2;
const MAP_PLANE_WIDTH = MAP_TEXTURE_WIDTH * MAP_WORLD_UNITS_PER_PIXEL;
const MAP_PLANE_HEIGHT = MAP_TEXTURE_HEIGHT * MAP_WORLD_UNITS_PER_PIXEL;
const NEW_YORK_SPECK_PATH =
  "M1049.12,104.45l-0.02,-0.01L1049.12,104.45L1049.12,104.45z";

const getMapPath = (location: MapLocation) =>
  location.id === "ny"
    ? location.path.replace(NEW_YORK_SPECK_PATH, "")
    : location.path;

function MapTexture({ hoveredState }: { hoveredState: string | null }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = MAP_TEXTURE_WIDTH;
    canvas.height = MAP_TEXTURE_HEIGHT;
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
    context.translate(
      MAP_TEXTURE_PADDING - viewBoxX,
      MAP_TEXTURE_PADDING - viewBoxY,
    );
    context.lineJoin = "round";
    context.lineCap = "round";

    for (const location of usa.locations as MapLocation[]) {
      const path = new Path2D(getMapPath(location));
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
      <planeGeometry args={[MAP_PLANE_WIDTH, MAP_PLANE_HEIGHT]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function UnitedStatesMap({
  interactive,
  onStateSelect,
  onMapPointerMove,
}: UnitedStatesMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  useEffect(() => {
    if (!interactive) setHoveredState(null);
  }, [interactive]);

  const selectState = (stateId: string, trigger: SVGPathElement) => {
    setHoveredState(null);
    onStateSelect(stateId, trigger);
  };

  return (
    <group position={[0.25, 4, -20.5]} rotation={[0, 0.02, 0]}>
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
          onPointerMove={onMapPointerMove}
        >
          <svg viewBox={usa.viewBox} role="group" aria-label={usa.label}>
            {(usa.locations as MapLocation[]).map((location) => {
              const isComplete = STATE_STORIES[location.id]?.status === "complete";
              return (
                <path
                  key={location.id}
                  d={getMapPath(location)}
                  className={`mountain-map__state${isComplete ? " mountain-map__state--complete" : ""}`}
                  data-hovered={hoveredState === location.id || undefined}
                  role={interactive ? "button" : undefined}
                  tabIndex={interactive ? 0 : -1}
                  aria-label={`${location.name}, ${isComplete ? "complete" : "incomplete"}`}
                  aria-disabled={!interactive || undefined}
                  onPointerEnter={() => {
                    if (interactive) setHoveredState(location.id);
                  }}
                  onPointerLeave={() => setHoveredState(null)}
                  onFocus={(event) => {
                    if (
                      interactive &&
                      event.currentTarget.matches(":focus-visible")
                    ) {
                      setHoveredState(location.id);
                    }
                  }}
                  onBlur={() => setHoveredState(null)}
                  onClick={(event) => {
                    if (interactive) {
                      selectState(location.id, event.currentTarget);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      interactive &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      selectState(location.id, event.currentTarget);
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
