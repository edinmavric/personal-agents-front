export const usersData = [
    {
        "id": 1,
        "name": "John Doe",
        "email": "johndoe@gmail.com",
        "phone": "+1-202-555-0173",
        "password": "password123",
        "subscribed_agents": [1,2],
        "chat_history": {
            "1": [
                {
                    "message": "Hello, I need help with my order.",
                    "timestamp": "2023-10-01T10:00:00Z"
                },
                {
                    "message": "Sure, I can help you with that. Can you provide your order number?",
                    "timestamp": "2023-10-01T10:01:00Z"
                }
            ],
            "2": [
                {
                    "message": "What is the weather like today?",
                    "timestamp": "2023-10-02T11:00:00Z"
                },
                {
                    "message": "The weather is sunny with a high of 75°F.",
                    "timestamp": "2023-10-02T11:01:00Z"
                }
            ]
        }
    }
]

export interface ChatMessage {
    role: 'user' | 'assistant';
    message: string;
    timestamp: string;}

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    subscribed_agents: number[];
    chat_history: {
        [key: string]: ChatMessage[];
    };
}