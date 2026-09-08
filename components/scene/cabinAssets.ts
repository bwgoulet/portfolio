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
    textureSrc: "/gallery/hacknc_jump.jpeg",
    title: "HackNC 2023",
    description: "A picture of the team and I from HackNC 2023",
  },
  {
    id: "photo-02",
    position: [-0.47, 0.6, -0.759],
    size: [0.11, 0.17],
    rotation: 0.06,
    pinOffsetX: 0.018,
    imageSrc: "/gallery/beatduke.jpg",
    textureSrc: "/gallery/beatduke.jpg",
    title: "Late-Night Build",
    description: "",
  },
  {
    id: "photo-03",
    position: [-0.2, 1.4, -0.759],
    size: [0.18, 0.12],
    rotation: -0.03,
    pinOffsetX: -0.015,
    imageSrc: "/gallery/pywteam.jpg",
    textureSrc: "/gallery/pywteam.jpg",
    title: "Team Snapshot",
    description: "",
  },
  {
    id: "photo-04",
    position: [0, 0.85, -0.759],
    size: [0.115, 0.17],
    rotation: 0.08,
    pinOffsetX: 0.016,
    imageSrc: "/gallery/poker.jpg",
    textureSrc: "/gallery/poker.jpg",
    title: "Focused Work",
    description: "",
  },
  {
    id: "photo-05",
    position: [0.4, 1.6, -0.759],
    size: [0.17, 0.12],
    rotation: -0.05,
    pinOffsetX: -0.018,
    imageSrc: "/gallery/hgod.jpg",
    textureSrc: "/gallery/hgod.jpg",
    title: "Community",
    description: "",
  },
  {
    id: "photo-06",
    position: [0.7, 1.5, -0.759],
    size: [0.11, 0.165],
    rotation: 0.04,
    pinOffsetX: 0.02,
    imageSrc: "/gallery/crater lake.jpg",
    textureSrc: "/gallery/crater lake.jpg",
    title: "Behind the Scenes",
    description: "",
  },
  {
    id: "photo-07",
    position: [-0.64, 1.2, -0.759],
    size: [0.17, 0.12],
    rotation: 0.07,
    pinOffsetX: 0.014,
    imageSrc: "/gallery/hellopio.jpg",
    textureSrc: "/gallery/hellopio.jpg",
    title: "Momentum",
    description: "",
  },
  {
    id: "photo-08",
    position: [-0.34, 1.04, -0.759],
    size: [0.18, 0.12],
    rotation: -0.07,
    pinOffsetX: -0.016,
    imageSrc: "/gallery/brevityaward.png",
    textureSrc: "/gallery/brevityaward.png",
    title: "Shared Wins",
    description: "",
  },
  {
    id: "photo-09",
    position: [0.15, 1.3, -0.759],
    size: [0.105, 0.16],
    rotation: 0.05,
    pinOffsetX: 0.016,
    imageSrc: "/gallery/tarheel10.jpg",
    textureSrc: "/gallery/tarheel10.jpg",
    title: "On the Move",
    description: "",
  },
  {
    id: "photo-10",
    position: [0.2, 0.5, -0.759],
    size: [0.17, 0.12],
    rotation: -0.06,
    pinOffsetX: -0.014,
    imageSrc: "/gallery/mayhem.jpg",
    textureSrc: "/gallery/mayhem.jpg",
    title: "Big Picture",
    description: "",
  },
  {
    id: "photo-11",
    position: [-0.7, 0.86, -0.759],
    size: [0.16, 0.115],
    rotation: 0.06,
    pinOffsetX: 0.015,
    imageSrc: "/gallery/acting.jpg",
    textureSrc: "/gallery/acting.jpg",
    title: "Gratitude",
    description: "",
  },
];

export const CABIN_INTERIOR_ARTWORKS: GalleryDetail[] = [
  {
    id: "artwork-framed-painting",
    imageSrc: "/gallery/prs25.jpg",
    textureSrc: "/gallery/prs25.jpg",
    title: "UNCCH Ultimate Pr (Spring '25)",
    description:
      "A framed memory pinned in the cabin—clicking in gives a closer look similar to the gallery photo view.",
  },
  {
    id: "artwork-wall-mounted-painting",
    imageSrc: "/gallery/prf25.png",
    textureSrc: "/gallery/prf25.png",
    title: "UNCCH Ultimate Pr (Fall '25)",
    description:
      "A larger wall piece that opens in a focused detail view with context text below the image.",
  },
  {
    id: "artwork-mirror-cube-upper",
    imageSrc: "/gallery/album9.png",
    textureSrc: "/gallery/thumbs/album9.webp",
    title: "Album 3x3",
    description:
      "A collection of some of my favorite albums! From top-left to bottom-right:",
    descriptionList: [
      "Ryo Fukui - Scenery",
      "Kendrick Lamar - To Pimp A Butterfly",
      "Clairo - Charm",
      "Men I Trust - Oncle Jazz",
      "Magdalena Bay - Imaginal Disk",
      "Con Todo El Mundo - Khruangbin",
      "Steely Dan - Can't Buy A Thrill",
      "Gorillaz - Demon Days",
      "Beach Fossils - Somersault",
    ],
  },
  {
    id: "artwork-mirror-cube-lower",
    imageSrc: "/gallery/game9.png",
    textureSrc: "/gallery/game9.png",
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
    imageSrc: "/gallery/mayhem.jpg",
    textureSrc: "/gallery/mayhem.jpg",
    title: "CRT Highlight Reel",
    description:
      "A video clip that plays in the same cabin detail card format as the rest of the interactive artworks.",
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
