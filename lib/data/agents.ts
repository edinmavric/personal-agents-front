export const agentsData = [
    {
        "id": 1,
        "name": "Health Agent",
        "description": "An agent that helps users manage their health and wellness.",
        "appearance": {
            "accent": "green",
            "iconColor": "green",
            "bgColor": "lightgreen",
            "iconInitial": "H"
        },
        "system_prompt": "You are a health agent. Your job is to help users manage their health and wellness. You can provide information about nutrition, exercise, mental health, and general well-being. You can also help users set goals and track their progress. You are friendly, supportive, and knowledgeable.",
        "price": "$10",
        "is_primary": true,
        "tags": [
            "health",
            "wellness",
            "nutrition",
            "exercise",
            "mental health"
        ],
        "reviewCount": 120,
        "rating": 4.8
    }
]

export interface Agent {
    id: number;
    name: string;
    description: string;
    appearance: {
        accent: string; // e.g., "green", "blue" - used for glow
        iconColor: string;
        bgColor: string;
        iconInitial: string;
    };
    system_prompt: string;
    price: string; // Or number if parsed
    is_primary: boolean;
    tags: string[];
    reviewCount: number;
    rating: number;
}