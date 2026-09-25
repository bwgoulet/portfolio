export type StateStatus = "complete" | "incomplete";

export type StateMedia = { src: string; alt: string; type?: "image" | "video" };

export type StateStory = {
  id: string;
  name: string;
  abbreviation: string;
  status: StateStatus;
  content: string;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
  mountainName?: string;
  ascentDate?: string;
  route?: string;
  roundTripDistance?: string;
  elevationGain?: string;
  classification?: string;
  difficulty?: string;
  notes?: string;
  media?: StateMedia[];
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
  // co: {
  //   status: "incomplete",
  //   content: "Colorado is still an open chapter on my map. Keep exploring the places that have shaped my journey.",
  //   thumbnailSrc: "/projects/chasing-50.png",
  //   thumbnailAlt: "The Chasing 50 mountain landscape",
  // },
  nc: {
    status: "complete",
    content: "The highest point in North Carolina—and the first completed chapter in my chase for all 50 state high points.",
    mountainName: "Mount Mitchell",
    ascentDate: "9/21/26",
    route: "Mount Mitchell Trail",
    roundTripDistance: "11.8 mi",
    elevationGain: "3,694 ft",
    classification: "5",
    difficulty: "3.5/5",
    notes: "At 6,684 feet, Mount Mitchell is the highest summit east of the Mississippi River and the highest point in my home state, North Carolina. The 12-mile trail was no joke; our hike was full of trials, including hornets, blisters, and slippery conditions. Despite the challenges, my climbing partner Stone and I summitted this first highpoint! The mountain's long, wooded trail was beautiful, with a few remarkable views along the way. 49 to go!",
    thumbnailSrc: "/projects/chasing-50.png",
    thumbnailAlt: "A low-poly mountain landscape from the Chasing 50 project",
    media: [
      {
        src: "/highpoints/mitchell.jpg",
        alt: "At the Mount Mitchell summit sign",
      },
      {
        src: "/highpoints/mitchell_summit.jpg",
        alt: "View from the summit of Mount Mitchell",
      },
      {
        src: "/highpoints/mitchell_landscape.jpg",
        alt: "Mountain landscape along the Mount Mitchell Trail",
      },
      {
        src: "/highpoints/mitchell_pin.mp4",
        alt: "Mount Mitchell map pin video",
        type: "video",
      },
    ],
  },
  // vt: {
  //   status: "complete",
  //   content: "Vermont represents time spent exploring the outdoors and the kind of quiet, creative reset that keeps me curious.",
  //   thumbnailSrc: "/gallery/crater lake.jpg",
  //   thumbnailAlt: "A mountain landscape",
  // },
};

export const STATE_STORIES: Record<string, StateStory> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([id, name]) => {
    const entry = STATE_CONTENT[id];
    return [id, {
      id,
      name,
      abbreviation: id.toUpperCase(),
      ...entry,
      status: entry?.status ?? "incomplete",
      content: entry?.content ?? `${name} is still on the map. Check out some of the other states in the meantime!`,
    }];
  }),
);
