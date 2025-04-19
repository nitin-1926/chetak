import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { encrypt, decrypt } from '@/lib/crypto';
import { TwitterService } from '@/lib/services/twitter';

// Define schema for validation
const twitterCredentialsSchema = z.object({
	apiKey: z.string().min(1, 'API key is required'),
	apiSecret: z.string().min(1, 'API secret is required'),
	accessToken: z.string().min(1, 'Access token is required'),
	accessSecret: z.string().min(1, 'Access secret is required'),
});

// GET /api/user/twitter - Get Twitter credentials
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user with integrations
		const user = await prisma.user.findUnique({
			where: { email: session.user.email as string },
			select: { integrations: true },
		});

		if (!user || !user.integrations) {
			return NextResponse.json({
				connected: false,
				message: 'No Twitter integration found',
			});
		}

		// Extract Twitter integration
		const integrations = user.integrations as Record<string, any>;
		const twitter = integrations.twitter;

		if (
			!twitter ||
			!twitter.api_key ||
			!twitter.api_secret ||
			!twitter.access_token ||
			!twitter.access_token_secret
		) {
			return NextResponse.json({
				connected: false,
				message: 'Incomplete Twitter integration found',
			});
		}

		// Decrypt the credentials
		try {
			const apiKey = decrypt(twitter.api_key);
			const apiSecret = decrypt(twitter.api_secret);
			const accessToken = decrypt(twitter.access_token);
			const accessSecret = decrypt(twitter.access_token_secret);

			// Only return partial values for security
			return NextResponse.json({
				connected: true,
				twitter: {
					// Show only first and last few characters of the tokens
					api_key: apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4),
					api_secret: apiSecret.substring(0, 4) + '...' + apiSecret.substring(apiSecret.length - 4),
					access_token: accessToken.substring(0, 4) + '...' + accessToken.substring(accessToken.length - 4),
					access_token_secret:
						accessSecret.substring(0, 4) + '...' + accessSecret.substring(accessSecret.length - 4),
					connected_at: twitter.connected_at,
				},
			});
		} catch (error) {
			console.error('Error decrypting Twitter credentials:', error);
			return NextResponse.json(
				{
					error: 'Failed to decrypt Twitter credentials',
					connected: true,
					masked: true,
				},
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error('Error fetching Twitter credentials:', error);
		return NextResponse.json({ error: 'Failed to fetch Twitter credentials' }, { status: 500 });
	}
}

// PUT /api/user/twitter - Update Twitter credentials
export async function PUT(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get and validate request body
		const body = await req.json();
		const { apiKey, apiSecret, accessToken, accessSecret } = twitterCredentialsSchema.parse(body);

		// Verify the credentials by making a test API call
		const tempTwitterService = new TwitterService(apiKey, apiSecret, accessToken, accessSecret);
		try {
			const isValid = await tempTwitterService.verifyCredentials();
			if (!isValid) {
				return NextResponse.json(
					{ error: 'Invalid Twitter credentials. Please check and try again.' },
					{ status: 400 },
				);
			}
		} catch (error) {
			console.error('Twitter verification failed:', error);
			return NextResponse.json(
				{ error: 'Failed to verify Twitter credentials. Please ensure they are correct.' },
				{ status: 400 },
			);
		}

		// Get current user to check existing integrations
		const currentUser = await prisma.user.findUnique({
			where: { email: session.user.email as string },
			select: { integrations: true },
		});

		// Encrypt the credentials before storing
		const encryptedApiKey = encrypt(apiKey);
		const encryptedApiSecret = encrypt(apiSecret);
		const encryptedAccessToken = encrypt(accessToken);
		const encryptedAccessSecret = encrypt(accessSecret);

		// Prepare the integrations object
		const existingIntegrations = (currentUser?.integrations as Record<string, any>) || {};
		const updatedIntegrations = {
			...existingIntegrations,
			twitter: {
				api_key: encryptedApiKey,
				api_secret: encryptedApiSecret,
				access_token: encryptedAccessToken,
				access_token_secret: encryptedAccessSecret,
				connected_at: new Date().toISOString(),
			},
		};

		// Update user with Twitter credentials
		const updatedUser = await prisma.user.update({
			where: { email: session.user.email as string },
			data: {
				integrations: updatedIntegrations,
			},
			select: {
				id: true,
				integrations: true,
			},
		});

		// Get user info if available to store username
		try {
			const userInfo = await tempTwitterService.getUserInfo();
			if (userInfo && userInfo.username) {
				// Update the integration with username
				const twitterWithUsername = {
					...updatedIntegrations.twitter,
					username: userInfo.username,
				};

				await prisma.user.update({
					where: { email: session.user.email as string },
					data: {
						integrations: {
							...updatedIntegrations,
							twitter: twitterWithUsername,
						},
					},
				});
			}
		} catch (error) {
			console.error('Error getting Twitter user info:', error);
			// We'll continue even if we can't get the username
		}

		return NextResponse.json({
			message: 'Twitter credentials updated successfully',
			connected: true,
			twitter: {
				// Show only partial values for security
				api_key: apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4),
				api_secret: apiSecret.substring(0, 4) + '...' + apiSecret.substring(apiSecret.length - 4),
				access_token: accessToken.substring(0, 4) + '...' + accessToken.substring(accessToken.length - 4),
				access_token_secret:
					accessSecret.substring(0, 4) + '...' + accessSecret.substring(accessSecret.length - 4),
				connected_at: updatedIntegrations.twitter.connected_at,
			},
		});
	} catch (error) {
		console.error('Error updating Twitter credentials:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.errors }, { status: 400 });
		}

		return NextResponse.json({ error: 'Failed to update Twitter credentials' }, { status: 500 });
	}
}

// DELETE /api/user/twitter - Remove Twitter integration
export async function DELETE() {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get current user to check existing integrations
		const currentUser = await prisma.user.findUnique({
			where: { email: session.user.email as string },
			select: { integrations: true },
		});

		// Remove Twitter from integrations
		const existingIntegrations = (currentUser?.integrations as Record<string, any>) || {};
		const { twitter, ...remainingIntegrations } = existingIntegrations;

		// Update user to remove Twitter credentials
		await prisma.user.update({
			where: { email: session.user.email as string },
			data: {
				integrations: Object.keys(remainingIntegrations).length > 0 ? remainingIntegrations : null,
			},
		});

		return NextResponse.json({
			message: 'Twitter integration removed successfully',
			connected: false,
		});
	} catch (error) {
		console.error('Error removing Twitter integration:', error);
		return NextResponse.json({ error: 'Failed to remove Twitter integration' }, { status: 500 });
	}
}
