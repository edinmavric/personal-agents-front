import { authAxios } from './auth';
import { API_ENDPOINTS } from './api-config';

export interface ChatMessage {
    role: 'user' | 'assistant';
    message: string;
    context?: string;
    timestamp: string;
    mergedAgentIds?: number[];
}

interface ChatHistory {
    [key: string]: ChatMessage[];
}

export interface User {
    id: number;
    email: string;
}

export interface Agent {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    system_prompt: string;
    appearance?: {
        accent?: string;
        iconColor?: string;
        bgColor?: string;
        iconInitial?: string;
    };
    is_primary?: boolean;
    category?: string;
    is_public?: boolean;
    creator?: any;
    rating?: number;
    price?: string | number;
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

export interface AgentTemplate {
    id: number;
    creator_email: string;
    name: string;
    description: string;
    system_prompt: string;
    category: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    creator: number;
}

export interface PaginatedAgentTemplateResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AgentTemplate[];
}

export interface MergeQueryResponse {
    response: string;
}

export interface UserContext {
    context: string;
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
        const agentData = response.data;
        if (!agentData.appearance) {
            agentData.appearance = {
                iconInitial: agentData.name.charAt(0).toUpperCase(),
            };
        }
        return agentData;
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
        if ((error as any).response?.status === 404) {
            console.log(`User ${id} not found or no context exists.`);
            return null;
        }
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

export const fetchUnreadNotifications = async (): Promise<
    PaginatedResponse<Notification>
> => {
    try {
        const response = await authAxios.get<PaginatedResponse<Notification>>(
            API_ENDPOINTS.notifications,
            { params: { is_read: 'false' } }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching unread notifications:', error);
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

export const markAllNotificationsAsRead = async (): Promise<{
    success: boolean;
    count: number;
}> => {
    try {
        const response = await authAxios.post<{ count: number }>(
            `${API_ENDPOINTS.notifications}/mark-all-read/`
        );
        return { success: true, count: response.data.count };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { success: false, count: 0 };
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

export const subscribeToAgent = async (
    userId: number,
    agentId: number
): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        const response = await authAxios.post(
            API_ENDPOINTS.userAgentSubscriptions,
            {
                user: userId,
                agent: agentId,
                user_details: 'Subscribed via marketplace',
            }
        );
        return {
            success: true,
            message: 'Subscribed successfully',
            data: response.data,
        };
    } catch (error: any) {
        if (
            error.response &&
            error.response.status === 400 &&
            error.response.data?.non_field_errors?.includes('unique constraint')
        ) {
            return { success: false, message: 'Already subscribed' };
        }
        console.error('Error subscribing to agent:', error);
        return { success: false, message: 'Subscription failed' };
    }
};

export const searchAndFilterAgents = async (
    searchQuery: string = '',
    tags: string[] = [],
    sortBy: 'rating' | 'price_asc' | 'price_desc' = 'rating'
): Promise<Agent[]> => {
    try {
        const params: Record<string, string | string[]> = {
            search: searchQuery,
        };
        if (tags.length > 0) {
            params['category'] = tags[0];
        }

        let ordering = '';
        switch (sortBy) {
            case 'rating':
                ordering = '-rating';
                break;
            case 'price_asc':
                ordering = 'price';
                break;
            case 'price_desc':
                ordering = '-price';
                break;
        }
        if (ordering) {
            params['ordering'] = ordering;
        }

        const response = await authAxios.get<PaginatedResponse<Agent>>(
            API_ENDPOINTS.agents,
            { params }
        );
        return response.data.results || [];
    } catch (error) {
        console.error('Error searching/filtering agents:', error);
        return [];
    }
};

export const checkSubscription = async (userId: number, agentId: number) => {
    try {
        const response = await authAxios.get(
            `${API_ENDPOINTS.userAgentSubscriptions}/`,
            {
                params: { user: userId, agent: agentId },
            }
        );
        return response.data.count > 0;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
};

export const fetchChatHistory = async (
    userId: number,
    agentId: number
): Promise<ChatMessage[]> => {
    try {
        const response = await authAxios.get<
            ChatMessage[] | PaginatedResponse<ChatMessage>
        >(`${API_ENDPOINTS.agents}${agentId}/chat-history/`, {
            params: { user: userId },
        });

        // Check if the response is paginated
        if (
            typeof response.data === 'object' &&
            response.data !== null &&
            'results' in response.data &&
            Array.isArray(
                (response.data as PaginatedResponse<ChatMessage>).results
            )
        ) {
            return (response.data as PaginatedResponse<ChatMessage>)
                .results as ChatMessage[];
        }
        // Check if the response is a direct array (non-paginated)
        else if (Array.isArray(response.data)) {
            return response.data as ChatMessage[];
        }
        // Handle unexpected formats
        else {
            console.warn(
                'Received unexpected chat history format:',
                response.data
            );
            return [];
        }
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return [];
    }
};

export const sendMessage = async (
    agentId: number,
    messageContent: string,
    contextContent?: string
): Promise<ChatMessage | null> => {
    try {
        const response = await authAxios.post(
            `${API_ENDPOINTS.agents}${agentId}/messages/`,
            {
                message: messageContent,
                context: contextContent,
            }
        );
        return response.data as ChatMessage;
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
};

export const postAgentQuery = async (
    agentId: number,
    data: { query: string; user_context: string }
): Promise<any> => {
    try {
        const response = await authAxios.post(
            `${API_ENDPOINTS.agents}/${agentId}/query/`,
            data
        );
        return response.data;
    } catch (error) {
        console.error('Error posting agent query:', error);
        return null;
    }
};

export const postAgentsMergeQuery = async (data: {
    agent_ids: number[];
    query: string;
}): Promise<MergeQueryResponse | null> => {
    try {
        const response = await authAxios.post<MergeQueryResponse>(
            `${API_ENDPOINTS.agents}merge-query/`,
            data
        );
        return response.data;
    } catch (error) {
        console.error('Error posting agents merge query:', error);
        return null;
    }
};

export const fetchAgentTemplates =
    async (): Promise<PaginatedAgentTemplateResponse> => {
        try {
            const response =
                await authAxios.get<PaginatedAgentTemplateResponse>(
                    API_ENDPOINTS.agentTemplates
                );
            return response.data;
        } catch (error) {
            console.error('Error fetching agent templates:', error);
            return {
                count: 0,
                next: null,
                previous: null,
                results: [],
            };
        }
    };

export const fetchUserContext = async (
    userId: number
): Promise<string | null> => {
    try {
        const response = await authAxios.get<UserContext>(
            API_ENDPOINTS.userContext(userId)
        );
        return response.data.context;
    } catch (error) {
        if ((error as any).response?.status === 404) {
            console.log(`User ${userId} context not found.`);
            return null;
        }
        console.error('Error fetching user context:', error);
        return null;
    }
};

export const saveUserContext = async (
    userId: number,
    context: string
): Promise<boolean> => {
    try {
        await authAxios.put<UserContext>(API_ENDPOINTS.userContext(userId), {
            context,
        });
        return true;
    } catch (error) {
        console.error('Error saving user context:', error);
        return false;
    }
};

export const createAgent = async (
    agentData: Omit<
        Agent,
        'id' | 'rating' | 'reviewCount' | 'is_primary' | 'owner'
    >
): Promise<{ success: boolean; message: string; data?: Agent }> => {
    try {
        const payload = {
            ...agentData,
        };
        const response = await authAxios.post<Agent>(
            API_ENDPOINTS.agents,
            payload
        );
        return {
            success: true,
            message: 'Agent created successfully',
            data: response.data,
        };
    } catch (error: any) {
        console.error(
            'Error creating agent:',
            error.response?.data || error.message
        );
        return {
            success: false,
            message: error.response?.data?.detail || 'Agent creation failed',
        };
    }
};
