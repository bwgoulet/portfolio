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
    id: "cloudify",
    title: "Cloudify",
    detail: "University of North Carolina HackNC, Chapel Hill, NC",
    resumeDate: "November 2021",
    bullets: [
      "Created Cloudify, a user-friendly application developed to simplify local file sharing by enabling users to quickly upload files and generate shareable links locally.",
      "Acquired valuable skills in Electron, refined React expertise, and mastered working under a tight deadline, significantly contributing to personal and team growth.",
      "Won Overall 1st place for HackNC 2021",
    ],
    imageSrc: "/projects/cloudify.png",
    detailImageSrc: "/projects/cloudify_gui.png",
    whyItMattered: "[Coming Soon!]",
    position: [-0.64, 1.96, 0.19],
    rotation: -0.15,
    color: "#f5dfa4",
  },
  {
    id: "fast-wallet",
    title: "Fast Wallet",
    detail: "Chapel Hill, NC",
    resumeDate: "January - March 2022",
    bullets: [
      "Helped develop a client-side GUI for optimization of Fast Wallet, a CNFT transaction bot for the Cardano blockchain",
      "Researched economic trends regarding the Cardano network",
      "Led a team of 14 students to generate $80,000 in net income using the FastWallet software",
    ],
    imageSrc: "/projects/fast_wallet.png",
    detailImageSrc: "/projects/fast_wallet_gui.png",
    whyItMattered: "[Coming Soon!]",
    position: [-0.12, 1.93, 0.19],
    rotation: -0.04,
    color: "#efe3b4",
  },
  {
    id: "brevity",
    title: "Brevity",
    detail: "University of North Carolina HackNC, Chapel Hill, NC",
    resumeDate: "November 2022",
    bullets: [
      "Created an email prioritization system that assesses urgency sentiment via the GPT-3 API, complemented by succinct summaries to streamline inbox navigation",
      "Addressed challenges such as the inadequacy of Google’s Sentiment Analysis API and the complexities of querying GPT-3 before ChatGPT, leading to a pivot to GPT-3 for improved accuracy in email urgency rating.",
      "Led the integration of a diverse tech stack including React, Tailwind CSS, JavaScript, and the GPT-3 API, following a comprehensive design and development process from storyboarding to deployment",
      "Awarded 2nd place overall at HackNC 2022.",
    ],
    imageSrc: "/projects/brevity.png",
    detailImageSrc: "/projects/brevitydetails2.png",
    whyItMattered: "[Coming Soon!]",
    position: [0.4, 1.91, 0.19],
    rotation: 0.1,
    color: "#f8e6ad",
  },
  {
    id: "unc-smash",
    title: "UNC Smash",
    detail: "University of North Carolina",
    resumeDate: "January 2024 - Present",
    bullets: [
      "Directed 80+ gaming tournaments for 170+ students, managing bracket design, scheduling, and live officiating.",
      "Led a team of three officers, delegating match officiating, venue setup, and payout procurement.",
      "Developed and maintained a weekly Twitch livestream, archiving matches and building community engagement.",
      "Grew active membership by 136% (25 to 59 weekly participants) and launched the club’s first NC-wide SSBM event.",
    ],
    imageSrc: "/projects/bath_bg.jpg",
    detailImageSrc: "/projects/uncsmash.jpg",
    whyItMattered: "[Coming Soon!]",
    position: [-0.34, 1.56, 0.19],
    rotation: -0.09,
    color: "#f0dca3",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    detail: "Durham, NC",
    resumeDate: "March 2026 - April 2026",
    bullets: [
      "Directed 80+ gaming tournaments for 170+ students, managing bracket design, scheduling, and live officiating.",
      "Led a team of three officers, delegating match officiating, venue setup, and payout procurement.",
      "Developed and maintained a weekly Twitch livestream, archiving matches and building community engagement.",
      "Grew active membership by 136% (25 to 59 weekly participants) and launched the club’s first NC-wide SSBM event.",
    ],
    imageSrc: "/projects/timeline.png",
    detailImageSrc: "/projects/portfolio.png",
    whyItMattered: "[Coming Soon!]",
    position: [0.24, 1.55, 0.19],
    rotation: 0.07,
    color: "#f7e5b8",
  },
  {
    id: "poker-tracker",
    title: "Poker Tracker",
    detail: "[Coming Soon!]",
    bullets: [],
    imageSrc: "/gallery/poker.jpg",
    detailImageSrc: "/gallery/poker.jpg",
    whyItMattered: "[Coming Soon!]",
    position: [0, 1.18, 0.19],
    rotation: -0.02,
    color: "#f3dfaa",
  },
];

export const PROJECT_NOTE_RECORD = Object.fromEntries(
  PROJECT_NOTES.map((note) => [note.id, note])
);
