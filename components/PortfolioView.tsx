"use client";

import { Component, type ReactNode, useCallback, useEffect, useState } from "react";
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

  const chooseMode = useCallback((next: Mode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setMode(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (saved === "scene" || saved === "simple") {
      setMode(saved);
    }
  }, []);

  return (
    <div className={`portfolio-view portfolio-view--${mode}`}>
      <a className="skip-link" href={mode === "simple" ? "#simple-content" : "#scene-controls"}>Skip to content</a>
      {mode === "scene" && !sceneReady && <button id="scene-controls" className="preload-simple-switch" onClick={() => chooseMode("simple")}>View simple version</button>}
      <div hidden={mode !== "scene"}>
        <SceneErrorBoundary onError={() => chooseMode("simple")}>
          <AdventureScene onExperienceReady={() => setSceneReady(true)} onSimpleVersionRequested={() => chooseMode("simple")} onExperienceFailure={() => chooseMode("simple")} />
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
