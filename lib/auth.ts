import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { User } from './api';

const API_URL = 'https://hackathon-api-f8pfp.ondigitalocean.app';

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

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export const authAxios = axios.create({
    baseURL: API_URL,
});

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

authAxios.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshed = await refreshToken();

                if (refreshed) {
                    const tokens = sessionStorage.getItem('auth_tokens');
                    if (tokens) {
                        const { access } = JSON.parse(tokens);
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${access}`;
                        }
                        return axios(originalRequest);
                    }
                } else {
                    await logout(); 
                    return Promise.reject(
                        new Error('Token refresh failed, logged out.')
                    );
                }
            } catch (refreshError) {
                console.error(
                    'Error during token refresh or retry:',
                    refreshError
                );
                await logout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/login/`,
            data
        );
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

export const signup = async (data: SignupData): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(
            `${API_URL}/auth/registration/`,
            {
                ...data,
                role: 'admin',
            }
        );
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
        await authAxios.post(`${API_URL}/auth/logout/`);
    } catch (error) {
        console.error('Logout API call failed (continuing cleanup):', error);
    } finally {
        sessionStorage.removeItem('auth_tokens');
        localStorage.removeItem('refresh_token');
    }
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const response = await authAxios.get<User>(`${API_URL}/auth/user/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

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
        return false;
    }
};

export const refreshToken = async (): Promise<boolean> => {
    try {
        const refreshData = localStorage.getItem('refresh_token');
        if (!refreshData) {
            console.log('No refresh token found.');
            return false;
        }

        const { refresh } = JSON.parse(refreshData);
        const response = await axios.post<{ access: string }>(
            `${API_URL}/auth/token/refresh/`,
            {
                refresh: refresh,
            }
        );

        sessionStorage.setItem(
            'auth_tokens',
            JSON.stringify({
                access: response.data.access,
            })
        );
        console.log('Token refreshed successfully.');
        return true;
    } catch (error) {
        console.error('Token refresh failed:', error);
        sessionStorage.removeItem('auth_tokens');
        localStorage.removeItem('refresh_token');
        return false;
    }
};
