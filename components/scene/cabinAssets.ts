export type GalleryPhoto = {
  id: string;
  position: [number, number, number];
  size: [number, number];
  rotation: number;
  pinOffsetX: number;
  imageSrc: string;
  textureSrc: string;
  title: string;
  description: string;
  descriptionList?: string[];
};

export type GalleryDetail = Pick<
  GalleryPhoto,
  "id" | "imageSrc" | "textureSrc" | "title" | "description"
> & {
  descriptionList?: string[];
  videoEmbedUrl?: string;
};

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: "photo-01",
    position: [-0.7, 1.56, -0.759],
    size: [0.17, 0.12],
    rotation: -0.09,
    pinOffsetX: -0.02,
    imageSrc: "/gallery/hacknc_jump.jpeg",
    textureSrc: "/gallery/thumbs/hacknc_jump.webp",
    title: "HackNC 2023",
    description: "A picture of the team and I from HackNC 2023!",
  },
  {
    id: "photo-02",
    position: [-0.47, 0.6, -0.759],
    size: [0.11, 0.17],
    rotation: 0.06,
    pinOffsetX: 0.018,
    imageSrc: "/gallery/beatduke.jpg",
    textureSrc: "/gallery/thumbs/beatduke.webp",
    title: "UNC > Duke",
    description: "We beat Duke! Celebrating at Franklin St with friends, after a historic final four win at Coach K's final game.",
  },
  {
    id: "photo-03",
    position: [-0.2, 1.4, -0.759],
    size: [0.18, 0.12],
    rotation: -0.03,
    pinOffsetX: -0.015,
    imageSrc: "/gallery/pywteam.jpg",
    textureSrc: "/gallery/thumbs/pywteam.webp",
    title: "Podcast YourWay",
    description: "A picture of the team and I working on PYW.",
  },
  {
    id: "photo-04",
    position: [0, 0.85, -0.759],
    size: [0.115, 0.17],
    rotation: 0.08,
    pinOffsetX: 0.016,
    imageSrc: "/gallery/fanclub.jpg",
    textureSrc: "/gallery/thumbs/fanclub.webp",
    title: "Moondog",
    description: "A picture of me with my friends Mason and Calen at our weekly melee tournament!",
  },
  {
    id: "photo-05",
    position: [0.4, 1.6, -0.759],
    size: [0.17, 0.12],
    rotation: -0.05,
    pinOffsetX: -0.018,
    imageSrc: "/gallery/hgod.jpg",
    textureSrc: "/gallery/thumbs/hgod.webp",
    title: "Playing Hungrybox",
    description: "Had an opportunity to play HGod during a trip to NYC - I beat his Ness in Times Square!",
  },
  {
    id: "photo-06",
    position: [0.7, 1.5, -0.759],
    size: [0.11, 0.165],
    rotation: 0.04,
    pinOffsetX: 0.02,
    imageSrc: "/gallery/crater lake.jpg",
    textureSrc: "/gallery/thumbs/crater-lake.webp",
    title: "Crater Lake",
    description: "A picture of me on my travels!",
  },
  {
    id: "photo-07",
    position: [-0.64, 1.2, -0.759],
    size: [0.17, 0.12],
    rotation: 0.07,
    pinOffsetX: 0.014,
    imageSrc: "/gallery/hellopio.jpg",
    textureSrc: "/gallery/thumbs/hellopio.webp",
    title: "UNC Smash",
    description: "A picture of me playing in tournament at one of our UNC fests.",
  },
  {
    id: "photo-08",
    position: [-0.34, 1.04, -0.759],
    size: [0.18, 0.12],
    rotation: -0.07,
    pinOffsetX: -0.016,
    imageSrc: "/gallery/brevityaward.png",
    textureSrc: "/gallery/thumbs/brevityaward.webp",
    title: "Brevity",
    description: "A picture of the team and I after getting 2nd at HackNC 2022.",
  },
  {
    id: "photo-09",
    position: [0.15, 1.3, -0.759],
    size: [0.105, 0.16],
    rotation: 0.05,
    pinOffsetX: 0.016,
    imageSrc: "/gallery/tarheel10.jpg",
    textureSrc: "/gallery/thumbs/tarheel10.webp",
    title: "Tarheel 10",
    description: "A picture of me after running the Tarheel 10-miler. I run it every year!",
  },
  {
    id: "photo-10",
    position: [0.2, 0.5, -0.759],
    size: [0.17, 0.12],
    rotation: -0.06,
    pinOffsetX: -0.014,
    imageSrc: "/gallery/grad.jpg",
    textureSrc: "/gallery/thumbs/grad.webp",
    title: "Graduation",
    description: "A picture of my friend Noah and I at graduation!",
  },
  {
    id: "photo-11",
    position: [-0.7, 0.86, -0.759],
    size: [0.16, 0.115],
    rotation: 0.06,
    pinOffsetX: 0.015,
    imageSrc: "/gallery/acting.jpg",
    textureSrc: "/gallery/thumbs/acting.webp",
    title: "Performance",
    description: "A picture of me performing at a comedy show. I got to work alongside SNL writers, it was super cool!",
  },
];

export const CABIN_INTERIOR_ARTWORKS: GalleryDetail[] = [
  {
    id: "artwork-framed-painting",
    imageSrc: "/gallery/prs25.jpg",
    textureSrc: "/gallery/thumbs/prs25.webp",
    title: "UNCCH Ultimate Pr (Spring '25)",
    description:
      "Commisioned art piece from our Spring '25 Ult season.",
  },
  {
    id: "artwork-wall-mounted-painting",
    imageSrc: "/gallery/prf25.png",
    textureSrc: "/gallery/thumbs/prf25.webp",
    title: "UNCCH Ultimate Pr (Fall '25)",
    description:
      "Commisioned art piece from our Fall '25 Ult season.",
  },
  {
    id: "artwork-mirror-cube-upper",
    imageSrc: "/gallery/album9.png",
    textureSrc: "/gallery/thumbs/album9.webp",
    title: "Album 3x3",
    description:
      "A collection of some of my favorite albums! From top-left to bottom-right:",
    descriptionList: [
      "Joey Bada$$ - 1999",
      "Kendrick Lamar - To Pimp A Butterfly",
      "Tyler, The Creator - Chromakopia",
      "Men I Trust - Oncle Jazz",
      "Magdalena Bay - Imaginal Disk",
      "George Clanton - Ooh Rap I Ya",
      "Steely Dan - Can't Buy A Thrill",
      "Gorillaz - Demon Days",
      "Beach Fossils - Somersault",
    ],
  },
  {
    id: "artwork-mirror-cube-lower",
    imageSrc: "/gallery/game9.png",
    textureSrc: "/gallery/thumbs/game9.webp",
    title: "Game 3x3",
    description:
      "A collection of some of my favorite games! From top-left to bottom-right:",
    descriptionList: [
      "Celeste",
      "Cairn",
      "Super Metroid",
      "Final Fantasy VII",
      "Super Smash Bros. Melee",
      "Super Monkey Ball 2",
      "The Legend of Zelda: Ocarina of Time",
      "Omori",
      "Sid Meier's Civilization V",
    ],
  },
  {
    id: "artwork-crt-video",
    imageSrc: "/gallery/grad.jpg",
    textureSrc: "/gallery/thumbs/grad.webp",
    title: "carolina in my mind",
    description:
      "A short film I made around the time I graduated from UNC.",
    videoEmbedUrl: "https://www.youtube.com/embed/LED7Pzxuee8",
  },
];

export const CABIN_INTERIOR_MODEL_ASSETS = [
  "/models/Chair.glb",
  "/models/Table.glb",
  "/models/CRT.glb",
  "/models/Dartboard.glb",
  "/models/Mirror Cube.glb",
  "/models/Game Cube Controller.glb",
] as const;

export const CABIN_INTERIOR_TEXTURE_ASSETS = [
  "/gallery/thumbs/vidthumb.webp",
  "/textures-optimized/wood_floor_worn_diff_4k.jpg",
  "/textures-optimized/stained_pine_diff_4k.jpg",
  "/textures-optimized/oak_veneer_01_diff_4k.jpg",
  ...Array.from(
    new Set([
      ...GALLERY_PHOTOS.map((photo) => photo.textureSrc),
      ...CABIN_INTERIOR_ARTWORKS.map((artwork) => artwork.textureSrc),
    ]),
  ),
] as const;
