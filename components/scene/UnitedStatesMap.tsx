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
      position={[0.65, 4.2, -15.72]}
      rotation={[0, 0.02, 0]}
      scale={0.3}
      zIndexRange={[4, 0]}
      style={{ pointerEvents: interactive ? "auto" : "none" }}
    >
      <section className="mountain-map" aria-label="Interactive map of the United States">
        <div className="mountain-map__heading" aria-hidden="true">
          <strong>Places along the way</strong>
          <span>Select a state</span>
        </div>
        <svg viewBox={usa.viewBox} role="group" aria-label={usa.label}>
          {(usa.locations as MapLocation[]).map((location) => {
            const isFeatured = location.id === "nc" || location.id === "vt";
            return (
              <path
                key={location.id}
                d={location.path}
                className={`mountain-map__state${isFeatured ? " mountain-map__state--featured" : ""}`}
                data-hovered={hoveredState === location.id || undefined}
                role="button"
                tabIndex={interactive ? 0 : -1}
                aria-label={`${location.name}${isFeatured ? ", highlighted place" : ""}`}
                onPointerEnter={() => setHoveredState(location.id)}
                onPointerLeave={() => setHoveredState(null)}
                onFocus={() => setHoveredState(location.id)}
                onBlur={() => setHoveredState(null)}
                onClick={(event) => onStateSelect(location.id, event.currentTarget)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
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
