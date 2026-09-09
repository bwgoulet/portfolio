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
    whyItMattered: [
      "One of my first ever projects, and likely the place where I first fell in love with entrepreneurship and software development as a whole.",
      "This was during my first semester of undergrad, and I had recently learned React independently to prepare for building this.",
      "It took the team and I nearly the full 24 hours to finish. We kept having issues with Electron that kept us from completing the project.",
      "But we finished... and then we won. As a wide-eyed freshman, winning a competitive hackathon full of so much talent and experience was surreal.",
      "I will never forget receiving the announcement in the elevator with the team - ggs only!"
    ].join(" "),
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
    whyItMattered: [
      "I almost excluded this project, but it changed my life and undergrad experience enough that it needs at least an inclusion.",
      "Early in my 2nd semester of undergrad, a friend and teammate from earlier showed me this bot he was using to buy NFTs quickly after release.",
      "This was a big deal because many of these releases were first come, first serve, with several captchas and gates to prevent botting.",
      "This would cause the price of the NFTs to skyrockets right after release, then plummet each day after.",
      "You can think of the old NFT market price graph like a Dunning-Kruger curve.",
      "At the time, he had only been using the bot for a couple turns - so I was immediately excited about increasing the use of this literal money printing bot.",
      "I ended up getting into Cardano, updating the GUI for the software, and bot > upselling as many NFTs as we could.",
      "The NFT bubble popped shortly after, and we were only able to profit on this for a few months.",
      "But the profits we did make allowed me to pay off my sophomore year of undergrad, all thanks to an exploitation of a broken market."
    ].join(" "),
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
    whyItMattered: [
      "After the previous year's hackathon, the team and I wanted to secure the fabled 'twopeat' and win a second year in a row.",
      "However, we knew that we would need a novel solution to a real problem to achieve that.",
      "At the time, AI was just barely entering the mainstream, and we thought it would be a cool technology to solve a problem with.",
      "This was mere weeks before the release of Chat-GPT, and we decided to use GPT-3 only because of issues with Google's Sentiment Analysis.",
      "I remember how cool we thought GPT-3 was and what Brevity was capable of. And admittedly, it was for the time.",
      "But writing this today, it's clear that this was only the beginning.",
      "Even though we got 2nd, this was my favorite hackathon I competed in - our first glimpse into the future and the world to come.",
    ].join(" "),
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
    whyItMattered: [
      "Smash has been such a large part of my life, and my time running tournaments and supporting our scene has been a highlight of my personal projects.",
      "While not a 'technical' project like the others on here, I consider my work for UNC smash to be one of the most personally relevant projects I've worked on.",
      "Leading a club, running tournaments, and competing all at once can be exhausting. But it is also incredibly rewarding!",
      "I've had the opportunity to become a better leader, competitor, and friend through my years in the scene.",
      "There is no greater joy for me than bringing people together to play the game I love!",
    ].join(" "),
    position: [-0.64, 1.56, 0.19],
    rotation: -0.09,
    color: "#f0dca3",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    detail: "Durham, NC",
    resumeDate: "March 2026 - Present",
    bullets: [
      "Coming soon!"
    ],
    imageSrc: "/projects/timeline.png",
    detailImageSrc: "/projects/portfolio.png",
    whyItMattered: "[Coming Soon!]",
    position: [-0.14, 1.55, 0.19],
    rotation: 0.07,
    color: "#f7e5b8",
  },
  {
    id: "poker-tracker",
    title: "Poker Tracker",
    detail: "Durham, NC",
    resumeDate: "July 2026 - Present",
    bullets: [
      "Built a full-stack poker analytics dashboard using Next.js, React, TypeScript, Tailwind CSS, Recharts, Zod, and SheetJS, transforming multi-season Excel workbooks into interactive player, game, and league statistics.",
      "Engineered an automated ETL pipeline that discovers new season files, parses and normalizes spreadsheet data, resolves player aliases, validates records, and reports financial reconciliation issues without modifying the source workbooks.",
      "Developed an analytics engine for ROI, profitability, win rate, volatility, streaks, attendance, and player rankings, plus a percentile-based model that classifies playing styles with sample-size confidence thresholds.",
      "Created responsive, shareable dashboards with URL-based filters, interactive charts, head-to-head player comparisons, accessible data tables, and automated Vitest/TypeScript quality checks."
    ],
    imageSrc: "/projects/pokertracker.png",
    detailImageSrc: "/projects/uncpoker.png",
    whyItMattered: [
      "This is the latest personal project that I've grown attached to!",
      "For the last year and a half, I've played at a home game we host in Chapel Hill.",
      "We're all super into poker and stats, so we've been recording each night since the beginning.",
      "Earlier this summer, I was inspired to build out an actual, deployed site we can reference instead of littered excel sheets.",
      "This was why I created the 'UNC Poker Tracker', a smarter stats tracker using our spreadsheet data as the source of truth.",
      "Now, it's grown to become something much larger. It has all kinds of stats, player insights, etc.",
      "I'm planning on adding an actual database and support for multiple leagues next, among other changes.",
      "Nothing too crazy but it's been a blast to work on!"
    ].join(" "),
    position: [0.4, 1.55, 0.19],
    rotation: -0.02,
    color: "#f3dfaa",
  },
];

export const PROJECT_NOTE_RECORD = Object.fromEntries(
  PROJECT_NOTES.map((note) => [note.id, note])
);
