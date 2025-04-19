'use client';

import { Campaign, CampaignPayload, Post, PostPayload } from '@/types/api';

/**
 * API utility functions for making requests to the backend
 */

type FetchOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers?: Record<string, string>;
	body?: any;
};

/**
 * Fetch data from the API
 */
export async function fetchAPI<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
	const { method = 'GET', headers = {}, body } = options;

	const requestOptions: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		credentials: 'include', // Include cookies for auth
	};

	if (body) {
		requestOptions.body = JSON.stringify(body);
	}

	try {
		const response = await fetch(`/api${endpoint}`, requestOptions);

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			throw new Error(errorData?.error || `API error: ${response.status} ${response.statusText}`);
		}

		// For DELETE requests that return no content
		if (response.status === 204) {
			return { success: true } as T;
		}

		return await response.json();
	} catch (error) {
		console.error('API request failed:', error);
		throw error;
	}
}

/**
 * Campaign API methods
 */
export const CampaignAPI = {
	/**
	 * Get all campaigns
	 */
	getAll: () => fetchAPI<Campaign[]>('/campaigns'),

	/**
	 * Get a specific campaign by ID
	 */
	getById: (id: string) => fetchAPI<Campaign>(`/campaigns/${id}`),

	/**
	 * Create a new campaign
	 */
	create: (data: CampaignPayload) =>
		fetchAPI<Campaign>('/campaigns', {
			method: 'POST',
			body: data,
		}),

	/**
	 * Update an existing campaign
	 */
	update: (id: string, data: CampaignPayload) =>
		fetchAPI<Campaign>(`/campaigns/${id}`, {
			method: 'PUT',
			body: data,
		}),

	/**
	 * Delete a campaign
	 */
	delete: (id: string) =>
		fetchAPI(`/campaigns/${id}`, {
			method: 'DELETE',
		}),

	/**
	 * Get all posts for a campaign
	 */
	getPosts: (id: string) => fetchAPI<Post[]>(`/campaigns/${id}/posts`),
};

/**
 * Posts API methods
 */
export const PostAPI = {
	/**
	 * Get a specific post by ID
	 */
	getById: (id: string) => fetchAPI<Post>(`/posts/${id}`),

	/**
	 * Create a new post for a campaign
	 */
	create: (campaignId: string, data: PostPayload) =>
		fetchAPI<Post>(`/campaigns/${campaignId}/posts`, {
			method: 'POST',
			body: data,
		}),

	/**
	 * Update an existing post
	 */
	update: (id: string, data: PostPayload) =>
		fetchAPI<Post>(`/posts/${id}`, {
			method: 'PUT',
			body: data,
		}),

	/**
	 * Delete a post
	 */
	delete: (id: string) =>
		fetchAPI(`/posts/${id}`, {
			method: 'DELETE',
		}),
};
