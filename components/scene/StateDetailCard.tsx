"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { StateStory } from "./stateEntries";

export function StateDetailCard({ story, titleId }: { story: StateStory; titleId: string }) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const media = story.media ?? (story.thumbnailSrc ? [{ src: story.thumbnailSrc, alt: story.thumbnailAlt ?? "" }] : []);

  useEffect(() => setMediaIndex(0), [story.id]);

  if (story.status !== "complete" || !story.mountainName) {
    return (
      <>
        <div className="state-detail-card__badge" aria-hidden="true">{story.abbreviation}</div>
        <p className="detail-meta state-detail-card__status state-detail-card__status--incomplete">Incomplete</p>
        <h2 id={titleId}>{story.name}</h2>
        <p className="detail-summary">{story.content}</p>
      </>
    );
  }

  const stats = [
    ["Elevation gain", story.elevationGain],
    ["Date of ascent", story.ascentDate],
    ["Round trip distance", story.roundTripDistance],
    ["Route", story.route],
    ["Martin Classification (Adjusted)", story.classification],
    ["Difficulty", story.difficulty],
  ];

  return (
    <>
      <header className="state-detail-card__header">
        <div>
          <p className="state-detail-card__eyebrow">{story.name}</p>
          <h2 id={titleId}>{story.mountainName}</h2>
        </div>
        <span className="state-detail-card__complete">Completed</span>
      </header>

      {media.length > 0 && (
        <section className="state-carousel" aria-label={`${story.mountainName} media`}>
          <Image src={media[mediaIndex].src} alt={media[mediaIndex].alt} width={900} height={420} priority />
          {media.length > 1 && (
            <>
              <button type="button" className="state-carousel__button state-carousel__button--previous" aria-label="Previous photo" onClick={() => setMediaIndex((mediaIndex - 1 + media.length) % media.length)}>‹</button>
              <button type="button" className="state-carousel__button state-carousel__button--next" aria-label="Next photo" onClick={() => setMediaIndex((mediaIndex + 1) % media.length)}>›</button>
              <p className="state-carousel__count" aria-live="polite">{mediaIndex + 1} / {media.length}</p>
            </>
          )}
        </section>
      )}

      <dl className="state-detail-card__stats">
        {stats.map(([label, value]) => value && <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>

      <section className="state-detail-card__notes">
        <h3>Notes</h3>
        <p>{story.notes ?? story.content}</p>
      </section>
    </>
  );
}
