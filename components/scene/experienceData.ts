export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  dateLocation: string;
  bullets: string[];
  placeholderImageSrc: string;
  detailImageSrc: string;
  whyItMattered: string;
};

export const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    id: "3c-institute",
    role: "Full Stack Software Engineer",
    company: "3C Institute for Social Development",
    dateLocation: "August 2021 - August 2023 Durham, NC",
    bullets: [
      "Designed and implemented a library of 18 interactive social animations in Godot, collaborating with developers, artists, and psychologists.",
      "Built a web-based reporting tool to display real-time statistics on company projects, user engagement, version history, release notes, and more.",
      "Tested applications in pre-production as part of the QA process, while closely communicating with developers and project leads.",
      "Utilized HTML5/CSS, JavaScript, React, PHP, Laravel, AWS, and Docker to support rapid deployment cycles.",
    ],
    placeholderImageSrc: "/experience/3cinstitute_logo.jpg",
    detailImageSrc: "/experience/3cdetails.png",
    whyItMattered: "[Coming Soon!]",
  },
  {
    id: "unc-cs",
    role: "Full Stack Software Engineer Intern",
    company: "UNC Department of Computer Science",
    dateLocation: "January 2024 - May 2024 Chapel Hill, NC",
    bullets: [
      "Spearheaded the development of an innovative TA application platform to streamline the selection of Teaching Assistants in the Computer Science department.",
      "Implemented a challenging single-table inheritance mapping in SQLAlchemy to manage over 200 TA records, optimizing data organization and retrieval efficiency.",
      "Enhanced the CSXL community portal by developing new features, facilitating student engagement and experience in tech for over 2000 students.",
    ],
    placeholderImageSrc: "/experience/csxl.png",
    detailImageSrc: "/experience/csxl.png",
    whyItMattered: "[Coming Soon!]",
  },
  {
    id: "kinetik",
    role: "Data Science Intern",
    company: "Kinetik",
    dateLocation: "May 2024 - July 2024 Chapel Hill, NC",
    bullets: [
      "Developed advanced statistical models to identify key signals driving go-to-market (GTM) strategies, contributing to data-driven decision-making.",
      "Partnered with an IT firm serving 86% of the Forbes Global 50 to define and track success metrics, improving overall GTM effectiveness.",
      "Leveraged Python, AWS, and SQL to ingest and process datasets of over 500,000 records, enhancing the scalability and efficiency of the GTM engine.",
    ],
    placeholderImageSrc: "/experience/kinetik_ai_logo.jpg",
    detailImageSrc: "/experience/kinetik_ai_logo.jpg",
    whyItMattered: "[Coming Soon!]",
  },
  {
    id: "podcast-your-way",
    role: "Founding Engineer / Full-Stack Software Engineer",
    company: "Podcast Your Way",
    dateLocation: "June 2025 - March 2026 Chapel Hill, NC",
    bullets: [
      "Architected and shipped an AI-powered learning platform for podcasters using Next.js, TypeScript, Supabase, and PostgreSQL, building the product from 0 to production and supporting 1,000+ users.",
      "Designed a graph-based curriculum and progress engine with per-user unlock and completion state, powering personalized dashboards, gated lesson flows, and scalable learner-state management.",
      "Built full-stack AI workflows for content generation and in-product assistance, including podcast title ideation, title analysis, cover art generation, lesson guidance, and script drafting.",
      "Implemented secure platform infrastructure across authentication, authorization, payments, and premium access using Supabase Auth, PostgreSQL RLS, RBAC, Stripe checkout, and webhook-driven entitlement updates.",
      "Developed community, admin, and operations tooling spanning live events, RSVP/reminder flows, content publishing, user management, and lifecycle automation for non-technical teammates.",
    ],
    placeholderImageSrc: "/experience/pyw-icon-logo.png",
    detailImageSrc: "/experience/pyw-bg.png",
    whyItMattered: "[Coming Soon!]",
  },
  {
    id: "the-nexus",
    role: "Full-Stack Software Engineer (Contract)",
    company: "The Nexus",
    dateLocation: "March 2026 - Present Remote",
    bullets: [
      "Developing The Nexus, a Next.js + Supabase web platform for SSBU crew leagues, unifying user onboarding, match management, and stats publishing in one product surface.",
      "Architected a role-aware league system for directors, players, moderators, and admins, with route-level flows for dashboarding, match operations, and shared stat pages.",
      "Implemented a SQL-first data model and migration workflow (schema, seeds, prod push scripts) to support reliable environment promotion and data consistency.",
      "Roadmapped advanced competition features—including real-time match coordination, subscription-gated enrollment, and searchable player/team leaderboards—to scale league operations.",
    ],
    placeholderImageSrc: "/projects/uncsmash.jpg",
    detailImageSrc: "/projects/uncsmash.jpg",
    whyItMattered:
      "My latest project. The Smash community has been a large part of my life for over a decade, and it's truly a full circle moment to pursue real work in this hobby that I love. I'll be working on this contract until the beginning of August - if you think I'd be a good fit for your project or team, don't hesitate to reach out!",
  },
];

export const EXPERIENCE_RECORD = Object.fromEntries(
  EXPERIENCE_ENTRIES.map((entry) => [entry.id, entry])
);
