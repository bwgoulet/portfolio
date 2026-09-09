export type StateStory = {
  name: string;
  abbreviation: string;
  visited: boolean;
  heading: string;
  detail: string;
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

const FEATURED_STORIES: Partial<Record<string, Omit<StateStory, "name" | "abbreviation" | "visited">>> = {
  nc: {
    heading: "Home base",
    detail: "North Carolina is where I studied, built communities, and turned ambitious ideas into products. From UNC projects to startup work, it is the center of my story.",
  },
  vt: {
    heading: "Mountain memories",
    detail: "Vermont represents time spent exploring the outdoors and the kind of quiet, creative reset that keeps me curious.",
  },
};

export const STATE_STORIES: Record<string, StateStory> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([id, name]) => {
    const featured = FEATURED_STORIES[id];
    return [id, {
      name,
      abbreviation: id.toUpperCase(),
      visited: Boolean(featured),
      heading: featured?.heading ?? "A future trail",
      detail: featured?.detail ?? `${name} is still an open chapter on my map. Click back into the landscape and keep exploring the places that have shaped my journey.`,
    }];
  }),
);
