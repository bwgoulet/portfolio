"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import Image from "next/image";
import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { Group } from "three";
import { PerspectiveCamera, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Billboard } from "./Billboard";
import { Cabin } from "./Cabin";
import { CameraRig } from "./CameraRig";
import { LightingAtmosphere } from "./LightingAtmosphere";
import { LowPolyEnvironment } from "./LowPolyEnvironment";
import { InteractionState, InteractiveTarget } from "./types";
import {
  CABIN_INTERIOR_ARTWORKS,
  CabinInterior,
  GALLERY_PHOTOS,
} from "./CabinInterior";
import { PROJECT_NOTE_RECORD } from "./projectNotes";
import { EXPERIENCE_RECORD } from "./experienceData";
import {
  CAMERA_PRESETS,
  FocusTarget,
  MOTION_TIERS,
} from "@/config/sceneConfig";
import { IntroductionLandmark } from "./IntroductionLandmark";

type DartHit = {
  x: number;
  y: number;
  points: number;
  label: string;
};

type DartReticle = {
  x: number;
  y: number;
};

const DARTBOARD_SECTORS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
] as const;

const DARTS_PER_ROUND = 3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const randomPointInCircle = (maxRadius: number): DartReticle => {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * maxRadius;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

const scoreDartThrow = (normalizedX: number, normalizedY: number) => {
  const x = clamp(normalizedX, -1, 1);
  const y = clamp(normalizedY, -1, 1);
  const radius = Math.sqrt(x * x + y * y);

  if (radius > 1) {
    return { points: 0, label: "Miss" };
  }

  if (radius <= 0.06) {
    return { points: 50, label: "Bullseye (50)" };
  }

  if (radius <= 0.12) {
    return { points: 25, label: "Outer Bull (25)" };
  }

  const angleRadians = Math.atan2(y, x);
  const normalizedAngle =
    (Math.PI / 2 - angleRadians + Math.PI * 2) % (Math.PI * 2);
  const sectorIndex =
    Math.floor(normalizedAngle / (Math.PI / 10)) % DARTBOARD_SECTORS.length;
  const baseValue = DARTBOARD_SECTORS[sectorIndex];

  if (radius >= 0.75 && radius <= 0.84) {
    return { points: baseValue * 2, label: `Double ${baseValue}` };
  }

  if (radius >= 0.45 && radius <= 0.53) {
    return { points: baseValue * 3, label: `Triple ${baseValue}` };
  }

  return { points: baseValue, label: `Single ${baseValue}` };
};

const FREE_MODE_VIEW_PRESETS: Record<
  "overview" | "cabinInterior",
  { position: [number, number, number]; lookAt: [number, number, number] }
> = {
  overview: {
    position: [-10.2, 9.2, 14.3],
    lookAt: [0.25, 1.75, -2.9],
  },
  cabinInterior: {
    position: [4.9, 4.3, 2.4],
    lookAt: [4.35, 2.2, -1.45],
  },
};

function FreeModeCameraPositioner({
  enabled,
  focusTarget,
}: {
  enabled: boolean;
  focusTarget: FocusTarget;
}) {
  const camera = useThree((state) => state.camera);
  const wasEnabledRef = useRef(false);

  useEffect(() => {
    if (
      enabled &&
      !wasEnabledRef.current &&
      (focusTarget === "overview" || focusTarget === "cabinInterior")
    ) {
      const preset = FREE_MODE_VIEW_PRESETS[focusTarget];
      camera.position.set(...preset.position);
      camera.lookAt(...preset.lookAt);
      camera.updateProjectionMatrix();
    }

    if (
      !enabled &&
      wasEnabledRef.current &&
      (focusTarget === "overview" || focusTarget === "cabinInterior")
    ) {
      const preset = CAMERA_PRESETS[focusTarget];
      camera.position.set(...preset.position);
      camera.lookAt(...preset.lookAt);
      if (camera instanceof PerspectiveCamera) {
        camera.fov = preset.fov;
      }
      camera.updateProjectionMatrix();
    }

    wasEnabledRef.current = enabled;
  }, [camera, enabled, focusTarget]);

  return null;
}

function FreeModeKeyboardPan({
  enabled,
  controlsRef,
}: {
  enabled: boolean;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const pressedKeysRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  useEffect(() => {
    if (!enabled) {
      pressedKeysRef.current = {
        left: false,
        right: false,
        up: false,
        down: false,
      };
      return;
    }

    const updateKeyState = (event: KeyboardEvent, isPressed: boolean) => {
      const eventTarget = event.target;
      if (
        eventTarget instanceof HTMLElement &&
        (eventTarget.tagName === "INPUT" ||
          eventTarget.tagName === "TEXTAREA" ||
          eventTarget.tagName === "SELECT")
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        pressedKeysRef.current.left = isPressed;
        event.preventDefault();
      } else if (event.key === "ArrowRight") {
        pressedKeysRef.current.right = isPressed;
        event.preventDefault();
      } else if (event.key === "ArrowUp") {
        pressedKeysRef.current.up = isPressed;
        event.preventDefault();
      } else if (event.key === "ArrowDown") {
        pressedKeysRef.current.down = isPressed;
        event.preventDefault();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => updateKeyState(event, true);
    const onKeyUp = (event: KeyboardEvent) => updateKeyState(event, false);
    const clearKeys = () => {
      pressedKeysRef.current = {
        left: false,
        right: false,
        up: false,
        down: false,
      };
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
      clearKeys();
    };
  }, [enabled]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const controls = controlsRef.current;
    if (!controls) return;
    const { left, right, up, down } = pressedKeysRef.current;
    if (!left && !right && !up && !down) return;

    const camera = controls.object;
    const moveSpeedPerSecond = 7;
    const step = moveSpeedPerSecond * delta;
    const moveDirection = new Vector3(
      (right ? 1 : 0) - (left ? 1 : 0),
      0,
      (up ? 1 : 0) - (down ? 1 : 0)
    );
    if (moveDirection.lengthSq() === 0) return;
    moveDirection.normalize();

    const forward = new Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() > 0) {
      forward.normalize();
    }

    const rightVector = new Vector3()
      .crossVectors(forward, camera.up)
      .normalize();
    const panOffset = rightVector
      .multiplyScalar(moveDirection.x)
      .add(forward.multiplyScalar(moveDirection.z))
      .multiplyScalar(step);

    camera.position.add(panOffset);
    controls.target.add(panOffset);
    controls.update();
  });

  return null;
}

export function AdventureScene() {
  const billboardRef = useRef<Group>(null);
  const cabinRef = useRef<Group>(null);
  const tabletsRef = useRef<Group>(null);
  const introductionRef = useRef<Group>(null);
  const timelineSignRef = useRef<Group>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);
  const noteTitleId = useId();
  const experienceTitleId = useId();

  const [interactionState, setInteractionState] =
    useState<InteractionState>("idleOverview");
  const [focusTarget, setFocusTarget] = useState<FocusTarget>("overview");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<
    string | null
  >(null);
  const [selectedGalleryPhotoId, setSelectedGalleryPhotoId] = useState<
    string | null
  >(null);
  const [closingNoteId, setClosingNoteId] = useState<string | null>(null);
  const [closingExperienceId, setClosingExperienceId] = useState<string | null>(
    null
  );
  const [isIntroductionDialogOpen, setIsIntroductionDialogOpen] =
    useState(false);
  const [isIntroductionCloseupHovered, setIsIntroductionCloseupHovered] =
    useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isTimelineCloseupHovered, setIsTimelineCloseupHovered] =
    useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCabinInteriorRevealed, setIsCabinInteriorRevealed] = useState(false);
  const [isCabinCameraTransitionComplete, setIsCabinCameraTransitionComplete] =
    useState(false);
  const [isCabinDoorOpen, setIsCabinDoorOpen] = useState(false);
  const [cabinTransitionFadeState, setCabinTransitionFadeState] = useState<
    "idle" | "fade-out" | "black" | "fade-in"
  >("idle");
  const [isCabinFadePending, setIsCabinFadePending] = useState(false);
  const [isCabinExitTransitionPending, setIsCabinExitTransitionPending] =
    useState(false);
  const [isFreeModeEnabled, setIsFreeModeEnabled] = useState(false);
  const [dartScore, setDartScore] = useState(0);
  const [dartThrowsLeft, setDartThrowsLeft] = useState(DARTS_PER_ROUND);
  const [dartRound, setDartRound] = useState(1);
  const [lastDartHit, setLastDartHit] = useState<DartHit | null>(null);
  const [dartReticle, setDartReticle] = useState<DartReticle>({ x: 0, y: 0 });
  const dartReticleRef = useRef<DartReticle>({ x: 0, y: 0 });
  const dartAimTargetRef = useRef<DartReticle>({ x: 0, y: 0 });
  const dartAimActivityRef = useRef(0);
  const lastAimSampleRef = useRef<{ x: number; y: number; at: number } | null>(
    null
  );
  const freeModeControlsRef = useRef<OrbitControlsImpl>(null);
  const cabinFadeTimerRef = useRef<number | null>(null);
  const cabinExitTimerRef = useRef<number | null>(null);
  const initialRevealTimerRef = useRef<number | null>(null);
  const { active: isSceneLoaderActive, total: sceneAssetsTotal } =
    useProgress();
  const isCabinInteriorTarget =
    focusTarget === "cabinInterior" || focusTarget === "cabinDartboard";
  const isCabinInteriorLoading =
    isCabinInteriorTarget &&
    !isCabinInteriorRevealed &&
    (isCabinFadePending ||
      !isCabinCameraTransitionComplete ||
      isSceneLoaderActive);
  const shouldShowCabinLoadingSpinner =
    isCabinInteriorLoading && cabinTransitionFadeState === "black";

  const [hasSceneLoadingStarted, setHasSceneLoadingStarted] = useState(false);
  const [isInitialSceneReady, setIsInitialSceneReady] = useState(false);
  const canvasVisibilityStyle: CSSProperties | undefined = isInitialSceneReady
    ? undefined
    : { opacity: 0, pointerEvents: "none" };
  const shouldShowInitialLoadingOverlay = !isInitialSceneReady;
  const shouldShowLoadingOverlay =
    shouldShowInitialLoadingOverlay || shouldShowCabinLoadingSpinner;
  const initialSceneRevealDelayMs = 220;

  const scheduleCabinFadeReset = useCallback((durationMs: number) => {
    if (cabinFadeTimerRef.current !== null) {
      window.clearTimeout(cabinFadeTimerRef.current);
    }
    cabinFadeTimerRef.current = window.setTimeout(() => {
      setCabinTransitionFadeState("idle");
      cabinFadeTimerRef.current = null;
    }, durationMs);
  }, []);

  const isTransitioning = interactionState === "transitioning";
  const isDetailDialogOpen =
    selectedNoteId !== null ||
    selectedExperienceId !== null ||
    selectedGalleryPhotoId !== null ||
    isIntroductionDialogOpen ||
    isTimelineDialogOpen;
  const isOverviewState =
    interactionState === "idleOverview" ||
    interactionState === "hoverBillboard" ||
    interactionState === "hoverCabin" ||
    interactionState === "hoverTablets" ||
    interactionState === "hoverIntroduction" ||
    interactionState === "hoverTimeline";
  const canToggleFreeMode =
    !isDetailDialogOpen &&
    !isTransitioning &&
    !isCabinExitTransitionPending &&
    (focusTarget === "overview" || focusTarget === "cabinInterior");
  const canDismissViaBackgroundClick =
    interactionState === "billboardCloseup" ||
    interactionState === "tabletsCloseup" ||
    interactionState === "introductionCloseup" ||
    interactionState === "timelineCloseup" ||
    interactionState === "dartboardCloseup";
  const canDismissSceneSelection =
    canDismissViaBackgroundClick && !isDetailDialogOpen && !isTransitioning;

  const activeNoteId = selectedNoteId ?? closingNoteId;
  const activeExperienceId = selectedExperienceId ?? closingExperienceId;
  const selectedNote = activeNoteId ? PROJECT_NOTE_RECORD[activeNoteId] : null;
  const selectedExperience = activeExperienceId
    ? EXPERIENCE_RECORD[activeExperienceId]
    : null;
  const selectedGalleryPhoto = selectedGalleryPhotoId
    ? [...GALLERY_PHOTOS, ...CABIN_INTERIOR_ARTWORKS].find(
        (photo) => photo.id === selectedGalleryPhotoId
      ) ?? null
    : null;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (hasSceneLoadingStarted) return;
    if (isSceneLoaderActive || sceneAssetsTotal > 0) {
      setHasSceneLoadingStarted(true);
    }
  }, [hasSceneLoadingStarted, isSceneLoaderActive, sceneAssetsTotal]);

  useEffect(() => {
    if (isInitialSceneReady || !hasSceneLoadingStarted || isSceneLoaderActive)
      return;
    if (initialRevealTimerRef.current !== null) return;

    initialRevealTimerRef.current = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsInitialSceneReady(true);
          initialRevealTimerRef.current = null;
        });
      });
    }, initialSceneRevealDelayMs);
  }, [
    hasSceneLoadingStarted,
    initialSceneRevealDelayMs,
    isInitialSceneReady,
    isSceneLoaderActive,
  ]);

  useEffect(() => {
    return () => {
      if (initialRevealTimerRef.current !== null) {
        window.clearTimeout(initialRevealTimerRef.current);
      }
    };
  }, []);

  const closeNoteDetail = useCallback(() => {
    if (!selectedNoteId) return;
    if (reducedMotion) {
      setSelectedNoteId(null);
      setClosingNoteId(null);
      return;
    }
    setClosingNoteId(selectedNoteId);
    setSelectedNoteId(null);
    window.setTimeout(
      () => setClosingNoteId(null),
      MOTION_TIERS.macro.overlayFadeDuration * 1000
    );
  }, [reducedMotion, selectedNoteId]);

  const closeExperienceDetail = useCallback(() => {
    if (!selectedExperienceId) return;
    if (reducedMotion) {
      setSelectedExperienceId(null);
      setClosingExperienceId(null);
      return;
    }
    setClosingExperienceId(selectedExperienceId);
    setSelectedExperienceId(null);
    window.setTimeout(
      () => setClosingExperienceId(null),
      MOTION_TIERS.macro.overlayFadeDuration * 1000
    );
  }, [reducedMotion, selectedExperienceId]);

  const closeIntroductionDialog = useCallback(() => {
    setIsIntroductionDialogOpen(false);
  }, []);

  const closeGalleryDetail = useCallback(() => {
    setSelectedGalleryPhotoId(null);
  }, []);

  const closeTimelineDialog = useCallback(() => {
    setIsTimelineDialogOpen(false);
  }, []);

  const resetDartsRound = useCallback(() => {
    setDartScore(0);
    setDartThrowsLeft(DARTS_PER_ROUND);
    setLastDartHit(null);
  }, []);

  const startNewDartsRound = useCallback(() => {
    setDartRound((currentRound) => currentRound + 1);
    resetDartsRound();
  }, [resetDartsRound]);

  const registerDartThrow = useCallback(
    (normalizedX: number, normalizedY: number) => {
      if (dartThrowsLeft <= 0) return;
      const spread = 0.06;
      const inaccurateX = normalizedX + (Math.random() - 0.5) * spread;
      const inaccurateY = normalizedY + (Math.random() - 0.5) * spread;
      const result = scoreDartThrow(inaccurateX, inaccurateY);
      const markerX = clamp(inaccurateX, -1, 1);
      const markerY = clamp(inaccurateY, -1, 1);

      setDartScore((currentScore) => currentScore + result.points);
      setDartThrowsLeft((remainingThrows) => Math.max(remainingThrows - 1, 0));
      setLastDartHit({
        x: markerX,
        y: markerY,
        points: result.points,
        label: result.label,
      });
    },
    [dartThrowsLeft]
  );

  const handleDartboardThrow = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const board = event.currentTarget;
      const rect = board.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      dartAimTargetRef.current = {
        x: clamp((event.clientX - centerX) / (rect.width / 2), -1, 1),
        y: clamp((centerY - event.clientY) / (rect.height / 2), -1, 1),
      };
      registerDartThrow(dartReticle.x, dartReticle.y);
    },
    [dartReticle.x, dartReticle.y, registerDartThrow]
  );

  const handleDartboardKeyboardThrow = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      registerDartThrow(dartReticle.x, dartReticle.y);
    },
    [dartReticle.x, dartReticle.y, registerDartThrow]
  );

  const handleDartboardAimMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const board = event.currentTarget;
      const rect = board.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const intendedX = (event.clientX - centerX) / (rect.width / 2);
      const intendedY = (centerY - event.clientY) / (rect.height / 2);
      const nextAimTarget = {
        x: clamp(intendedX, -1, 1),
        y: clamp(intendedY, -1, 1),
      };
      const now = performance.now();
      const previousSample = lastAimSampleRef.current;
      if (previousSample) {
        const deltaX = nextAimTarget.x - previousSample.x;
        const deltaY = nextAimTarget.y - previousSample.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const deltaMs = Math.max(now - previousSample.at, 16);
        const speedPerMs = distance / deltaMs;
        const normalizedActivity = clamp(speedPerMs * 22, 0, 1);
        dartAimActivityRef.current =
          dartAimActivityRef.current * 0.72 + normalizedActivity * 0.28;
      }

      dartAimTargetRef.current = {
        x: nextAimTarget.x,
        y: nextAimTarget.y,
      };
      lastAimSampleRef.current = { ...nextAimTarget, at: now };
    },
    []
  );

  useEffect(() => {
    dartReticleRef.current = dartReticle;
  }, [dartReticle]);

  useEffect(() => {
    if (interactionState !== "dartboardCloseup") return;

    dartAimTargetRef.current = { x: 0, y: 0 };
    dartReticleRef.current = { x: 0, y: 0 };
    dartAimActivityRef.current = 0;
    lastAimSampleRef.current = null;
    setDartReticle({ x: 0, y: 0 });

    const reticlePosition = { x: 0, y: 0 };
    const jitterOffset = { x: 0, y: 0 };
    let jitterTarget = randomPointInCircle(0.12);
    let nextJitterChangeAt = performance.now() + 180 + Math.random() * 180;
    let animationFrameId = 0;

    const updateReticle = (timestamp: number) => {
      dartAimActivityRef.current *= 0.94;
      const movementActivity = clamp(dartAimActivityRef.current, 0, 1);
      const jitterRadius = 0.08 + movementActivity * 0.3;

      if (timestamp >= nextJitterChangeAt) {
        jitterTarget = randomPointInCircle(jitterRadius);
        nextJitterChangeAt =
          timestamp +
          (180 - movementActivity * 110) +
          Math.random() * (180 - movementActivity * 110);
      }

      const jitterAttraction = 0.08 + movementActivity * 0.16;
      jitterOffset.x += (jitterTarget.x - jitterOffset.x) * jitterAttraction;
      jitterOffset.y += (jitterTarget.y - jitterOffset.y) * jitterAttraction;

      const aimTarget = dartAimTargetRef.current;
      const wobbleStrength = 0.008 + movementActivity * 0.02;
      const wobbleX = Math.sin(timestamp * 0.011) * wobbleStrength;
      const wobbleY = Math.cos(timestamp * 0.009) * wobbleStrength;
      const targetX = aimTarget.x + jitterOffset.x + wobbleX;
      const targetY = aimTarget.y + jitterOffset.y + wobbleY;

      const reticleAttraction = 0.16;
      reticlePosition.x += (targetX - reticlePosition.x) * reticleAttraction;
      reticlePosition.y += (targetY - reticlePosition.y) * reticleAttraction;

      const nextX = reticlePosition.x;
      const nextY = reticlePosition.y;
      const radius = Math.sqrt(nextX * nextX + nextY * nextY);
      if (radius > 0.94) {
        reticlePosition.x = (nextX / radius) * 0.94;
        reticlePosition.y = (nextY / radius) * 0.94;
      } else {
        reticlePosition.x = nextX;
        reticlePosition.y = nextY;
      }

      setDartReticle({ x: reticlePosition.x, y: reticlePosition.y });
      animationFrameId = window.requestAnimationFrame(updateReticle);
    };

    animationFrameId = window.requestAnimationFrame(updateReticle);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [interactionState]);

  useEffect(() => {
    if (!isDetailDialogOpen || !modalRef.current) return;
    const dialog = modalRef.current;
    const focusableSelectors = [
      "button:not([disabled])",
      "[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    const focusableNodes = Array.from(
      dialog.querySelectorAll<HTMLElement>(focusableSelectors)
    );
    const firstFocusable = focusableNodes[0] ?? dialog;
    const lastFocusable = focusableNodes[focusableNodes.length - 1] ?? dialog;
    firstFocusable.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      if (focusableNodes.length < 2) {
        event.preventDefault();
        firstFocusable.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
    };
  }, [isDetailDialogOpen]);

  useEffect(() => {
    if (isDetailDialogOpen) return;
    lastTriggerRef.current?.focus();
  }, [isDetailDialogOpen]);

  const updateHover = useCallback(
    (target: InteractiveTarget, hovered: boolean) => {
      setInteractionState((currentState) => {
        const isCurrentOverviewState =
          currentState === "idleOverview" ||
          currentState === "hoverBillboard" ||
          currentState === "hoverCabin" ||
          currentState === "hoverTablets" ||
          currentState === "hoverIntroduction" ||
          currentState === "hoverTimeline";

        if (!isCurrentOverviewState) return currentState;
        if (!hovered) return "idleOverview";

        return target === "billboard"
          ? "hoverBillboard"
          : target === "cabin"
          ? "hoverCabin"
          : target === "tablets"
          ? "hoverTablets"
          : target === "introduction"
          ? "hoverIntroduction"
          : "hoverTimeline";
      });
    },
    []
  );

  const handleFocusClick = useCallback(
    (target: InteractiveTarget) => {
      if (!isOverviewState || isTransitioning) return;

      setIsFreeModeEnabled(false);
      setInteractionState("transitioning");
      setFocusTarget(target === "cabin" ? "cabinInterior" : target);
      setIsCabinInteriorRevealed(false);
      setIsCabinCameraTransitionComplete(false);
      setIsCabinDoorOpen(target === "cabin");
      setSelectedNoteId(null);
      setSelectedExperienceId(null);
      setSelectedGalleryPhotoId(null);
      setIsIntroductionDialogOpen(false);
      setIsTimelineDialogOpen(false);

      if (target === "cabin") {
        if (reducedMotion) {
          setCabinTransitionFadeState("idle");
          setIsCabinFadePending(false);
          setIsCabinCameraTransitionComplete(true);
        } else {
          setCabinTransitionFadeState("idle");
          setIsCabinFadePending(true);
        }
      } else {
        setCabinTransitionFadeState("idle");
        setIsCabinFadePending(false);
      }
    },
    [isOverviewState, isTransitioning, reducedMotion]
  );

  const handleDartboardSelect = useCallback(() => {
    if (
      interactionState !== "cabinCloseup" ||
      isTransitioning ||
      isFreeModeEnabled
    )
      return;
    setInteractionState("transitioning");
    setFocusTarget("cabinDartboard");
    setSelectedGalleryPhotoId(null);
  }, [interactionState, isFreeModeEnabled, isTransitioning]);

  useEffect(
    () => () => {
      if (cabinFadeTimerRef.current !== null) {
        window.clearTimeout(cabinFadeTimerRef.current);
      }
      if (cabinExitTimerRef.current !== null) {
        window.clearTimeout(cabinExitTimerRef.current);
      }
      document.body.style.cursor = "auto";
    },
    []
  );

  useEffect(() => {
    if (interactionState !== "introductionCloseup") {
      setIsIntroductionCloseupHovered(false);
    }
  }, [interactionState]);

  useEffect(() => {
    if (interactionState !== "timelineCloseup") {
      setIsTimelineCloseupHovered(false);
    }
  }, [interactionState]);

  const detailCardStateClass = (isClosing: boolean) =>
    reducedMotion ? "motion-reduced" : isClosing ? "anim-exit" : "anim-enter";

  const beginOverviewTransition = useCallback(() => {
    setIsFreeModeEnabled(false);
    setIsCabinDoorOpen(false);
    setIsCabinInteriorRevealed(false);
    setIsCabinCameraTransitionComplete(false);
    setFocusTarget("overview");
    setInteractionState("transitioning");
    setSelectedNoteId(null);
    setSelectedExperienceId(null);
    setSelectedGalleryPhotoId(null);
    setIsIntroductionDialogOpen(false);
    setIsTimelineDialogOpen(false);
  }, []);

  const handleBackNavigation = useCallback(() => {
    if (focusTarget === "cabinDartboard") {
      setIsFreeModeEnabled(false);
      setInteractionState("transitioning");
      setFocusTarget("cabinInterior");
      setSelectedGalleryPhotoId(null);
      return;
    }

    const exitingCabin = focusTarget === "cabinInterior";
    if (exitingCabin && !reducedMotion) {
      if (isCabinExitTransitionPending) return;
      setIsCabinExitTransitionPending(true);
      setCabinTransitionFadeState("fade-out");
      if (cabinExitTimerRef.current !== null) {
        window.clearTimeout(cabinExitTimerRef.current);
      }
      cabinExitTimerRef.current = window.setTimeout(() => {
        setCabinTransitionFadeState("black");
        setIsCabinExitTransitionPending(false);
        beginOverviewTransition();
        cabinExitTimerRef.current = null;
      }, 240);
      return;
    }
    setCabinTransitionFadeState("idle");
    beginOverviewTransition();
  }, [
    beginOverviewTransition,
    focusTarget,
    isCabinExitTransitionPending,
    reducedMotion,
  ]);

  const handleSceneBackgroundDismiss = useCallback(() => {
    if (!canDismissSceneSelection || isCabinExitTransitionPending) return;
    handleBackNavigation();
  }, [
    canDismissSceneSelection,
    handleBackNavigation,
    isCabinExitTransitionPending,
  ]);

  useEffect(() => {
    if (!canDismissSceneSelection || isCabinExitTransitionPending) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (
        target.closest(".scene-canvas-shell") ||
        target.closest(".scene-back") ||
        target.closest(".scene-free-mode") ||
        target.closest(".note-detail")
      ) {
        return;
      }

      handleBackNavigation();
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [
    canDismissSceneSelection,
    handleBackNavigation,
    isCabinExitTransitionPending,
  ]);

  useEffect(() => {
    if (!isCabinInteriorTarget || isCabinInteriorRevealed) return;
    if (!isCabinCameraTransitionComplete || isSceneLoaderActive) return;
    setIsCabinInteriorRevealed(true);
    setInteractionState("cabinCloseup");
    if (!reducedMotion) {
      setCabinTransitionFadeState("fade-in");
      scheduleCabinFadeReset(320);
    } else {
      setCabinTransitionFadeState("idle");
    }
  }, [
    isCabinCameraTransitionComplete,
    isCabinInteriorRevealed,
    isCabinInteriorTarget,
    isSceneLoaderActive,
    reducedMotion,
    scheduleCabinFadeReset,
  ]);

  return (
    <main>
      <div
        className={`scene-stage ${
          isDetailDialogOpen ? "scene-stage--locked" : ""
        }`}
        aria-hidden={isDetailDialogOpen}
      >
        {cabinTransitionFadeState !== "idle" && (
          <div
            className={`cabin-transition-fade cabin-transition-fade--${cabinTransitionFadeState}`}
            aria-hidden="true"
          />
        )}
        {shouldShowLoadingOverlay && (
          <div
            className={`scene-loading-overlay ${
              shouldShowInitialLoadingOverlay
                ? "scene-loading-overlay--solid"
                : ""
            }`.trim()}
            role="status"
            aria-live="polite"
          >
            <div className="scene-loading-spinner" aria-hidden="true" />
            <p>Loading Scene…</p>
          </div>
        )}
        <div
          className="scene-canvas-shell"
          style={canvasVisibilityStyle}
          aria-hidden={!isInitialSceneReady}
        >
          <Canvas
            shadows
            camera={{
              position: CAMERA_PRESETS.overview.position,
              fov: CAMERA_PRESETS.overview.fov,
            }}
            dpr={[1, 1.7]}
            gl={{ alpha: false }}
            onPointerMissed={handleSceneBackgroundDismiss}
            onCreated={({ camera }) => {
              camera.lookAt(...CAMERA_PRESETS.overview.lookAt);
            }}
          >
            <Suspense fallback={null}>
              <CameraRig
                targetKey={focusTarget}
                isTransitioning={isTransitioning}
                reducedMotion={reducedMotion}
                onTransitionProgress={(target, progress) => {
                  if (reducedMotion) return;
                  if (target !== "cabinInterior" || !isCabinFadePending) return;
                  if (progress < 0.99) return;
                  setCabinTransitionFadeState("fade-out");
                  setIsCabinFadePending(false);
                }}
                onTransitionEnd={(completedTarget) => {
                  if (completedTarget === "cabinInterior") {
                    setIsCabinCameraTransitionComplete(true);
                    if (isSceneLoaderActive) {
                      setCabinTransitionFadeState("black");
                    }
                    if (isCabinInteriorRevealed) {
                      setIsCabinFadePending(false);
                      setCabinTransitionFadeState("idle");
                      setInteractionState("cabinCloseup");
                    }
                    return;
                  }
                  if (completedTarget === "overview") {
                    if (
                      !reducedMotion &&
                      (cabinTransitionFadeState === "fade-out" ||
                        cabinTransitionFadeState === "black")
                    ) {
                      setCabinTransitionFadeState("fade-in");
                      scheduleCabinFadeReset(320);
                    } else {
                      setCabinTransitionFadeState("idle");
                    }
                    setIsCabinFadePending(false);
                    setInteractionState("idleOverview");
                    return;
                  }
                  setInteractionState(
                    completedTarget === "billboard"
                      ? "billboardCloseup"
                      : completedTarget === "cabinDartboard"
                      ? "dartboardCloseup"
                      : completedTarget === "tablets"
                      ? "tabletsCloseup"
                      : completedTarget === "introduction"
                      ? "introductionCloseup"
                      : "timelineCloseup"
                  );
                }}
              />
              <FreeModeCameraPositioner
                enabled={isFreeModeEnabled}
                focusTarget={focusTarget}
              />
              <FreeModeKeyboardPan
                enabled={isFreeModeEnabled}
                controlsRef={freeModeControlsRef}
              />
              {isFreeModeEnabled && (
                <OrbitControls
                  ref={freeModeControlsRef}
                  enableDamping
                  dampingFactor={0.08}
                  minDistance={1.4}
                  maxDistance={42}
                  enablePan
                  panSpeed={0.9}
                  zoomSpeed={0.85}
                  screenSpacePanning={false}
                  maxPolarAngle={Math.PI * 0.47}
                  minPolarAngle={Math.PI * 0.14}
                  target={
                    focusTarget === "cabinInterior"
                      ? [0.35, 1.15, -1.4]
                      : [0.2, 0.9, 0.5]
                  }
                />
              )}
              <LightingAtmosphere
                backgroundColor={
                  (focusTarget === "cabinInterior" ||
                    focusTarget === "cabinDartboard") &&
                  !isCabinInteriorRevealed
                    ? "#060709"
                    : undefined
                }
              />
              <LowPolyEnvironment
                tabletsInteractiveEnabled={
                  isOverviewState && !isFreeModeEnabled
                }
                tabletsDetailInteractiveEnabled={
                  interactionState === "tabletsCloseup"
                }
                tabletsHovered={interactionState === "hoverTablets"}
                onTabletsHoverChange={(hovered) =>
                  updateHover("tablets", hovered)
                }
                onTabletsClick={handleFocusClick}
                onTabletDetailSelect={(entryId) =>
                  setSelectedExperienceId(entryId)
                }
                tabletsRef={tabletsRef}
                timelineSignRef={timelineSignRef}
                timelineInteractiveEnabled={
                  !isFreeModeEnabled &&
                  (isOverviewState || interactionState === "timelineCloseup")
                }
                timelineHovered={
                  interactionState === "hoverTimeline" ||
                  isTimelineCloseupHovered
                }
                onTimelineHoverChange={(hovered) => {
                  if (interactionState === "timelineCloseup") {
                    setIsTimelineCloseupHovered(hovered);
                    return;
                  }
                  updateHover("timeline", hovered);
                }}
                onTimelineClick={(target) => {
                  if (interactionState === "timelineCloseup") {
                    setIsTimelineDialogOpen(true);
                    return;
                  }
                  handleFocusClick(target);
                }}
                reducedMotion={reducedMotion}
              />
              <IntroductionLandmark
                landmarkRef={introductionRef}
                interactiveEnabled={!isFreeModeEnabled && isOverviewState}
                detailInteractiveEnabled={
                  !isFreeModeEnabled &&
                  interactionState === "introductionCloseup"
                }
                hoverEnabled={!isFreeModeEnabled && isOverviewState}
                hovered={
                  interactionState === "hoverIntroduction" ||
                  isIntroductionCloseupHovered
                }
                onHoverChange={(hovered) => {
                  if (interactionState === "introductionCloseup") {
                    setIsIntroductionCloseupHovered(hovered);
                    return;
                  }
                  updateHover("introduction", hovered);
                }}
                onClick={() => {
                  if (interactionState === "introductionCloseup") {
                    setIsIntroductionDialogOpen(true);
                    return;
                  }
                  handleFocusClick("introduction");
                }}
                reducedMotion={reducedMotion}
              />
              <Billboard
                billboardRef={billboardRef}
                interactiveEnabled={isOverviewState && !isFreeModeEnabled}
                notesInteractive={interactionState === "billboardCloseup"}
                hovered={interactionState === "hoverBillboard"}
                onHoverChange={(hovered) => updateHover("billboard", hovered)}
                onClick={() => handleFocusClick("billboard")}
                onNoteClick={(noteId) => setSelectedNoteId(noteId)}
                detailOpen={selectedNoteId !== null}
                hideThumbnails={cabinTransitionFadeState !== "idle"}
                reducedMotion={reducedMotion}
              />
              {!isCabinInteriorRevealed && (
                <Cabin
                  cabinRef={cabinRef}
                  interactiveEnabled={isOverviewState && !isFreeModeEnabled}
                  hovered={interactionState === "hoverCabin"}
                  isDoorOpen={isCabinDoorOpen}
                  onHoverChange={(hovered) => updateHover("cabin", hovered)}
                  onClick={() => handleFocusClick("cabin")}
                />
              )}
              {(focusTarget === "cabinInterior" ||
                focusTarget === "cabinDartboard") &&
                isCabinInteriorRevealed && (
                  <CabinInterior
                    photosInteractive={
                      interactionState === "cabinCloseup" && !isFreeModeEnabled
                    }
                    onPhotoSelect={(photoId) =>
                      setSelectedGalleryPhotoId(photoId)
                    }
                    onDartboardSelect={handleDartboardSelect}
                  />
                )}
            </Suspense>
          </Canvas>
        </div>
      </div>

      <header
        className={`scene-brand ${
          reducedMotion ? "motion-reduced" : "anim-enter"
        }`}
        aria-label="Site title"
      >
        <h1>Ben Goulet</h1>
        <p>an interactive portfolio</p>
      </header>

      {interactionState === "billboardCloseup" && selectedNote && (
        <article
          className={`note-detail ${detailCardStateClass(
            Boolean(closingNoteId)
          )}`}
          aria-live="polite"
          onClick={closeNoteDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeNoteDetail();
            }
          }}
        >
          <div
            className={`note-detail-card detail-content-card project-detail-card ${detailCardStateClass(
              Boolean(closingNoteId)
            )}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={noteTitleId}
            tabIndex={-1}
          >
            <Image
              src={selectedNote.detailImageSrc}
              alt={`${selectedNote.title} thumbnail`}
              width={720}
              height={380}
            />
            <h2 id={noteTitleId}>{selectedNote.title}</h2>
            <p className="detail-summary">{selectedNote.detail}</p>
            {selectedNote.resumeMeta && (
              <p className="detail-meta">{selectedNote.resumeMeta}</p>
            )}
            {selectedNote.resumeDate && (
              <p className="detail-meta">{selectedNote.resumeDate}</p>
            )}
            {selectedNote.bullets && selectedNote.bullets.length > 0 && (
              <ul>
                {selectedNote.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            <hr className="detail-divider" aria-hidden="true" />
            <section className="detail-impact">
              <h3>Personal Relevance</h3>
              <p>{selectedNote.whyItMattered}</p>
            </section>
          </div>
        </article>
      )}

      {interactionState === "tabletsCloseup" && selectedExperience && (
        <article
          className={`note-detail ${detailCardStateClass(
            Boolean(closingExperienceId)
          )}`}
          aria-live="polite"
          onClick={closeExperienceDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeExperienceDetail();
            }
          }}
        >
          <div
            className={`detail-content-card experience-detail-card ${detailCardStateClass(
              Boolean(closingExperienceId)
            )}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={experienceTitleId}
            tabIndex={-1}
          >
            <Image
              src={selectedExperience.detailImageSrc}
              alt={`${selectedExperience.company} thumbnail`}
              width={720}
              height={380}
            />
            <h2 id={experienceTitleId}>{selectedExperience.role}</h2>
            <p className="detail-meta">{selectedExperience.company}</p>
            <p className="detail-meta">{selectedExperience.dateLocation}</p>
            <ul>
              {selectedExperience.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <hr className="detail-divider" aria-hidden="true" />
            <section className="detail-impact">
              <h3>Personal Relevance</h3>
              <p>{selectedExperience.whyItMattered}</p>
            </section>
          </div>
        </article>
      )}

      {interactionState === "introductionCloseup" &&
        isIntroductionDialogOpen && (
          <article
            className={`note-detail ${detailCardStateClass(false)}`}
            aria-live="polite"
            onClick={closeIntroductionDialog}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeIntroductionDialog();
              }
            }}
          >
            <div
              className={`detail-content-card introduction-detail-card ${detailCardStateClass(
                false
              )}`}
              ref={modalRef}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="introduction-title"
              tabIndex={-1}
            >
              <div className="introduction-detail-layout">
                <Image
                  src="/introimage.png"
                  alt="Introduction thumbnail"
                  width={520}
                  height={460}
                />
                <section className="introduction-detail-copy">
                  <h2 id="introduction-title">Introduction</h2>
                  <p>
                    I&apos;m Ben Goulet, a software engineer focused on building
                    thoughtful, user-facing software across product, backend,
                    and creative technical work.
                  </p>
                  <p>
                    Currently, I&apos;m focused on building interactive web
                    experiences, pursuing strong engineering opportunities, and
                    creating projects that blend technical depth with
                    personality and design.
                  </p>
                  <p>
                    Explore the island to view projects, experience, and more
                    about me.
                  </p>
                </section>
              </div>
            </div>
          </article>
        )}

      {interactionState === "timelineCloseup" && isTimelineDialogOpen && (
        <article
          className={`note-detail ${detailCardStateClass(false)}`}
          aria-live="polite"
          onClick={closeTimelineDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeTimelineDialog();
            }
          }}
        >
          <div
            className={`detail-content-card introduction-detail-card ${detailCardStateClass(
              false
            )}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="timeline-title"
            tabIndex={-1}
          >
            <div className="introduction-detail-layout">
              <Image
                src="/projects/timeline.png"
                alt="Timeline thumbnail"
                width={520}
                height={460}
              />
              <section className="introduction-detail-copy">
                <h2 id="timeline-title">Timeline</h2>
                <p>
                  This trail marks key chapters of my personal journey -
                  timeline feature coming soon!
                </p>
                <p></p>
                <p></p>
              </section>
            </div>
          </div>
        </article>
      )}

      {interactionState === "cabinCloseup" && selectedGalleryPhoto && (
        <article
          className={`note-detail ${detailCardStateClass(false)}`}
          aria-live="polite"
          onClick={closeGalleryDetail}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeGalleryDetail();
            }
          }}
        >
          <div
            className={`detail-content-card gallery-detail-card ${detailCardStateClass(
              false
            )}`}
            ref={modalRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-title"
            tabIndex={-1}
          >
            <Image
              src={selectedGalleryPhoto.imageSrc}
              alt={selectedGalleryPhoto.title}
              width={720}
              height={480}
            />
            <h2 id="gallery-title">{selectedGalleryPhoto.title}</h2>
            <p>{selectedGalleryPhoto.description}</p>
            {selectedGalleryPhoto.descriptionList?.length ? (
              <ul>
                {selectedGalleryPhoto.descriptionList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </article>
      )}

      {interactionState === "dartboardCloseup" && (
        <article
          className={`note-detail ${detailCardStateClass(false)}`}
          aria-live="polite"
        >
          <div
            className={`detail-content-card gallery-detail-card ${detailCardStateClass(
              false
            )}`}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Darts minigame"
            tabIndex={-1}
          >
            <h2 style={{ marginTop: 0 }}>Darts — Round {dartRound}</h2>
            <p>
              Score: <strong>{dartScore}</strong> · Throws left:{" "}
              <strong>{dartThrowsLeft}</strong>
            </p>
            <div
              role="button"
              tabIndex={0}
              aria-label="Dartboard target"
              onPointerEnter={handleDartboardAimMove}
              onPointerMove={handleDartboardAimMove}
              onPointerDown={handleDartboardThrow}
              onKeyDown={handleDartboardKeyboardThrow}
              style={{
                width: 320,
                height: 320,
                maxWidth: "min(86vw, 320px)",
                maxHeight: "min(86vw, 320px)",
                borderRadius: "50%",
                border: "8px solid #ece6d3",
                margin: "0.3rem auto 1rem",
                position: "relative",
                cursor: dartThrowsLeft > 0 ? "crosshair" : "default",
                background:
                  "radial-gradient(circle at center, #b31217 0 6%, #1f7a35 6% 12%, #f4f0e6 12% 45%, #1f7a35 45% 53%, #f4f0e6 53% 75%, #2f2f2f 75% 100%)",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: `${((dartReticle.x + 1) / 2) * 100}%`,
                  top: `${(50 - dartReticle.y * 50).toFixed(2)}%`,
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px solid rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.35)",
                  pointerEvents: "none",
                }}
              />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: `${((dartReticle.x + 1) / 2) * 100}%`,
                  top: `${(50 - dartReticle.y * 50).toFixed(2)}%`,
                  transform: "translate(-50%, -50%)",
                  width: 4,
                  height: 24,
                  background: "rgba(255, 255, 255, 0.92)",
                  pointerEvents: "none",
                }}
              />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: `${((dartReticle.x + 1) / 2) * 100}%`,
                  top: `${(50 - dartReticle.y * 50).toFixed(2)}%`,
                  transform: "translate(-50%, -50%)",
                  width: 24,
                  height: 4,
                  background: "rgba(255, 255, 255, 0.92)",
                  pointerEvents: "none",
                }}
              />
              {lastDartHit && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: `${((lastDartHit.x + 1) / 2) * 100}%`,
                    top: `${(50 - lastDartHit.y * 50).toFixed(2)}%`,
                    transform: "translate(-50%, -50%)",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    background: "#0f172a",
                    boxShadow: "0 0 0 2px rgba(15, 23, 42, 0.35)",
                  }}
                />
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.6rem",
                flexWrap: "wrap",
              }}
            >
              <button
                className="detail-close"
                type="button"
                onClick={resetDartsRound}
              >
                Replay Round
              </button>
              <button
                className="detail-close"
                type="button"
                onClick={startNewDartsRound}
              >
                New Round
              </button>
            </div>
          </div>
        </article>
      )}

      {!isOverviewState &&
        !isTransitioning &&
        !isCabinExitTransitionPending && (
          <button
            className="scene-back"
            aria-label="Return to overview"
            onClick={handleBackNavigation}
          >
            ←
          </button>
        )}
      {canToggleFreeMode && (
        <button
          className={`scene-free-mode ${isFreeModeEnabled ? "is-enabled" : ""}`}
          type="button"
          aria-pressed={isFreeModeEnabled}
          onClick={() => setIsFreeModeEnabled((current) => !current)}
        >
          Free Mode: {isFreeModeEnabled ? "On" : "Off"}
        </button>
      )}
    </main>
  );
}
