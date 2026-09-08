export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  date: string;
  location: string;
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
    date: "August 2021 - August 2023",
    location: "Durham, NC",
    bullets: [
      "Designed and implemented a library of 18 interactive social animations in Godot, collaborating with developers, artists, and psychologists.",
      "Built a web-based reporting tool to display real-time statistics on company projects, user engagement, version history, release notes, and more.",
      "Tested applications in pre-production as part of the QA process, while closely communicating with developers and project leads.",
      "Utilized HTML5/CSS, JavaScript, React, PHP, Laravel, AWS, and Docker to support rapid deployment cycles.",
    ],
    placeholderImageSrc: "/experience/3cinstitute_logo.jpg",
    detailImageSrc: "/experience/3cdetails.png",
    whyItMattered: [
      "This was my first real SWE opportunity - many of the foundational skills I have today were formed through my experience at 3C.",
      "My first technical project was this library of e-games built in Godot for children in various US schools.",
      "It was a great introdution to the world of SWE; I got to work with a diverse group of professionals and it felt like my work was making a real impact.",
      "The summer after my work on Emotion Explorer (the e-game library), I worked on a monitoring app for all of the operations at 3C.",
      "This involved regular health checks on all our sites, easy access to all our projects in one place, and other internal tools to help our team speed up their workflow.",
      "Later, I also worked as a QA engineer once I was familiar with our clients and projects. I loved working at 3C, it was such a formative time in my career!"
    ].join(" "),
  },
  {
    id: "unc-cs",
    role: "Full Stack Software Engineer Intern",
    company: "UNC Department of Computer Science",
    date: "January 2024 - May 2024",
    location: "Chapel Hill, NC",
    bullets: [
      "Spearheaded the development of an innovative TA application platform to streamline the selection of Teaching Assistants in the Computer Science department.",
      "Implemented a challenging single-table inheritance mapping in SQLAlchemy to manage over 200 TA records, optimizing data organization and retrieval efficiency.",
      "Enhanced the CSXL community portal by developing new features, facilitating student engagement and experience in tech for over 2000 students.",
    ],
    placeholderImageSrc: "/experience/csxl.png",
    detailImageSrc: "/experience/csxl.png",
    whyItMattered: [
      "This project was part of a Software Engineering internship course I took while doing my undergrad at UNC.",
      "During my time at UNC, the CS program there had this site called the CSXL.",
      "It was this massive collaborative project that spanned coworking spaces, events, and community hubs for our CS program.",
      "I was responsible for building our new TA application (full-stack, a first for me at this point), and I absolutely loved it.",
      "This was one of the largest teams I've had the pleasure to work with, and I have fond memories of coworking with my friend Aziz... good times!"
    ].join(" "),
  },
  {
    id: "kinetik",
    role: "Data Science Intern",
    company: "Kinetik",
    date: "May 2024 - July 2024",
    location: "Chapel Hill, NC",
    bullets: [
      "Developed advanced statistical models to identify key signals driving go-to-market (GTM) strategies, contributing to data-driven decision-making.",
      "Partnered with an IT firm serving 86% of the Forbes Global 50 to define and track success metrics, improving overall GTM effectiveness.",
      "Leveraged Python, AWS, and SQL to ingest and process datasets of over 500,000 records, enhancing the scalability and efficiency of the GTM engine.",
    ],
    placeholderImageSrc: "/experience/kinetik_ai_logo.jpg",
    detailImageSrc: "/experience/kinetik_ai_logo.jpg",
    whyItMattered: [
      "This project was a real introduction to the world of big data, leveraging that data to increase revenue for clients, and utilizing AI in the SWE workflow.",
      "I had received this opportunity through the lovely folks in the Shuford program at UNC, our entrepreneurship program.",
      "It was around this time that I had become captivated by the startup style of development; I found that working on cutting-edge projects and wearing many hats was thrilling to me.",
      "I learned a ton at this internship, especially with how we could use some of those earlier models to draw larger conclusions about leads through signals and data."
    ].join(" "),
  },
  {
    id: "podcast-your-way",
    role: "Founding Engineer / Full-Stack Software Engineer",
    company: "Podcast Your Way",
    date: "June 2025 - March 2026",
    location: "Chapel Hill, NC",
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
    date: "March 2026 - Present",
    location: "Remote",
    bullets: [
      "Developing The Nexus, a Next.js + Supabase web platform for SSBU crew leagues, unifying user onboarding, match management, and stats publishing in one product surface.",
      "Architected a role-aware league system for directors, players, moderators, and admins, with route-level flows for dashboarding, match operations, and shared stat pages.",
      "Implemented a SQL-first data model and migration workflow (schema, seeds, prod push scripts) to support reliable environment promotion and data consistency.",
      "Roadmapped advanced competition features—including real-time match coordination, subscription-gated enrollment, and searchable player/team leaderboards—to scale league operations.",
    ],
    placeholderImageSrc: "/experience/Nexus Emerald Big.png",
    detailImageSrc: "/experience/Nexus Logotype Emerald Large.png",
    whyItMattered: [
      "My latest project.",
      "The Smash community has been a large part of my life for over a decade, and it's truly a full circle moment to pursue real work in this hobby that I love.",
      "I'll be working on this contract until the beginning of August - if you think I'd be a good fit for your project or team, don't hesitate to reach out!",
    ].join(" "),
  },
];

export const EXPERIENCE_RECORD = Object.fromEntries(
  EXPERIENCE_ENTRIES.map((entry) => [entry.id, entry])
);
