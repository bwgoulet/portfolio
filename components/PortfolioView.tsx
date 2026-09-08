"use client";

import { Component, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AdventureScene } from "./scene/AdventureScene";
import { SimplePortfolio } from "./SimplePortfolio";

type Mode = "scene" | "simple";
const STORAGE_KEY = "portfolio-view-mode";

class SceneErrorBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function PortfolioView() {
  const [mode, setMode] = useState<Mode>("scene");
  const [sceneReady, setSceneReady] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const explicitChoice = useRef(false);

  const chooseMode = useCallback((next: Mode) => {
    explicitChoice.current = true;
    localStorage.setItem(STORAGE_KEY, next);
    setMode(next);
    setRecommendation("");
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const offerSimple = useCallback((reason: string, automatic = false) => {
    if (automatic && !explicitChoice.current) setMode("simple");
    setRecommendation(reason);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (saved === "scene" || saved === "simple") {
      explicitChoice.current = true;
      setMode(saved);
      return;
    }
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) offerSimple("Data Saver is enabled, so the lightweight version was selected.", true);
  }, [offerSimple]);

  useEffect(() => {
    if (mode !== "scene") return;
    let failures = 0;
    const assetFailed = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "IMG" || target?.tagName === "SCRIPT" || target?.tagName === "LINK") failures += 1;
      if (failures >= 3) offerSimple("Several scene assets failed to load. The simple version is recommended.");
    };
    window.addEventListener("error", assetFailed, true);

    let frames = 0;
    const started = performance.now();
    let raf = 0;
    const sample = (now: number) => {
      frames += 1;
      if (now - started < 10000) raf = requestAnimationFrame(sample);
      else if (frames / ((now - started) / 1000) < 22) offerSimple("Scene performance appears limited. Try the simple version for a smoother experience.");
    };
    raf = requestAnimationFrame(sample);
    return () => { window.removeEventListener("error", assetFailed, true); cancelAnimationFrame(raf); };
  }, [mode, offerSimple]);

  return (
    <div className={`portfolio-view portfolio-view--${mode}`}>
      <a className="skip-link" href={mode === "simple" ? "#simple-content" : "#scene-controls"}>Skip to content</a>
      {mode === "scene" && !sceneReady && <button id="scene-controls" className="preload-simple-switch" onClick={() => chooseMode("simple")}>View simple version</button>}
      {recommendation && <aside className="mode-recommendation" aria-live="assertive"><p>{recommendation}</p><button onClick={() => chooseMode("simple")}>Use simple version</button><button onClick={() => setRecommendation("")}>Keep 3D version</button></aside>}
      <div hidden={mode !== "scene"}>
        <SceneErrorBoundary onError={() => offerSimple("WebGL could not initialize. The simple version is available below.", true)}>
          <AdventureScene onExperienceReady={() => setSceneReady(true)} onSimpleVersionRequested={() => chooseMode("simple")} onExperienceFailure={(reason) => offerSimple(`${reason} The simple version was selected.`, true)} />
        </SceneErrorBoundary>
      </div>
      <div hidden={mode !== "simple"}>
        <button className="simple-scene-switch" type="button" onClick={() => chooseMode("scene")}>View interactive 3D version</button>
        <SimplePortfolio />
      </div>
      <noscript><style>{`.portfolio-view > div[hidden]:last-of-type{display:block!important}.portfolio-view > div:first-of-type,.preload-simple-switch{display:none!important}`}</style></noscript>
    </div>
  );
}
