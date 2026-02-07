export interface Milestone {
    id: number;
    name: string;
    elevation: number; // meters
    description: string;
    coordinates: { x: number; y: number }; // Percentage on the map path
    zone: string;
    type: 'village' | 'site' | 'farm' | 'glacier' | 'camp' | 'summit' | 'start';
    isKeyMarker?: boolean;
    snapshot?: string;
}

export const MILESTONES: Milestone[] = [
    // Warm-up Phase (The Foothills)
    {
        id: 1,
        name: "U.S. Embassy",
        elevation: 1400,
        description: "The expedition HQ in Kathmandu.",
        coordinates: { x: 2, y: 100 },
        zone: "Warm-up Phase (The Foothills)",
        type: 'start',
        isKeyMarker: true
    },
    {
        id: 2,
        name: "Bhaktapur",
        elevation: 1401,
        description: "Ancient city walk.",
        coordinates: { x: 7, y: 100 },
        zone: "Warm-up Phase (The Foothills)",
        type: 'village'
    },
    {
        id: 3,
        name: "Dhulikhel",
        elevation: 1470,
        description: "Panoramic hill views.",
        coordinates: { x: 12, y: 99 },
        zone: "Warm-up Phase (The Foothills)",
        type: 'village'
    },
    {
        id: 4,
        name: "Charikot",
        elevation: 1550,
        description: "Mountain panoramas.",
        coordinates: { x: 17, y: 98 },
        zone: "Warm-up Phase (The Foothills)",
        type: 'village'
    },
    {
        id: 5,
        name: "Jiri (Gateway)",
        elevation: 1900,
        description: "The traditional start of the trek.",
        coordinates: { x: 22, y: 93 },
        zone: "Warm-up Phase (The Foothills)",
        type: 'village',
        isKeyMarker: true
    },
    {
        id: 6,
        name: "Mude",
        elevation: 2286,
        description: "A massive ridge ascent.",
        coordinates: { x: 27, y: 88 },
        zone: "Warm-up Phase (The Foothills)",
        type: 'village'
    },

    // Alpine Zone (The Solu Region)
    {
        id: 7,
        name: "Bhandar",
        elevation: 2600,
        description: "Entering the Solu region.",
        coordinates: { x: 32, y: 84 },
        zone: "Alpine Zone (The Solu Region)",
        type: 'village'
    },
    {
        id: 8,
        name: "Junbesi",
        elevation: 2700,
        description: "A beautiful Sherpa village.",
        coordinates: { x: 37, y: 82 },
        zone: "Alpine Zone (The Solu Region)",
        type: 'village'
    },
    {
        id: 9,
        name: "Surke",
        elevation: 2930,
        description: "Village located below the Lukla ridge.",
        coordinates: { x: 42, y: 79 },
        zone: "Alpine Zone (The Solu Region)",
        type: 'village'
    },

    // High Altitude Zone (The Khumbu Path)
    {
        id: 10,
        name: "Phakding",
        elevation: 2940,
        description: "Entering the main Khumbu valley.",
        coordinates: { x: 47, y: 79 },
        zone: "High Altitude Zone (The Khumbu Path)",
        type: 'village'
    },
    {
        id: 11,
        name: "Namche Bazaar",
        elevation: 3440,
        description: "The capital of the Sherpas.",
        coordinates: { x: 52, y: 72 },
        zone: "High Altitude Zone (The Khumbu Path)",
        type: 'village',
        isKeyMarker: true
    },
    {
        id: 12,
        name: "Tengboche",
        elevation: 3867,
        description: "Spiritual heart of the Khumbu region.",
        coordinates: { x: 57, y: 67 },
        zone: "High Altitude Zone (The Khumbu Path)",
        type: 'site'
    },
    {
        id: 13,
        name: "Dingboche",
        elevation: 4260,
        description: "High altitude farming village.",
        coordinates: { x: 62, y: 61 },
        zone: "High Altitude Zone (The Khumbu Path)",
        type: 'farm'
    },
    {
        id: 14,
        name: "Lobuche",
        elevation: 4940,
        description: "Terminus of the Khumbu Glacier.",
        coordinates: { x: 67, y: 52 },
        zone: "High Altitude Zone (The Khumbu Path)",
        type: 'glacier'
    },
    {
        id: 15,
        name: "Base Camp",
        elevation: 5364,
        description: "The foot of Mt. Everest.",
        coordinates: { x: 72, y: 47 },
        zone: "High Altitude Zone (The Khumbu Path)",
        type: 'camp',
        isKeyMarker: true
    },

    // Extreme Altitude Zone (The Summit Push)
    {
        id: 16,
        name: "Camp 1",
        elevation: 6065,
        description: "Located above the Khumbu Icefall.",
        coordinates: { x: 77, y: 37 },
        zone: "Extreme Altitude Zone (The Summit Push)",
        type: 'camp'
    },
    {
        id: 17,
        name: "Camp 2",
        elevation: 6400,
        description: "Known as Advanced Base Camp.",
        coordinates: { x: 82, y: 33 },
        zone: "Extreme Altitude Zone (The Summit Push)",
        type: 'camp'
    },
    {
        id: 18,
        name: "Camp 3",
        elevation: 7400,
        description: "Situated on the Lhotse Face.",
        coordinates: { x: 87, y: 19 },
        zone: "Extreme Altitude Zone (The Summit Push)",
        type: 'camp'
    },
    {
        id: 19,
        name: "Camp 4",
        elevation: 7470,
        description: "The South Col (Entering the Death Zone).",
        coordinates: { x: 92, y: 18 },
        zone: "Extreme Altitude Zone (The Summit Push)",
        type: 'camp'
    },
    {
        id: 20,
        name: "SUMMIT",
        elevation: 8848,
        description: "The highest point on Earth.",
        coordinates: { x: 98, y: 0 },
        zone: "Extreme Altitude Zone (The Summit Push)",
        type: 'summit',
        isKeyMarker: true
    }
];
