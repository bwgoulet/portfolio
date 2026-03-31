'use client';

import type { ExperienceEntry } from './experienceData';
import { DetailOverlayShell } from './DetailOverlayShell';

type ExperienceDetailOverlayProps = {
  experience: ExperienceEntry;
  onClose: () => void;
};

export function ExperienceDetailOverlay({ experience, onClose }: ExperienceDetailOverlayProps) {
  return (
    <DetailOverlayShell ariaLabel={`${experience.role} details`} onClose={onClose} cardClassName="experience-detail-card">
      <h2>{experience.role}</h2>
      <p className="experience-detail-meta">{experience.company}</p>
      <p className="experience-detail-meta">{experience.dateLocation}</p>
      <ul>
        {experience.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </DetailOverlayShell>
  );
}
