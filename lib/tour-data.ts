// Static tour content: locations, panorama ids, hotspots, and sidebar order.

export interface InfoContent {
  title: string;
  description: string;
}

export interface Hotspot {
  position: { x: number; y: number; z: number };
  label: string;
  target?: number;
  info?: InfoContent;
  type?: 'info' | 'animated-arrow-down' | 'animated-arrow-left' | 'animated-arrow-right' | 'animated-arrow-up';
}

export interface Location {
  name: string;
  panoramaId: number;
  hotspots: Hotspot[];
  panoramaRotation?: [number, number, number];
  initialCameraTarget?: [number, number, number];
}

export const locations: Location[] = [
  {
    name: "Giriş",
    panoramaId: 1,
    panoramaRotation: [0, 0, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.1, z: -0.25 }, label: "", target: 1, type: 'animated-arrow-down' },
      { position: { x: 1.5, y: -0.05, z: 4 }, label: "", target: 41, type: 'animated-arrow-down' },
      { position: { x: -1.5, y: -0.05, z: 4 }, label: "", target: 43, type: 'animated-arrow-right' },
      // { position: { x: -1, y: 0, z: 1.5 }, label: "Konferans Salonu", info: { title: "Konferans Salonu", description: "Okulumuzun Konferans Salonu. Geniş ve ferah!" }, type: 'info' },
    ],
    initialCameraTarget: [-0.01, 0, 0.1], // Default camera target
  },
  {
    name: "2",
    panoramaId: 2,
    panoramaRotation: [0, 0, 0],
    hotspots: [
      { position: { x: 3.5, y: -0.1, z: 0.2 }, label: "", target: 0, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: -0.1, z: -4 }, label: "", target: 42, type: 'animated-arrow-down' },
      { position: { x: -4.5, y: -0.1, z: -0.4 }, label: "", target: 2, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "3",
    panoramaId: 3,
    panoramaRotation: [0, Math.PI * 1.1, 0],
    hotspots: [
      { position: { x: 4, y: -0.05, z: 0.3 }, label: "", target: 1, type: 'animated-arrow-down' },
      { position: { x: 0, y: -0.1, z: -4 }, label: "", target: 3, type: 'animated-arrow-down' },
      { position: { x: -2.5, y: -0.1, z: -2.5 }, label: "", target: 5, type: 'animated-arrow-down' },
      { position: { x: -3, y: -0.1, z: -0.2 }, label: "", target: 10, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Anaokulu Arkası",
    panoramaId: 4,
    panoramaRotation: [0, Math.PI * 0.8, 0],
    hotspots: [
      { position: { x: 0, y: -0, z: 4 }, label: "", target: 2, type: 'animated-arrow-down' },
      { position: { x: -2.5, y: -0, z: 3.6 }, label: "", target: 5, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok ile C Blok Arası",
    panoramaId: 5,
    panoramaRotation: [0, Math.PI * 0.7, 0],
    hotspots: [
      { position: { x: 0.4, y: -0, z: 3 }, label: "", target: 10, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok Önü",
    panoramaId: 6,
    panoramaRotation: [0, Math.PI * 0.3, 0],
    hotspots: [
      { position: { x: 2.5, y: -0.1, z: 2.6 }, label: "", target: 2, type: 'animated-arrow-down' },
      { position: { x: 2, y: -0.1, z: -3 }, label: "", target: 3, type: 'animated-arrow-down' },
      { position: { x: 0.5, y: -0.1, z: -2.4 }, label: "", target: 6, type: 'animated-arrow-down' },
      { position: { x: -2, y: -0, z: 2.4 }, label: "", target: 10, type: 'animated-arrow-down' },
      { position: { x: -2.2, y: 0, z: -3 }, label: "", target: 4, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok Giriş",
    panoramaId: 7,
    panoramaRotation: [0, Math.PI * 1, 0],
    hotspots: [
      { position: { x: -0.5, y: -0.1, z: 3.2 }, label: "", target: 5, type: 'animated-arrow-down' },
      { position: { x: 0.65, y: -0.1, z: -4 }, label: "", target: 7, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok Koridor",
    panoramaId: 8,
    panoramaRotation: [0, Math.PI * 0.8, 0],
    hotspots: [
      { position: { x: -0.6, y: -0.1, z: 3.8 }, label: "", target: 6, type: 'animated-arrow-down' },
      { position: { x: -2.3, y: -0.1, z: 1 }, label: "", target: 8, type: 'animated-arrow-down' },
      { position: { x: -0.2, y: -0.1, z: -2.9 }, label: "", target: 9, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Matematik ve Bilim Atölyesi",
    panoramaId: 9,
    panoramaRotation: [0, Math.PI * 0.3, 0],
    hotspots: [
      { position: { x: 2.5, y: -0.1, z: -2.5 }, label: "", target: 7, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Robotik Odası",
    panoramaId: 10,
    panoramaRotation: [0, Math.PI * 0.3, 0],
    hotspots: [
      { position: { x: -2, y: -0.1, z: -2.8 }, label: "", target: 7, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Dörtyol",
    panoramaId: 11,
    panoramaRotation: [0, Math.PI * 1.55, 0],
    hotspots: [
      { position: { x: 3.8, y: -0.1, z: 0.3 }, label: "", target: 2, type: 'animated-arrow-down' },
      { position: { x: -3.8, y: -0.1, z: -0.3 }, label: "", target: 11, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: -0, z: -3 }, label: "", target: 4, type: 'animated-arrow-down' },
      { position: { x: -0.4, y: -0, z: 4 }, label: "", target: 39, type: 'animated-arrow-down' },
      { position: { x: 1.5, y: -0, z: -3 }, label: "", target: 5, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "C Blok Önü",
    panoramaId: 12,
    panoramaRotation: [0, Math.PI * 1.26, 0],
    hotspots: [
      { position: { x: 3.8, y: -0.1, z: 0.3 }, label: "", target: 10, type: 'animated-arrow-down' },
      { position: { x: -2.2, y: -0.1, z: -1.5 }, label: "", target: 12, type: 'animated-arrow-right' },
      { position: { x: -1.5, y: 0, z: 2.1 }, label: "", target: 15, type: 'animated-arrow-up' },
      { position: { x: -3.2, y: -0.1, z: -0.5 }, label: "", target: 19, type: 'animated-arrow-down' },

    ],
  },
  {
    name: "C Blok",
    panoramaId: 14,
    panoramaRotation: [0, Math.PI * 0.32, 0],
    hotspots: [
      { position: { x: -0.6, y: -0.1, z: 2 }, label: "", target: 11, type: 'animated-arrow-left' },
      { position: { x: -0, y: -0.1, z: -2 }, label: "", target: 13, type: 'animated-arrow-down' },
      { position: { x: 0.6, y: -0.1, z: -4 }, label: "", target: 14, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Bilgisayar Odası",
    panoramaId: 15,
    panoramaRotation: [0, Math.PI * 1.48, 0],
    hotspots: [
      { position: { x: 2.2, y: -0.1, z: -0.5 }, label: "", target: 12, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Fizik Odası",
    panoramaId: 16,
    panoramaRotation: [0, Math.PI * 1.05, 0],
    hotspots: [
      { position: { x: 2, y: -0.1, z: 0.4 }, label: "", target: 12, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "A Blok Öğretmen Girişi",
    panoramaId: 17,
    panoramaRotation: [0, Math.PI * 1.22, 0],
    hotspots: [
      { position: { x: 0.2, y: -0.15, z: -2.3 }, label: "", target: 11, type: 'animated-arrow-down' },

      { position: { x: 2, y: -0.15, z: 2.1 }, label: "", target: 16, type: 'animated-arrow-down' },
      { position: { x: 0.2, y: -0.05, z: 3.1 }, label: "", target: 17, type: 'animated-arrow-down' },
      { position: { x: 2, y: -0.15, z: 2.1 }, label: "", target: 18, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Brifing Salonu",
    panoramaId: 18,
    panoramaRotation: [0, Math.PI * 1, 0],
    hotspots: [
      { position: { x: -2, y: -0.25, z: 0.4 }, label: "", target: 15, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Örnek Sınıf",
    panoramaId: 19,
    panoramaRotation: [0, Math.PI * 1, 0],
    hotspots: [
      { position: { x: -2, y: -0.25, z: 0.7 }, label: "", target: 15, type: 'animated-arrow-right' },
      { position: { x: -2, y: -0.25, z: 1.1 }, label: "", target: 18, type: 'animated-arrow-left' },
    ],
  },
  {
    name: "A Blok Hol",
    panoramaId: 20,
    panoramaRotation: [0, Math.PI * 1.63, 0],
    hotspots: [
      { position: { x: -0.1, y: -0.05, z: -3.2 }, label: "", target: 17, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.05, z: 0.1 }, label: "", target: 39, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "20",
    panoramaId: 21,
    panoramaRotation: [0, Math.PI * 0.95, 0],
    hotspots: [
      { position: { x: 3.5, y: -0.1, z: 0.5 }, label: "", target: 11, type: 'animated-arrow-down' },
      { position: { x: 1.5, y: -0.1, z: -3 }, label: "", target: 21, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: 0.05, z: 3 }, label: "", target: 22, type: 'animated-arrow-up' },

    ],
  },
  {
    name: "Koru (C Blok Yanı)",
    panoramaId: 22,
    panoramaRotation: [0, Math.PI * 0.4, 0],
    hotspots: [
      { position: { x: 3, y: -0, z: 0.4 }, label: "", target: 21, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "C Blok Yanı",
    panoramaId: 23,
    panoramaRotation: [0, Math.PI * 0.75, 0],
    hotspots: [
      { position: { x: -0.2, y: -0.05, z: 3.4 }, label: "", target: 19, type: 'animated-arrow-down' },
      { position: { x: -3.5, y: -0.05, z: -0.8 }, label: "", target: 20, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "BALEV Merdiven Önü",
    panoramaId: 24,
    panoramaRotation: [0, Math.PI * 0.26, 0],
    hotspots: [
      { position: { x: -0, y: -0.1, z: -3.2 }, label: "", target: 19, type: 'animated-arrow-down' },
      { position: { x: -2.5, y: 0.2, z: 0 }, label: "", target: 23, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "BALEV Merdivenleri",
    panoramaId: 25,
    panoramaRotation: [0, Math.PI * 0.02, 0],
    hotspots: [
      { position: { x: 3, y: -0.3, z: 0.1 }, label: "", target: 19, type: 'animated-arrow-down' },
      { position: { x: -3, y: 0.14, z: -0.3 }, label: "", target: 24, type: 'animated-arrow-right' },
    ],
  },
  {
    name: "BALEV Yanı",
    panoramaId: 26,
    panoramaRotation: [0, Math.PI * 0.15, 0],
    hotspots: [
      { position: { x: -3, y: -0.1, z: 1.5 }, label: "", target: 25, type: 'animated-arrow-down' },
      { position: { x: 2.5, y: -0.1, z: 2.5 }, label: "", target: 23, type: 'animated-arrow-right' },
    ],
  },
  {
    name: "BALEV Arkası",
    panoramaId: 27,
    panoramaRotation: [0, Math.PI * 0.4, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.25, z: 0 }, label: "", target: 26, type: 'animated-arrow-down' },
      { position: { x: 3, y: 0.1, z: 0 }, label: "", target: 24, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Koru (BALEV Arkası)",
    panoramaId: 28,
    panoramaRotation: [0, Math.PI * 0.65, 0],
    hotspots: [
      { position: { x: 0.5, y: -0.05, z: 3.2 }, label: "", target: 27, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Koru (Arka Giriş)",
    panoramaId: 29,
    panoramaRotation: [0, Math.PI * -0.2, 0],
    hotspots: [
      { position: { x: 3, y: -0.05, z: -0.5 }, label: "", target: 28, type: 'animated-arrow-down' },
      { position: { x: -1, y: -0.05, z: -3.5 }, label: "", target: 26, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Koru (A Blok Arkası)",
    panoramaId: 30,
    panoramaRotation: [0, Math.PI * -0.25, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: 0.7 }, label: "", target: 27, type: 'animated-arrow-down' },
      { position: { x: 2.2, y: -0.1, z: 2.2 }, label: "", target: 29, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Kantin Yanı",
    panoramaId: 31,
    panoramaRotation: [0, Math.PI * 0.25, 0],
    hotspots: [
      { position: { x: -2, y: -0.05, z: -3 }, label: "", target: 28, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.1, z: 0.7 }, label: "", target: 30, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "31",
    panoramaId: 32,
    panoramaRotation: [0, Math.PI * -0, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: -1.75 }, label: "", target: 29, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: -0.05, z: 3.5 }, label: "", target: 31, type: 'animated-arrow-down' },
      { position: { x: 2, y: -0.05, z: 2.75 }, label: "", target: 32, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.05, z: -2.75 }, label: "", target: 38, type: 'animated-arrow-right' },
      { position: { x: 3, y: -0.05, z: -3.5 }, label: "", target: 39, type: 'animated-arrow-left' },
    ],
  },
  {
    name: "Müzik / Resim Atölyeleri",
    panoramaId: 33,
    panoramaRotation: [0, Math.PI * 1.25, 0],
    hotspots: [
      { position: { x: 0.75, y: -0.05, z: -3.5 }, label: "", target: 30, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Müzik Atölyesi Arkası",
    panoramaId: 34,
    panoramaRotation: [0, Math.PI * 0, 0],
    hotspots: [
      { position: { x: -1.2, y: -0.05, z: -3 }, label: "", target: 30, type: 'animated-arrow-down' },
      { position: { x: 0.5, y: -0.05, z: 3 }, label: "", target: 33, type: 'animated-arrow-left' },
    ],
  },
  {
    name: "G Blok Arkası",
    panoramaId: 35,
    panoramaRotation: [0, Math.PI * -0.4, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: -2 }, label: "", target: 32, type: 'animated-arrow-right' },
      { position: { x: 2, y: -0.05, z: -3.2 }, label: "", target: 34, type: 'animated-arrow-down' },
      { position: { x: 3.5, y: -0.05, z: -0.85 }, label: "", target: 35, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "G Blok Önü",
    panoramaId: 36,
    panoramaRotation: [0, Math.PI * 1.6, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: 2.5 }, label: "", target: 33, type: 'animated-arrow-down' },
      { position: { x: 1.45, y: -0, z: 3 }, label: "", target: 37, type: 'animated-arrow-up' },
      { position: { x: -2, y: -0, z: -3 }, label: "", target: 38, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "36",
    panoramaId: 37,
    panoramaRotation: [0, Math.PI * -0.15, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: .6 }, label: "", target: 33, type: 'animated-arrow-down' },
      { position: { x: -0.7, y: -0.05, z: -4 }, label: "", target: 36, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Halı Saha",
    panoramaId: 38,
    panoramaRotation: [0, Math.PI * -0.2, 0],
    hotspots: [
      { position: { x: 1, y: -0.05, z: 3.2 }, label: "", target: 35, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "G Blok",
    panoramaId: 39,
    panoramaRotation: [0, Math.PI * 0.83, 0],
    hotspots: [
      { position: { x: -0.5, y: -0.05, z: -3 }, label: "", target: 34, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Eski Kantin",
    panoramaId: 40,
    panoramaRotation: [0, Math.PI * 0.05, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.05, z: 1 }, label: "", target: 30, type: 'animated-arrow-down' },
      { position: { x: -2.8, y: -0, z: -3 }, label: "", target: 39, type: 'animated-arrow-down' },
      { position: { x: 1.8, y: -0.05, z: 3.5 }, label: "", target: 34, type: 'animated-arrow-down' },
      { position: { x: -1, y: -0., z: -4 }, label: "", target: 40, type: 'animated-arrow-up' },

    ],
  },
  {
    name: "A Blok Önü",
    panoramaId: 41,
    panoramaRotation: [0, Math.PI * 0.7, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: 1.7 }, label: "", target: 30, type: 'animated-arrow-left' },
      { position: { x: -3.5, y: -0.05, z: -1.2 }, label: "", target: 18, type: 'animated-arrow-up' },
      { position: { x: -3, y: -0.1, z: -3 }, label: "", target: 10, type: 'animated-arrow-right' },
      { position: { x: 2.9, y: 0.1, z: 3 }, label: "", target: 38, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.05, z: -2.5 }, label: "", target: 40, type: 'animated-arrow-down' },

    ],
  },
  {
    name: "Spor Sahası",
    panoramaId: 42,
    panoramaRotation: [0, Math.PI * 0.5, 0],
    hotspots: [
      { position: { x: -3.5, y: -0., z: 2 }, label: "", target: 39, type: 'animated-arrow-down' },
      { position: { x: -0, y: -0., z: 3.5 }, label: "", target: 38, type: 'animated-arrow-up' },
      { position: { x: 4, y: -0.05, z: -1 }, label: "", target: 41, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Spor Salonu Önü",
    panoramaId: 43,
    panoramaRotation: [0, Math.PI * 1.35, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.0, z: .7 }, label: "", target: 40, type: 'animated-arrow-up' },
      { position: { x: -1.5, y: -0.1, z: -3.7 }, label: "", target: 0, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Tören Alanı",
    panoramaId: 44,
    panoramaRotation: [0, Math.PI * 0.59, 0],
    hotspots: [
      { position: { x: -0, y: -0.05, z: 3.7 }, label: "", target: 1, type: 'animated-arrow-up' },
    ],
  },
  {
    name: "Konferans Salonu",
    panoramaId: 45,
    panoramaRotation: [0, Math.PI * 1.4, 0],
    hotspots: [
      { position: { x: -1, y: -0.1, z: -3.5 }, label: "", target: 0, type: 'animated-arrow-right' },
    ],
  },
];

export const GLOBAL_SIDEBAR_LOCATION_INDICES = [
  0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 31, 32, 33, 34, 36, 37,
  38, 39, 40, 41, 42, 43, 44 // removed 1, 2, 19, 30, 35
]; // Array.from({ length: locations.length }, (_, i) => i); // Default: show all locations
