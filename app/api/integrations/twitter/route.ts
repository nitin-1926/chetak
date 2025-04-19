import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwitterService, twitterService } from '@/lib/services/twitter';

// GET /api/integrations/twitter - Get Twitter integration status
export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
			select: {
				id: true,
				integrations: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Parse integrations from JSON or use as is if already an object
		const integrations =
			typeof user.integrations === 'string' ? JSON.parse(user.integrations as string) : user.integrations;

		const twitterIntegration = integrations?.twitter || null;

		// Don't return actual keys/tokens for security reasons
		const hasTwitterIntegration = !!twitterIntegration;

		return NextResponse.json({
			integrated: hasTwitterIntegration,
			// Only return minimal info, not the actual credentials
			username: twitterIntegration?.username || null,
			connected_at: twitterIntegration?.connected_at || null,
		});
	} catch (error) {
		console.error('Error fetching Twitter integration:', error);
		return NextResponse.json({ error: 'Failed to fetch Twitter integration status' }, { status: 500 });
	}
}

// POST /api/integrations/twitter - Set up Twitter integration
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
			select: {
				id: true,
				integrations: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Parse request body to get Twitter credentials
		const { consumerKey, consumerSecret, accessToken, accessSecret } = await req.json();

		// Validate required fields
		if (!consumerKey || !consumerSecret || !accessToken || !accessSecret) {
			return NextResponse.json({ error: 'Missing required Twitter credentials' }, { status: 400 });
		}

		// Verify the credentials by making a test API call
		const tempTwitterService = new TwitterService(consumerKey, consumerSecret, accessToken, accessSecret);

		const isValid = await tempTwitterService.verifyCredentials();

		if (!isValid) {
			return NextResponse.json({ error: 'Invalid Twitter credentials' }, { status: 400 });
		}

		// Get user info to store with the integration
		const userInfo = await tempTwitterService.getUserInfo();

		// Parse existing integrations or create new object
		const existingIntegrations = user.integrations
			? typeof user.integrations === 'string'
				? JSON.parse(user.integrations as string)
				: user.integrations
			: {};

		// Update with Twitter integration
		const updatedIntegrations = {
			...existingIntegrations,
			twitter: {
				consumerKey,
				consumerSecret,
				accessToken,
				accessSecret,
				username: userInfo.username,
				userId: userInfo.id,
				connected_at: new Date().toISOString(),
			},
		};

		// Update user record
		await prisma.user.update({
			where: { id: user.id },
			data: {
				integrations: updatedIntegrations,
			},
		});

		return NextResponse.json({
			success: true,
			integrated: true,
			username: userInfo.username,
		});
	} catch (error) {
		console.error('Error setting up Twitter integration:', error);
		return NextResponse.json({ error: 'Failed to set up Twitter integration' }, { status: 500 });
	}
}

// DELETE /api/integrations/twitter - Remove Twitter integration
export async function DELETE(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
			select: {
				id: true,
				integrations: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Parse existing integrations
		const existingIntegrations = user.integrations
			? typeof user.integrations === 'string'
				? JSON.parse(user.integrations as string)
				: user.integrations
			: {};

		// Remove Twitter integration if it exists
		if (existingIntegrations.twitter) {
			delete existingIntegrations.twitter;

			// Update user record
			await prisma.user.update({
				where: { id: user.id },
				data: {
					integrations: existingIntegrations,
				},
			});
		}

		return NextResponse.json({
			success: true,
			message: 'Twitter integration removed successfully',
		});
	} catch (error) {
		console.error('Error removing Twitter integration:', error);
		return NextResponse.json({ error: 'Failed to remove Twitter integration' }, { status: 500 });
	}
}
