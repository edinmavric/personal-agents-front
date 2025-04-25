import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// Configure API URL based on environment
const API_URL = 'https://edusoft-api-uommb.ondigitalocean.app';

export interface LoginData {
    email: string;
    password: string;
}

export interface SignupData {
    email: string;
    first_name: string;
    last_name: string;
    password1: string;
    password2: string;
}

export interface User {
    pk: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    role: string; // 'admin', 'teacher', 'secretary', 'parent', 'student'
    organization: number | null; // Organization ID
    organization_details?: { // Optional organization details
        id: number;
        name: string;
    } | null;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

// Create axios instance with authorization header
export const authAxios = axios.create({
    baseURL: API_URL,
});

// Add request interceptor to add token to requests
authAxios.interceptors.request.use(
    config => {
        const tokens = sessionStorage.getItem('auth_tokens');
        if (tokens) {
            const { access } = JSON.parse(tokens);
            config.headers.Authorization = `Bearer ${access}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Add response interceptor to handle token refresh
authAxios.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        // If error is 401 and we haven't already tried to refresh the token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshed = await refreshToken();

                if (refreshed) {
                    // If token refresh was successful, retry the original request
                    const tokens = sessionStorage.getItem('auth_tokens');
                    if (tokens) {
                        const { access } = JSON.parse(tokens);
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${access}`;
                        }
                        // Use the base axios instance for retrying to avoid infinite loops if the token is still invalid
                        return axios(originalRequest);
                    }
                } else {
                     // If refresh fails, logout
                    await logout(); // Ensure logout clears state and redirects
                    return Promise.reject(new Error("Token refresh failed, logged out."));
                }
            } catch (refreshError) {
                console.error('Error during token refresh or retry:', refreshError);
                 // If refresh fails, logout
                await logout(); // Ensure logout clears state and redirects
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(`${API_URL}/auth/login/`, data); // Use AuthResponse type
        // Store access token in session storage and refresh token in local storage
        sessionStorage.setItem(
            'auth_tokens',
            JSON.stringify({
                access: response.data.access,
            })
        );
        localStorage.setItem(
            'refresh_token',
            JSON.stringify({
                refresh: response.data.refresh,
            })
        );
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const signup = async (data: SignupData): Promise<AuthResponse>=> {
    try {
        const response = await axios.post<AuthResponse>(`${API_URL}/auth/registration/`, { // Use AuthResponse type
            ...data,
            role: 'admin', // Assuming default role for signup is admin
        });
        // Store tokens in session storage if they are returned
        if (response.data.access && response.data.refresh) {
            sessionStorage.setItem(
                'auth_tokens',
                JSON.stringify({
                    access: response.data.access,
                })
            );
            localStorage.setItem(
                'refresh_token',
                JSON.stringify({
                    refresh: response.data.refresh,
                })
            );
        }
        return response.data;
    } catch (error: unknown) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        // Attempt to call the logout endpoint, but proceed with cleanup regardless
        await authAxios.post(`${API_URL}/auth/logout/`);
    } catch (error) {
        console.error('Logout API call failed (continuing cleanup):', error);
    } finally {
        sessionStorage.removeItem('auth_tokens');
        localStorage.removeItem('refresh_token');
        // Optionally clear other user-related state here
    }
};

// Get current user profile
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const response = await authAxios.get<User>(`${API_URL}/auth/user/`); // Use User type
        // The response should now include organization and organization_details
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        // Avoid logging out here, let the interceptor handle 401s
        return null;
    }
};

// Verify token is still valid
export const verifyToken = async (): Promise<boolean> => {
    try {
        const tokens = sessionStorage.getItem('auth_tokens');
        if (!tokens) return false;

        const { access } = JSON.parse(tokens);
        await axios.post(`${API_URL}/auth/token/verify/`, {
            token: access,
        });
        return true;
    } catch (error) {
        // Don't log error here if it's just an expired token, let refresh handle it
        // console.error('Token verification failed:', error);
        return false;
    }
};

// Refresh token
export const refreshToken = async (): Promise<boolean> => {
    try {
        const refreshData = localStorage.getItem('refresh_token');
        if (!refreshData) {
            console.log("No refresh token found.");
            return false;
        }

        const { refresh } = JSON.parse(refreshData);
        const response = await axios.post<{ access: string }>(`${API_URL}/auth/token/refresh/`, { // Type the response
            refresh: refresh,
        });

        // Update only access token in session storage
        sessionStorage.setItem(
            'auth_tokens',
            JSON.stringify({
                access: response.data.access,
            })
        );
        console.log("Token refreshed successfully.");
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens on refresh failure
        sessionStorage.removeItem('auth_tokens');
        localStorage.removeItem('refresh_token');
        return false;
    }
};
