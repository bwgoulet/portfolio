'use client';

import type { ProjectNote } from './projectNotes';
import { DetailOverlayShell } from './DetailOverlayShell';

type ProjectDetailOverlayProps = {
  note: ProjectNote;
  onClose: () => void;
};

export function ProjectDetailOverlay({ note, onClose }: ProjectDetailOverlayProps) {
  return (
    <DetailOverlayShell ariaLabel={`${note.title} details`} onClose={onClose} cardClassName="note-detail-card">
      <img src={note.imageSrc} alt={`${note.title} post-it sketch`} />
      <h2>{note.title}</h2>
      <p>{note.detail}</p>
    </DetailOverlayShell>
  );
}
