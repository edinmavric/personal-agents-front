import { agentsData } from '@/lib/data/agents';
import { usersData } from '@/lib/data/users';
import { authAxios } from './auth';
import { API_ENDPOINTS } from './api-config';

interface ChatMessage {
    role: 'user' | 'assistant';
    message: string;
    context: string;
    timestamp: string;
}

interface ChatHistory {
    [key: string]: ChatMessage[];
}

export interface User {
    id: number;
    name: string;
    subscribed_agents?: number[];
    chat_history?: ChatHistory;
}

export interface Agent {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    system_prompt: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ApiUser {
    id: number;
    password: string;
    last_login: string | null;
    is_superuser: boolean;
    is_staff: boolean;
    date_joined: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    created_at: string;
}

export interface Notification {
    id: number;
    message: string;
    timestamp: string;
    is_read: boolean;
    user: number;
}

export interface UserAgentSubscription {
    id: number;
    user_details: string;
    user: number;
    agent: number;
}

export const fetchAgents = async (): Promise<PaginatedResponse<Agent>> => {
    try {
        const response = await authAxios.get<PaginatedResponse<Agent>>(
            API_ENDPOINTS.agents
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching agents:', error);
        return {
            count: 0,
            next: null,
            previous: null,
            results: [],
        };
    }
};

export const fetchAgentById = async (id: number): Promise<Agent | null> => {
    try {
        const response = await authAxios.get<Agent>(
            `${API_ENDPOINTS.agents}/${id}/`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching agent:', error);
        return null;
    }
};

export const fetchUsers = async (): Promise<PaginatedResponse<ApiUser>> => {
    try {
        const response = await authAxios.get<PaginatedResponse<ApiUser>>(
            API_ENDPOINTS.users
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            count: 0,
            next: null,
            previous: null,
            results: [],
        };
    }
};

export const fetchUserById = async (id: number): Promise<ApiUser | null> => {
    try {
        const response = await authAxios.get<ApiUser>(
            `${API_ENDPOINTS.users}/${id}/`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

export const fetchNotifications = async (): Promise<
    PaginatedResponse<Notification>
> => {
    try {
        const response = await authAxios.get<PaginatedResponse<Notification>>(
            API_ENDPOINTS.notifications
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return {
            count: 0,
            next: null,
            previous: null,
            results: [],
        };
    }
};

export const fetchNotificationById = async (
    id: number
): Promise<Notification | null> => {
    try {
        const response = await authAxios.get<Notification>(
            `${API_ENDPOINTS.notifications}/${id}/`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching notification:', error);
        return null;
    }
};

export const createNotification = async (
    data: Omit<Notification, 'id'>
): Promise<Notification | null> => {
    try {
        const response = await authAxios.post<Notification>(
            API_ENDPOINTS.notifications,
            data
        );
        return response.data;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

export const markNotificationAsRead = async (
    id: number
): Promise<Notification | null> => {
    try {
        const response = await authAxios.patch<Notification>(
            `${API_ENDPOINTS.notifications}/${id}/`,
            { is_read: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return null;
    }
};

export const fetchUserAgentSubscriptions = async (): Promise<
    PaginatedResponse<UserAgentSubscription>
> => {
    try {
        const response = await authAxios.get<
            PaginatedResponse<UserAgentSubscription>
        >(API_ENDPOINTS.userAgentSubscriptions);
        return response.data;
    } catch (error) {
        console.error('Error fetching user agent subscriptions:', error);
        return {
            count: 0,
            next: null,
            previous: null,
            results: [],
        };
    }
};

export const fetchUserAgentSubscriptionById = async (
    id: number
): Promise<UserAgentSubscription | null> => {
    try {
        const response = await authAxios.get<UserAgentSubscription>(
            `${API_ENDPOINTS.userAgentSubscriptions}/${id}/`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching user agent subscription:', error);
        return null;
    }
};

export const subscribeToAgent = async (userId: number, agentId: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const agent = agentsData.find(agent => agent.id === agentId);
            const user = usersData.find(user => user.id === userId) as User;

            if (!agent) {
                return reject(new Error('Agent not found'));
            }
            if (!user) {
                return reject(new Error('User not found'));
            }
            if (!user.chat_history) {
                user.chat_history = {};
            }
            if (!user.subscribed_agents) {
                user.subscribed_agents = [];
            }

            if (!user.subscribed_agents.includes(agentId)) {
                user.subscribed_agents.push(agentId);
                const agentIdStr = agentId.toString();
                if (!user.chat_history[agentIdStr]) {
                    user.chat_history[agentIdStr] = [];
                }
                resolve({ success: true, message: 'Subscribed successfully' });
            } else {
                resolve({ success: false, message: 'Already subscribed' });
            }
        }, 1000);
    });
};

export const searchAndFilterAgents = async (
    searchQuery: string = '',
    tags: string[] = [],
    sortBy: 'rating' | 'price_asc' | 'price_desc' = 'rating'
) => {
    return new Promise(resolve => {
        setTimeout(() => {
            let filtered = agentsData.filter(agent => {
                const matchesSearch =
                    agent.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    agent.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    agent.tags.some(tag =>
                        tag.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                const matchesTags =
                    tags.length === 0 ||
                    tags.some(tag =>
                        agent.tags
                            .map(t => t.toLowerCase())
                            .includes(tag.toLowerCase())
                    );
                return matchesSearch && matchesTags;
            });

            const sorted = filtered.sort((a, b) => {
                const priceA = parseFloat(
                    String(a.price).replace(/[^0-9.-]+/g, '')
                );
                const priceB = parseFloat(
                    String(b.price).replace(/[^0-9.-]+/g, '')
                );

                switch (sortBy) {
                    case 'rating':
                        return (b.rating || 0) - (a.rating || 0);
                    case 'price_asc':
                        return (
                            (isNaN(priceA) ? Infinity : priceA) -
                            (isNaN(priceB) ? Infinity : priceB)
                        );
                    case 'price_desc':
                        return (
                            (isNaN(priceB) ? -Infinity : priceB) -
                            (isNaN(priceA) ? -Infinity : priceA)
                        );
                    default:
                        return 0;
                }
            });

            resolve(sorted);
        }, 500);
    });
};

export const checkSubscription = async (userId: number, agentId: number) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = usersData.find(user => user.id === userId);
            resolve(user?.subscribed_agents?.includes(agentId) || false);
        }, 500);
    });
};

export const fetchChatHistory = async (userId: number, agentId: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = usersData.find(user => user.id === userId);
            if (!user) {
                return reject(new Error('User not found'));
            }
            if (!user.chat_history) {
                user.chat_history = {
                    1: [],
                    2: [],
                };
            }
            const agentIdStr = agentId.toString();
            const history =
                (user.chat_history as { [key: string]: any[] })[agentIdStr] ||
                [];
            resolve(history);
        }, 300);
    });
};

export const sendMessage = async (
    userId: number,
    agentId: number,
    messageContent: string,
    contextContent: string
) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = usersData.find(user => user.id === userId) as User;
            const agent = agentsData.find(agent => agent.id === agentId);

            if (!user) {
                return reject(new Error('User not found'));
            }
            if (!agent) {
                return reject(new Error('Agent not found'));
            }
            if (!user.chat_history) {
                user.chat_history = {
                    1: [],
                };
            }
            // Ensure the key is a string if chat_history keys are expected to be strings
            const agentIdStr = agentId.toString();
            if (!user.chat_history[agentIdStr]) {
                user.chat_history[agentIdStr] = [];
            }

            const userMessage: ChatMessage = {
                role: 'user',
                message: messageContent,
                context: contextContent,
                timestamp: new Date().toISOString(),
            };
            user.chat_history[agentIdStr].push(userMessage);

            const agentResponse: ChatMessage = {
                role: 'assistant',
                message: `Simulated response from ${agent.name}: Acknowledged "${messageContent}"`,
                context: contextContent,
                timestamp: new Date().toISOString(),
            };

            setTimeout(() => {
                if (!user.chat_history) {
                    user.chat_history = {};
                }
                if (!user.chat_history[agentIdStr]) {
                    user.chat_history[agentIdStr] = [];
                }
                user.chat_history[agentIdStr].push(agentResponse);
                resolve(agentResponse);
            }, 700);
        }, 300);
    });
};
