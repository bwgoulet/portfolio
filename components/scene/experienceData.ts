export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  dateLocation: string;
  bullets: string[];
  tabletLabel: string;
};

export const EXPERIENCE_ENTRIES: ExperienceEntry[] = [
  {
    id: 'podcast-your-way',
    role: 'Founding Engineer / Full-Stack Software Engineer',
    company: 'Podcast Your Way',
    dateLocation: 'June 2025 - March 2026 Chapel Hill, NC,',
    bullets: [
      'Architected and shipped an AI-powered learning platform for podcasters using Next.js, TypeScript, Supabase, and PostgreSQL, building the product from 0 to production and supporting 1,000+ users.',
      'Designed a graph-based curriculum and progress engine with per-user unlock and completion state, powering personalized dashboards, gated lesson flows, and scalable learner-state management.',
      'Built full-stack AI workflows for content generation and in-product assistance, including podcast title ideation, title analysis, cover art generation, lesson guidance, and script drafting.',
      'Implemented secure platform infrastructure across authentication, authorization, payments, and premium access using Supabase Auth, PostgreSQL RLS, RBAC, Stripe checkout, and webhook-driven entitlement updates.',
      'Developed community, admin, and operations tooling spanning live events, RSVP/reminder flows, content publishing, user management, and lifecycle automation for non-technical teammates.'
    ],
    tabletLabel: 'Podcast\nYour Way'
  },
  {
    id: 'kinetik',
    role: 'Data Science Intern',
    company: 'Kinetik',
    dateLocation: 'May 2024 - July 2024 Chapel Hill, NC,',
    bullets: [
      'Developed advanced statistical models to identify key signals driving go-to-market (GTM) strategies, contributing to data-driven decision-making.',
      'Partnered with an IT firm serving 86% of the Forbes Global 50 to define and track success metrics, improving overall GTM effectiveness.',
      'Leveraged Python, AWS, and SQL to ingest and process datasets of over 500,000 records, enhancing the scalability and efficiency of the GTM engine.'
    ],
    tabletLabel: 'Kinetik'
  },
  {
    id: 'unc-cs',
    role: 'Full Stack Software Engineer Intern',
    company: 'UNC Department of Computer Science',
    dateLocation: 'January 2024 - May 2024 Chapel Hill, NC,',
    bullets: [
      'Spearheaded the development of an innovative TA application platform to streamline the selection of Teaching Assistants in the Computer Science department.',
      'Implemented a challenging single-table inheritance mapping in SQLAlchemy to manage over 200 TA records, optimizing data organization and retrieval efficiency.',
      'Enhanced the CSXL community portal by developing new features, facilitating student engagement and experience in tech for over 2000 students.'
    ],
    tabletLabel: 'UNC CS'
  },
  {
    id: '3c-institute',
    role: 'Full Stack Software Engineer',
    company: '3C Institute for Social Development',
    dateLocation: 'August 2021 - August 2023 Durham, NC,',
    bullets: [
      'Designed and implemented a library of 18 interactive social animations in Godot, collaborating with developers, artists, and psychologists.',
      'Built a web-based reporting tool to display real-time statistics on user engagement, version history, and release notes.',
      'Tested applications in pre-production as part of the QA process, while closely communicating with developers and project leads.',
      'Utilized HTML5/CSS, JavaScript, React, PHP, Laravel, AWS, and Docker to support rapid deployment cycles.'
    ],
    tabletLabel: '3C\nInstitute'
  }
];
