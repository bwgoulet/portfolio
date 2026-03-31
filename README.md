# My Climb — Point-and-Click Adventure Prototype

A browser-native Next.js + React Three Fiber prototype for a cinematic, Myst-inspired personal site concept.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What this first prototype includes

- A low-poly floating-island placeholder environment built directly in code.
- A fixed landing-shot camera (no free roam controls).
- A single meaningful interactive landmark: a billboard/sign.
- Subtle hover feedback when the billboard is targetable.
- Click interaction with guarded state to block repeat clicks during transition.
- Cinematic camera transition (~2.2 seconds) to a billboard close-up state.
- A close-up mode intended as the future entry point for navigation/content.

## Architecture overview

```text
app/
  layout.tsx                # App shell
  page.tsx                  # Scene entry page
components/scene/
  AdventureScene.tsx        # Scene orchestrator + interaction state machine
  CameraRig.tsx             # Camera preset tweening (overview <-> close-up)
  Billboard.tsx             # Interactive sign landmark
  LowPolyEnvironment.tsx    # Placeholder low-poly world geometry
  LightingAtmosphere.tsx    # Fog, sky, and lights
  types.ts                  # Shared scene state types
config/
  sceneConfig.ts            # Camera presets, animation timing, palette
lib/
  animation.ts              # Thin GSAP helpers
```

## Where to tweak composition quickly

### Landing shot and close-up framing
Edit `CAMERA_PRESETS` in `config/sceneConfig.ts`:

- `overview.position` + `overview.lookAt`
- `billboardCloseup.position` + `billboardCloseup.lookAt`
- `fov` for each state

### Billboard and environment placement

- Billboard anchor position: `BILLBOARD_ANCHOR` in `components/scene/Billboard.tsx`.
- Placeholder environment geometry lives in `components/scene/LowPolyEnvironment.tsx`.

### Transition feel/timing

Edit `ANIMATION_CONFIG` in `config/sceneConfig.ts`:

- `cameraDuration`
- `cameraEase`
- billboard nudge timings and offsets

## How to replace placeholders with Blender/glTF assets later

1. Export low-poly assets to glTF (`.glb`).
2. Add a new component (e.g., `components/scene/WorldModel.tsx`) and load with Drei's `useGLTF`.
3. Replace or combine `LowPolyEnvironment` with the imported model.
4. Keep object anchors (like billboard/landmarks) and camera presets in `sceneConfig.ts` so composition iteration remains quick.

## How to evolve the billboard into real content/navigation

- Keep current state flow in `AdventureScene.tsx` (`idleOverview`, `hoverBillboard`, `transitionToBillboard`, `billboardCloseup`).
- In `billboardCloseup`, swap HUD text for a real UI panel/overlay or in-world content surface.
- Later add landmark metadata in config (id, position, target camera preset, callback), then reuse Billboard interaction pattern for multiple clickable objects.
