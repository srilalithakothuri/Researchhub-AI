<<<<<<< HEAD
import api from './api';

export interface User {
    email: string;
    password?: string;
    full_name?: string;
}

export const login = async (user: User) => {
    const response = await api.post('/auth/login', user);
    // Store token
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
};

export const register = async (user: User) => {
    const response = await api.post('/auth/register', user);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const updateCurrentUser = async (userData: any) => {
    const response = await api.patch('/auth/me', userData);
    return response.data;
};
=======
import api from './api';

export interface User {
    email: string;
    password?: string;
    full_name?: string;
}

export const login = async (user: User) => {
    const response = await api.post('/auth/login', user);
    // Store token
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
};

export const register = async (user: User) => {
    const response = await api.post('/auth/register', user);
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const updateCurrentUser = async (userData: any) => {
    const response = await api.patch('/auth/me', userData);
    return response.data;
};
>>>>>>> 76740baa8080bcfe7fa25b68292c1f41f340b754
