"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { StateMedia, StateStory } from "./stateEntries";

function isVideo(item: StateMedia) {
  return item.type === "video" || /\.(mov|mp4|webm)(?:\?.*)?$/i.test(item.src);
}

export function StateDetailCard({ story, titleId }: { story: StateStory; titleId: string }) {
  const [mediaIndex, setMediaIndex] = useState(0);
  const dragStart = useRef<number | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const media = story.media ?? (story.thumbnailSrc ? [{ src: story.thumbnailSrc, alt: story.thumbnailAlt ?? "" }] : []);

  useEffect(() => setMediaIndex(0), [story.id]);
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (index !== mediaIndex) video?.pause();
    });
  }, [mediaIndex]);

  const selectMedia = (index: number) => setMediaIndex((index + media.length) % media.length);
  const relativePosition = (index: number) => {
    let position = index - mediaIndex;
    if (position > media.length / 2) position -= media.length;
    if (position < -media.length / 2) position += media.length;
    return position;
  };

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
    ["Elevation gain", story.elevationGain], ["Date of ascent", story.ascentDate],
    ["Round trip distance", story.roundTripDistance], ["Route", story.route],
    ["Martin Classification (Adjusted)", story.classification], ["Difficulty", story.difficulty],
  ];

  return (
    <>
      <header className="state-detail-card__header">
        <div><p className="state-detail-card__eyebrow">{story.name}</p><h2 id={titleId}>{story.mountainName}</h2></div>
        <span className="state-detail-card__complete">Completed</span>
      </header>

      {media.length > 0 && (
        <section
          className="state-carousel"
          aria-label={`${story.mountainName} media gallery`}
          aria-roledescription="carousel"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") selectMedia(mediaIndex - 1);
            if (event.key === "ArrowRight") selectMedia(mediaIndex + 1);
          }}
          onPointerDown={(event) => { dragStart.current = event.clientX; }}
          onPointerUp={(event) => {
            if (dragStart.current === null) return;
            const distance = event.clientX - dragStart.current;
            if (Math.abs(distance) > 45) selectMedia(mediaIndex + (distance < 0 ? 1 : -1));
            dragStart.current = null;
          }}
          onPointerCancel={() => { dragStart.current = null; }}
        >
          <div className="state-carousel__stage">
            {media.map((item, index) => {
              const position = relativePosition(index);
              const visiblePosition = Math.max(-2, Math.min(2, position));
              const active = index === mediaIndex;
              const video = isVideo(item);
              return (
                <figure
                  className="state-carousel__slide"
                  data-active={active || undefined}
                  data-position={visiblePosition}
                  key={item.src}
                  aria-hidden={!active}
                  onClick={() => !active && selectMedia(index)}
                >
                  {video ? (
                    <video ref={(node) => { videoRefs.current[index] = node; }} controls={active} playsInline preload="metadata" aria-label={item.alt}>
                      <source src={item.src} type={item.src.toLowerCase().includes(".mp4") ? "video/mp4" : item.src.toLowerCase().includes(".mov") ? "video/quicktime" : undefined} />
                      Your browser does not support this video format.
                    </video>
                  ) : (
                    <Image src={item.src} alt={item.alt} fill sizes="(max-width: 760px) 78vw, 570px" priority={index < 2} />
                  )}
                </figure>
              );
            })}
          </div>

          {media.length > 1 && (
            <nav className="state-carousel__controls" aria-label="Choose media">
              <div className="state-carousel__dots">
                {media.map((item, index) => (
                  <button key={item.src} type="button" aria-label={`Show media ${index + 1} of ${media.length}`} aria-current={index === mediaIndex ? "true" : undefined} onClick={() => selectMedia(index)} />
                ))}
              </div>
            </nav>
          )}
        </section>
      )}

      <dl className="state-detail-card__stats">
        {stats.map(([label, value]) => value && <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      <section className="state-detail-card__notes"><h3>Notes</h3><p>{story.notes ?? story.content}</p></section>
    </>
  );
}
