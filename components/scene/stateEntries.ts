export type StateStatus = "complete" | "incomplete";

export type StateStory = {
  id: string;
  name: string;
  abbreviation: string;
  status: StateStatus;
  content: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
};

const STATE_NAMES: Record<string, string> = {
  al: "Alabama", ak: "Alaska", az: "Arizona", ar: "Arkansas", ca: "California",
  co: "Colorado", ct: "Connecticut", dc: "District of Columbia", de: "Delaware", fl: "Florida", ga: "Georgia",
  hi: "Hawaii", id: "Idaho", il: "Illinois", in: "Indiana", ia: "Iowa",
  ks: "Kansas", ky: "Kentucky", la: "Louisiana", me: "Maine", md: "Maryland",
  ma: "Massachusetts", mi: "Michigan", mn: "Minnesota", ms: "Mississippi", mo: "Missouri",
  mt: "Montana", ne: "Nebraska", nv: "Nevada", nh: "New Hampshire", nj: "New Jersey",
  nm: "New Mexico", ny: "New York", nc: "North Carolina", nd: "North Dakota", oh: "Ohio",
  ok: "Oklahoma", or: "Oregon", pa: "Pennsylvania", ri: "Rhode Island", sc: "South Carolina",
  sd: "South Dakota", tn: "Tennessee", tx: "Texas", ut: "Utah", vt: "Vermont",
  va: "Virginia", wa: "Washington", wv: "West Virginia", wi: "Wisconsin", wy: "Wyoming",
};

/**
 * Edit this object to publish a state's story. Each state can independently set
 * its completion status, card copy, and thumbnail without changing the map UI.
 */
const STATE_CONTENT: Partial<Record<string, Partial<Omit<StateStory, "id" | "name" | "abbreviation">>>> = {
  co: {
    status: "incomplete",
    content: "Colorado is still an open chapter on my map. Keep exploring the places that have shaped my journey.",
    thumbnailSrc: "/projects/chasing-50.png",
    thumbnailAlt: "The Chasing 50 mountain landscape",
  },
  nc: {
    status: "complete",
    content: "North Carolina is where I studied, built communities, and turned ambitious ideas into products. From UNC projects to startup work, it is the center of my story.",
    thumbnailSrc: "/gallery/mygrad.jpg",
    thumbnailAlt: "Ben celebrating his graduation in North Carolina",
  },
  vt: {
    status: "complete",
    content: "Vermont represents time spent exploring the outdoors and the kind of quiet, creative reset that keeps me curious.",
    thumbnailSrc: "/gallery/crater lake.jpg",
    thumbnailAlt: "A mountain landscape",
  },
};

export const STATE_STORIES: Record<string, StateStory> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([id, name]) => {
    const entry = STATE_CONTENT[id];
    return [id, {
      id,
      name,
      abbreviation: id.toUpperCase(),
      status: entry?.status ?? "incomplete",
      content: entry?.content ?? `${name} is still an open chapter on my map. Keep exploring the places that have shaped my journey.`,
      thumbnailSrc: entry?.thumbnailSrc,
      thumbnailAlt: entry?.thumbnailAlt,
    }];
  }),
);
