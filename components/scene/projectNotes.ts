export type ProjectNote = {
  id: string;
  title: string;
  detail: string;
  imageSrc: string;
  position: [number, number, number];
  rotation: number;
  color: string;
};

export const PROJECT_NOTES: ProjectNote[] = [
  {
    id: 'summit-ui',
    title: 'Summit UI',
    detail: 'A polished dashboard concept focused on clean hierarchy, alpine-themed iconography, and reusable tokens for fast iteration.',
    imageSrc: '/note-images/summit-ui.svg',
    position: [-0.64, 1.96, 0.19],
    rotation: -0.15,
    color: '#f5dfa4'
  },
  {
    id: 'trail-maps',
    title: 'Trail Maps',
    detail: 'Interactive route layers with terrain overlays and waypoint storytelling for planning hikes before stepping outside.',
    imageSrc: '/note-images/trail-maps.svg',
    position: [-0.12, 1.93, 0.19],
    rotation: -0.04,
    color: '#efe3b4'
  },
  {
    id: 'night-camp',
    title: 'Night Camp',
    detail: 'A moody branding exercise with motion studies, ambient gradients, and playful mascot illustrations for launch content.',
    imageSrc: '/projects/brevity-logo.svg',
    position: [0.4, 1.91, 0.19],
    rotation: 0.1,
    color: '#f8e6ad'
  },
  {
    id: 'route-planner',
    title: 'Route Planner',
    detail: 'Prototype for trip sequencing, stop optimization, and drag-to-adjust day plans designed for quick itinerary tuning.',
    imageSrc: '/note-images/route-planner.svg',
    position: [-0.34, 1.56, 0.19],
    rotation: -0.09,
    color: '#f0dca3'
  },
  {
    id: 'gear-check',
    title: 'Gear Check',
    detail: 'Accessibility and QA checklist that tracks readiness across devices, motion preferences, and keyboard-only review.',
    imageSrc: '/note-images/gear-check.svg',
    position: [0.24, 1.55, 0.19],
    rotation: 0.07,
    color: '#f7e5b8'
  }
];

export const PROJECT_NOTE_RECORD = Object.fromEntries(PROJECT_NOTES.map((note) => [note.id, note]));
