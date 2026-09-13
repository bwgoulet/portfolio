"use client";

import { Html } from "@react-three/drei";
import usa from "@svg-maps/usa";
import { useState } from "react";

type UnitedStatesMapProps = {
  interactive: boolean;
  onStateSelect: (stateId: string, trigger: SVGPathElement) => void;
};

type MapLocation = { id: string; name: string; path: string };

export function UnitedStatesMap({ interactive, onStateSelect }: UnitedStatesMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <Html
      transform
      center
      position={[0.25, 4, -20.72]}
      rotation={[0, 0.02, 0]}
      scale={0.3}
      occlude="blending"
      zIndexRange={[4, 0]}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
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
                  if (interactive) onStateSelect(location.id, event.currentTarget);
                }}
                onKeyDown={(event) => {
                  if (interactive && (event.key === "Enter" || event.key === " ")) {
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
  );
}
