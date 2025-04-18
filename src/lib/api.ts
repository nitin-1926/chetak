'use client';

import axios from 'axios';

// Get API URL from environment variables or use the default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor to add the auth token to requests
api.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	error => Promise.reject(error),
);

// Response interceptor to handle common errors
api.interceptors.response.use(
	response => response,
	error => {
		// Handle 401 Unauthorized errors (token expired/invalid)
		if (error.response && error.response.status === 401) {
			// Clear token and redirect to login
			localStorage.removeItem('token');
			localStorage.removeItem('user');
			window.location.href = '/auth';
		}
		return Promise.reject(error);
	},
);

// Authentication API
export const authAPI = {
	register: async (username: string, email: string, password: string) => {
		const response = await api.post('/register', { username, email, password });
		return response.data;
	},

	login: async (username: string, password: string) => {
		// Using URLSearchParams for form data format required by OAuth2
		const formData = new URLSearchParams();
		formData.append('username', username);
		formData.append('password', password);

		const response = await api.post('/token', formData.toString(), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		return response.data;
	},

	getProfile: async () => {
		const response = await api.get('/me');
		return response.data;
	},
};

// Twitter Integration API
export const twitterAPI = {
	getAuthUrl: async (callbackUrl: string) => {
		const response = await api.post('/twitter/auth', { callback_url: callbackUrl });
		return response.data;
	},

	handleCallback: async (oauthToken: string, oauthVerifier: string) => {
		const response = await api.post('/twitter/callback', {
			oauth_token: oauthToken,
			oauth_verifier: oauthVerifier,
		});
		return response.data;
	},
};

// Campaign API
export const campaignAPI = {
	createCampaign: async (campaignData: any) => {
		const response = await api.post('/campaigns', campaignData);
		return response.data;
	},

	getCampaigns: async () => {
		const response = await api.get('/campaigns');
		return response.data;
	},

	getCampaign: async (id: number) => {
		const response = await api.get(`/campaigns/${id}`);
		return response.data;
	},

	updateCampaign: async (id: number, campaignData: any) => {
		const response = await api.put(`/campaigns/${id}`, campaignData);
		return response.data;
	},

	deleteCampaign: async (id: number) => {
		const response = await api.delete(`/campaigns/${id}`);
		return response.data;
	},

	runCampaign: async (id: number) => {
		const response = await api.post(`/campaigns/${id}/run`);
		return response.data;
	},

	getCampaignPosts: async (id: number) => {
		const response = await api.get(`/campaigns/${id}/posts`);
		return response.data;
	},
};

// Posts API
export const postsAPI = {
	getAllPosts: async () => {
		const response = await api.get('/posts');
		return response.data;
	},
};

// User preferences API
export const preferencesAPI = {
	setPreferences: async (userId: number, preferences: any) => {
		const response = await api.post(`/users/${userId}/preferences`, preferences);
		return response.data;
	},
};

export default api;
