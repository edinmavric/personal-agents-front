export const API_BASE = 'https://hackathon-api-f8pfp.ondigitalocean.app/';

export const API_ENDPOINTS = {
    agents: `${API_BASE}api/v1/agents`,
    notes: `${API_BASE}api/v1/notes`,
    notifications: `${API_BASE}api/v1/notifications`,
    userAgentSubscriptions: `${API_BASE}api/v1/user-agent-subscriptions`,
    users: `${API_BASE}api/v1/users`,
    login: `${API_BASE}auth/login`,
    register: `${API_BASE}auth/registration`,
    logout: `${API_BASE}auth/logout`,
};
