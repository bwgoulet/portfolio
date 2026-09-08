import Image from "next/image";
import { EXPERIENCE_ENTRIES } from "./scene/experienceData";
import { PROJECT_NOTES } from "./scene/projectNotes";
import {
  CABIN_INTERIOR_ARTWORKS,
  GALLERY_PHOTOS,
} from "./scene/CabinInterior";

const INTRODUCTION = [
  "Hi, I’m Ben Goulet, a full-stack software engineer based in the Triangle with a strong focus on small-team and startup environments. I have about five years of total experience and graduated from UNC Chapel Hill.",
  "My work ranges from full-stack web development, DevOps and internal tooling to game development and community building. I’m currently pursuing strong engineering opportunities in the Triangle or remote while looking for my next big project.",
];

export function SimplePortfolio() {
  const gallery = [...GALLERY_PHOTOS, ...CABIN_INTERIOR_ARTWORKS];

  return (
    <main className="simple-portfolio" id="simple-content">
      <header className="simple-hero">
        <p className="simple-kicker">Full-stack software engineer · Durham, NC</p>
        <h1>Ben Goulet</h1>
        <p>{INTRODUCTION[0]}</p>
        <p>{INTRODUCTION[1]}</p>
        <nav aria-label="Portfolio sections">
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#timeline">Timeline</a>
          <a href="#gallery">Gallery</a>
          <a href="/Ben%20Goulet%20-%20Software%20Engineer%20(1).pdf">Resume</a>
        </nav>
      </header>

      <section id="experience" aria-labelledby="experience-heading">
        <p className="simple-kicker">What I’ve built with teams</p>
        <h2 id="experience-heading">Experience</h2>
        <div className="simple-grid">
          {EXPERIENCE_ENTRIES.map((entry) => (
            <article className="simple-card" key={entry.id}>
              <p className="simple-meta">{entry.dateLocation}</p>
              <h3>{entry.role}</h3>
              <p className="simple-company">{entry.company}</p>
              <ul>{entry.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
              <details><summary>Why it mattered</summary><p>{entry.whyItMattered}</p></details>
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
            </article>
          ))}
        </div>
      </section>

      <section id="timeline" aria-labelledby="timeline-heading">
        <p className="simple-kicker">The path so far</p>
        <h2 id="timeline-heading">Timeline</h2>
        <ol className="simple-timeline">
          {EXPERIENCE_ENTRIES.map((entry) => <li key={entry.id}><strong>{entry.company}</strong><span>{entry.dateLocation}</span><p>{entry.role}</p></li>)}
        </ol>
      </section>

      <section id="gallery" aria-labelledby="gallery-heading">
        <p className="simple-kicker">Beyond the work</p>
        <h2 id="gallery-heading">Gallery highlights</h2>
        <div className="simple-gallery">
          {gallery.map((photo) => (
            <figure key={photo.id}><Image src={photo.imageSrc} alt={photo.title} width={480} height={360} /><figcaption><strong>{photo.title}</strong>{photo.description && <span>{photo.description}</span>}</figcaption></figure>
          ))}
        </div>
      </section>

      <footer><h2>Let’s connect.</h2><p><a className="simple-resume" href="/Ben%20Goulet%20-%20Software%20Engineer%20(1).pdf">View official resume <span aria-hidden="true">↗</span></a></p><p><a href="mailto:bengoulet02@gmail.com">bengoulet02@gmail.com</a></p></footer>
    </main>
  );
}
