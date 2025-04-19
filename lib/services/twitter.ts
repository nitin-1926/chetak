import { TwitterApi } from 'twitter-api-v2';

export class TwitterService {
	private client: TwitterApi | null = null;

	constructor(
		private consumerKey: string,
		private consumerSecret: string,
		private accessToken: string,
		private accessSecret: string,
	) {
		if (this.consumerKey && this.consumerSecret && this.accessToken && this.accessSecret) {
			try {
				console.log('[Twitter] Initializing Twitter client with provided credentials');
				// Create client with elevated read/write permissions
				this.client = new TwitterApi({
					appKey: this.consumerKey,
					appSecret: this.consumerSecret,
					accessToken: this.accessToken,
					accessSecret: this.accessSecret,
				});
				console.log('[Twitter] Twitter client initialized successfully');
			} catch (error) {
				console.error('[Twitter] Error initializing Twitter client:', error);
				this.client = null;
			}
		} else {
			console.warn('[Twitter] Some credentials are missing during initialization');
		}
	}

	/**
	 * Initialize the Twitter client with user credentials
	 */
	public initialize(consumerKey: string, consumerSecret: string, accessToken: string, accessSecret: string): void {
		console.log('[Twitter] Initializing Twitter client with new credentials');

		if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
			console.error('[Twitter] Missing required credentials for initialization');
			throw new Error('All Twitter credentials (consumer key/secret and access token/secret) are required');
		}

		try {
			// Create client with elevated read/write permissions
			this.client = new TwitterApi({
				appKey: consumerKey,
				appSecret: consumerSecret,
				accessToken: accessToken,
				accessSecret: accessSecret,
			});

			// Store the credentials
			this.consumerKey = consumerKey;
			this.consumerSecret = consumerSecret;
			this.accessToken = accessToken;
			this.accessSecret = accessSecret;

			console.log('[Twitter] Twitter client initialized successfully');
		} catch (error) {
			console.error('[Twitter] Error initializing Twitter client:', error);
			throw new Error(
				`Failed to initialize Twitter client: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Post a tweet
	 */
	public async postTweet(content: string): Promise<any> {
		console.log('[Twitter] Attempting to post tweet');

		if (!this.client) {
			console.error('[Twitter] Twitter client not initialized');
			throw new Error('Twitter client not initialized. Please set up credentials first.');
		}

		if (!content || content.trim() === '') {
			console.error('[Twitter] Tweet content is empty');
			throw new Error('Tweet content cannot be empty');
		}

		if (content.length > 280) {
			console.warn('[Twitter] Tweet content exceeds 280 characters, truncating');
			content = content.substring(0, 280);
		}

		try {
			console.log('[Twitter] Posting tweet with content:', content.substring(0, 30) + '...');

			// Access the V1 API directly (more reliable for posting)
			const v1Client = this.client.v1;

			// First try using v1 API to post (more reliable for OAuth1.0a)
			try {
				console.log('[Twitter] Trying to post via v1 API first');
				const v1Response = await v1Client.tweet(content);
				console.log('[Twitter] Successfully posted via v1 API, ID:', v1Response.id_str);
				return v1Response;
			} catch (v1Error) {
				console.error('[Twitter] V1 API posting failed, falling back to v2:', v1Error);

				// Fallback to v2 if v1 fails
				const response = await this.client.v2.tweet(content);
				console.log('[Twitter] Successfully posted to Twitter via v2 API, ID:', response.data.id);
				return response;
			}
		} catch (error) {
			console.error('[Twitter] Error posting tweet:', error);

			// Get more detailed error information if available
			if (error && typeof error === 'object' && 'data' in error) {
				const apiError = error as any;
				if (apiError.data && apiError.data.errors) {
					console.error('[Twitter] API error details:', apiError.data.errors);
				}

				if (apiError.data && apiError.data.detail && apiError.data.type) {
					console.error('[Twitter] Error detail:', apiError.data.detail);
					console.error('[Twitter] Error type:', apiError.data.type);
				}
			}

			throw error;
		}
	}

	/**
	 * Check if the credentials are valid
	 */
	public async verifyCredentials(): Promise<boolean> {
		console.log('[Twitter] Verifying credentials');

		if (!this.client) {
			console.error('[Twitter] Cannot verify credentials: Twitter client not initialized');
			return false;
		}

		try {
			// Use v1 API to check credentials as it's more reliable for OAuth1.0a
			const v1Client = this.client.v1;

			try {
				const v1Response = await v1Client.verifyCredentials();
				console.log('[Twitter] V1 credentials verified successfully for user:', v1Response.screen_name);
				return true;
			} catch (v1Error) {
				console.error('[Twitter] V1 credential verification failed, trying v2:', v1Error);

				// Fallback to v2 if v1 fails
				const response = await this.client.v2.me();
				console.log('[Twitter] V2 credentials verified successfully for user:', response.data.username);
				return !!response.data.id;
			}
		} catch (error) {
			console.error('[Twitter] Invalid Twitter credentials:', error);

			// Get more detailed error information if available
			if (error && typeof error === 'object' && 'data' in error) {
				const apiError = error as any;
				if (apiError.data && apiError.data.errors) {
					console.error('[Twitter] API error details:', apiError.data.errors);
				}

				if (apiError.data && apiError.data.detail && apiError.data.type) {
					console.error('[Twitter] Error detail:', apiError.data.detail);
					console.error('[Twitter] Error type:', apiError.data.type);
				}
			}

			return false;
		}
	}

	/**
	 * Get user information
	 */
	public async getUserInfo(): Promise<any> {
		console.log('[Twitter] Getting user information');

		if (!this.client) {
			console.error('[Twitter] Cannot get user info: Twitter client not initialized');
			throw new Error('Twitter client not initialized');
		}

		try {
			// Try v1 API first
			const v1Client = this.client.v1;

			try {
				const v1Response = await v1Client.verifyCredentials();
				console.log('[Twitter] V1 user info retrieved successfully for:', v1Response.screen_name);
				return v1Response;
			} catch (v1Error) {
				console.error('[Twitter] V1 user info failed, trying v2:', v1Error);

				// Fallback to v2 if v1 fails
				const response = await this.client.v2.me();
				console.log('[Twitter] V2 user info retrieved successfully for:', response.data.username);
				return response.data;
			}
		} catch (error) {
			console.error('[Twitter] Error fetching user info:', error);

			// Get more detailed error information if available
			if (error && typeof error === 'object' && 'data' in error) {
				const apiError = error as any;
				if (apiError.data && apiError.data.errors) {
					console.error('[Twitter] API error details:', apiError.data.errors);
				}

				if (apiError.data && apiError.data.detail && apiError.data.type) {
					console.error('[Twitter] Error detail:', apiError.data.detail);
					console.error('[Twitter] Error type:', apiError.data.type);
				}
			}

			throw error;
		}
	}
}

// Create a singleton instance
export const twitterService = new TwitterService(
	process.env.TWITTER_API_KEY || '',
	process.env.TWITTER_API_SECRET || '',
	process.env.TWITTER_ACCESS_TOKEN || '',
	process.env.TWITTER_ACCESS_SECRET || '',
);

export default twitterService;
