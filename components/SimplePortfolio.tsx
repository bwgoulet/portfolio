"use client";

import Image from "next/image";
import usa from "@svg-maps/usa";
import { useEffect, useRef, useState } from "react";
import { EXPERIENCE_ENTRIES } from "./scene/experienceData";
import { PROJECT_NOTES } from "./scene/projectNotes";
import { STATE_STORIES } from "./scene/stateEntries";
import { INTRODUCTION_PARAGRAPHS } from "./scene/introductionData";
import {
  CABIN_INTERIOR_ARTWORKS,
  GALLERY_PHOTOS,
} from "./scene/cabinAssets";
import type { GalleryDetail } from "./scene/cabinAssets";

type MapLocation = { id: string; name: string; path: string };

export function SimplePortfolio() {
  const gallery: GalleryDetail[] = [...GALLERY_PHOTOS, ...CABIN_INTERIOR_ARTWORKS];
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const stateDialogRef = useRef<HTMLDivElement>(null);
  const lastStateTriggerRef = useRef<SVGPathElement>(null);
  const selectedState = selectedStateId ? STATE_STORIES[selectedStateId] : null;

  useEffect(() => {
    if (selectedState) {
      stateDialogRef.current?.focus();
      return;
    }

    lastStateTriggerRef.current?.focus();
  }, [selectedState]);

  const openState = (stateId: string, trigger: SVGPathElement) => {
    lastStateTriggerRef.current = trigger;
    setSelectedStateId(stateId);
  };

  return (
    <main className="simple-portfolio" id="simple-content">
      <header className="simple-hero">
        <div className="simple-hero__layout">
          <div className="simple-hero__copy">
            <p className="simple-kicker">Full-stack software engineer · Durham, NC</p>
            <h1>Ben Goulet</h1>
            {INTRODUCTION_PARAGRAPHS.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <Image className="simple-hero__image" src="/introimage.jpg" alt="Ben Goulet" width={858} height={1356} priority />
        </div>
        <nav aria-label="Portfolio sections">
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#gallery">Gallery</a>
          <a href="#chasing-50">Chasing 50</a>
          <a href="/Ben%20Goulet%20-%20Software%20Engineer%20(1).pdf">Resume</a>
        </nav>
      </header>

      <section id="experience" aria-labelledby="experience-heading">
        <p className="simple-kicker">What I’ve built</p>
        <h2 id="experience-heading">Experience</h2>
        <div className="simple-grid">
          {EXPERIENCE_ENTRIES.map((entry) => (
            <article className="simple-card" key={entry.id}>
              <Image src={entry.detailImageSrc} alt={`${entry.company} thumbnail`} width={720} height={380} />
              <p className="simple-meta">{entry.date}</p>
              <p className="simple-meta">{entry.location}</p>
              <h3>{entry.role}</h3>
              <p className="simple-company">{entry.company}</p>
              <ul>{entry.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              <details><summary>Personal Relevance</summary><p>{entry.whyItMattered}</p></details>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" aria-labelledby="projects-heading">
        <p className="simple-kicker">Selected work</p>
        <h2 id="projects-heading">Projects</h2>
        <div className="simple-grid simple-grid--projects">
          {PROJECT_NOTES.map((project) => (
            <article className="simple-card" key={project.id}>
              <Image src={project.detailImageSrc} alt="" width={720} height={380} />
              <p className="simple-meta">{project.resumeDate}</p>
              <h3>{project.title}</h3><p>{project.detail}</p>
              {project.bullets?.length ? <ul>{project.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              <details><summary>Personal Relevance</summary><p>{project.whyItMattered}</p></details>
            </article>
          ))}
        </div>
      </section>

      <section id="gallery" aria-labelledby="gallery-heading">
        <p className="simple-kicker">Beyond the work</p>
        <h2 id="gallery-heading">Gallery highlights</h2>
        <div className="simple-gallery">
          {gallery.map((photo) => (
            <figure key={photo.id}>
              {photo.videoEmbedUrl ? <iframe src={photo.videoEmbedUrl} title={photo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <Image src={photo.imageSrc} alt={photo.title} width={480} height={360} />}
              <figcaption><strong>{photo.title}</strong>{photo.description && <span>{photo.description}</span>}{photo.descriptionList?.length ? <ul>{photo.descriptionList.map((item) => <li key={item}>{item}</li>)}</ul> : null}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="chasing-50" className="simple-chasing-50" aria-labelledby="chasing-50-heading">
        <p className="simple-kicker">Places along the way</p>
        <h2 id="chasing-50-heading">Chasing 50</h2>
        <p className="simple-map-intro">A map of the places I’ve explored—and the states still waiting down the road.</p>
        <svg className="simple-map" viewBox={usa.viewBox} role="img" aria-label="Map of the United States showing states visited">
          {(usa.locations as MapLocation[]).map((location) => (
            <path
              key={location.id}
              d={location.path}
              className={`simple-map__state${STATE_STORIES[location.id]?.status === "complete" ? " simple-map__state--visited" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`Open details for ${location.name}`}
              onClick={(event) => openState(location.id, event.currentTarget)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openState(location.id, event.currentTarget);
                }
              }}
            >
              <title>{location.name}</title>
            </path>
          ))}
        </svg>
        <div className="simple-state-stories">
          {Object.values(STATE_STORIES).filter((state) => state.status === "complete").map((state) => (
            <article className="simple-state-story" key={state.id}>
              {state.thumbnailSrc && <Image src={state.thumbnailSrc} alt={state.thumbnailAlt ?? ""} width={520} height={220} />}
              <div><p className="simple-meta">Complete</p><h3>{state.name}</h3><p>{state.content}</p></div>
            </article>
          ))}
        </div>
      </section>

      {selectedState && (
        <article
          className="note-detail anim-enter"
          aria-live="polite"
          onClick={() => setSelectedStateId(null)}
          role="presentation"
          onKeyDown={(event) => {
            if (event.key === "Escape") setSelectedStateId(null);
            if (event.key === "Tab") {
              event.preventDefault();
              stateDialogRef.current?.focus();
            }
          }}
        >
          <div
            className="detail-content-card project-detail-card state-detail-card anim-enter"
            ref={stateDialogRef}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="simple-state-title"
            tabIndex={-1}
          >
            {selectedState.thumbnailSrc ? (
              <Image
                className="state-detail-card__thumbnail"
                src={selectedState.thumbnailSrc}
                alt={selectedState.thumbnailAlt ?? ""}
                width={520}
                height={220}
              />
            ) : (
              <div className="state-detail-card__badge" aria-hidden="true">
                {selectedState.abbreviation}
              </div>
            )}
            <p className={`detail-meta state-detail-card__status state-detail-card__status--${selectedState.status}`}>
              {selectedState.status === "complete" ? "Complete" : "Incomplete"}
            </p>
            <h2 id="simple-state-title">{selectedState.name}</h2>
            <p className="detail-summary">{selectedState.content}</p>
          </div>
        </article>
      )}

      <footer><h2>Let’s connect.</h2><p><a className="simple-resume" href="/Ben%20Goulet%20-%20Software%20Engineer%20(1).pdf">View official resume <span aria-hidden="true">↗</span></a></p><p><a href="mailto:bengoulet02@gmail.com">bengoulet02@gmail.com</a></p></footer>
    </main>
  );
}
