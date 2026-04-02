export type ProjectNote = {
  id: string;
  title: string;
  detail: string;
  resumeMeta?: string;
  resumeDate?: string;
  bullets?: string[];
  imageSrc: string;
  detailImageSrc: string;
  whyItMattered: string;
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
    detailImageSrc: '/note-images/summit-ui.svg',
    whyItMattered:
      'This project helped sharpen product storytelling and design-system thinking, making future interfaces faster to build and easier to scale.',
    position: [-0.64, 1.96, 0.19],
    rotation: -0.15,
    color: '#f5dfa4'
  },
  {
    id: 'trail-maps',
    title: 'Trail Maps',
    detail: 'Interactive route layers with terrain overlays and waypoint storytelling for planning hikes before stepping outside.',
    imageSrc: '/note-images/trail-maps.svg',
    detailImageSrc: '/note-images/trail-maps.svg',
    whyItMattered:
      'It proved the value of blending data and narrative in a single interface, so users can make confident decisions without friction.',
    position: [-0.12, 1.93, 0.19],
    rotation: -0.04,
    color: '#efe3b4'
  },
  {
    id: 'night-camp',
    title: 'Brevity',
    detail: 'Created an email prioritization system using sentiment analysis and summarization to streamline inbox navigation.',
    resumeMeta: 'HackNC',
    resumeDate: 'October 2022 - November 2022',
    bullets: [
      'Addressed challenges such as the inadequacy of Google’s Sentiment Analysis API and the complexities of querying GPT-3 before ChatGPT, leading to a pivot to GPT-3 for improved accuracy in email urgency rating.',
      'Awarded 2nd place overall at HackNC 2022.'
    ],
    imageSrc: '/projects/brevity-logo.svg',
    detailImageSrc: '/projects/brevity-logo.svg',
    whyItMattered:
      'The work pushed creative direction and visual identity skills, showing how cohesive branding can increase clarity and memorability.',
    position: [0.4, 1.91, 0.19],
    rotation: 0.1,
    color: '#f8e6ad'
  },
  {
    id: 'unc-smash',
    title: 'UNC Smash',
    detail: 'Directed 80+ gaming tournaments for 170+ students, managing bracket design, scheduling, and live officiating.',
    resumeMeta: 'University of North Carolina',
    resumeDate: 'January 2024 - May 2025',
    bullets: [
      'Led a team of three officers, delegating match officiating, venue setup, and payout procurement.',
      'Developed and maintained a weekly Twitch livestream, archiving matches and building community engagement.',
      'Grew active membership by 136% (25 to 59 weekly participants) and launched the club’s first NC-wide SSBM event.'
    ],
    imageSrc: '/note-images/route-planner.svg',
    detailImageSrc: '/note-images/route-planner.svg',
    whyItMattered:
      'This concept explored practical UX for complex planning workflows, emphasizing fast edits and clear feedback under real constraints.',
    position: [-0.34, 1.56, 0.19],
    rotation: -0.09,
    color: '#f0dca3'
  },
  {
    id: 'gear-check',
    title: 'Gear Check',
    detail: 'Accessibility and QA checklist that tracks readiness across devices, motion preferences, and keyboard-only review.',
    imageSrc: '/note-images/gear-check.svg',
    detailImageSrc: '/note-images/gear-check.svg',
    whyItMattered:
      'It centered inclusive quality as part of everyday delivery, helping ship experiences that are resilient, accessible, and trustworthy.',
    position: [0.24, 1.55, 0.19],
    rotation: 0.07,
    color: '#f7e5b8'
  }
];

export const PROJECT_NOTE_RECORD = Object.fromEntries(PROJECT_NOTES.map((note) => [note.id, note]));
