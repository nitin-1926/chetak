import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Define schema for validation
const profileUpdateSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
});

// GET /api/user/profile - Get current user profile
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { email: session.user.email as string },
			select: {
				id: true,
				name: true,
				email: true,
				integrations: true,
				created_at: true,
				updated_at: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Extract Twitter integration details if they exist
		const integrations = user.integrations as Record<string, any> | null;
		const twitterIntegration = integrations?.twitter || null;

		// Format the response
		const formattedUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			created_at: user.created_at,
			updated_at: user.updated_at,
			integrations: {
				twitter: twitterIntegration,
			},
			hasTwitterIntegration: !!twitterIntegration,
		};

		return NextResponse.json(formattedUser);
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
	}
}

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get and validate request body
		const body = await req.json();
		const { name, email } = profileUpdateSchema.parse(body);

		// Check if email is being changed and if it's already in use
		if (email !== session.user.email) {
			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser) {
				return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
			}
		}

		// Update user profile
		const updatedUser = await prisma.user.update({
			where: { email: session.user.email as string },
			data: {
				name,
				email,
			},
			select: {
				id: true,
				name: true,
				email: true,
				integrations: true,
			},
		});

		// Extract Twitter integration details if they exist
		const integrations = updatedUser.integrations as Record<string, any> | null;
		const twitterIntegration = integrations?.twitter || null;

		// Format the response
		const formattedUser = {
			id: updatedUser.id,
			name: updatedUser.name,
			email: updatedUser.email,
			integrations: {
				twitter: twitterIntegration,
			},
			hasTwitterIntegration: !!twitterIntegration,
		};

		return NextResponse.json(formattedUser);
	} catch (error) {
		console.error('Error updating user profile:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.errors }, { status: 400 });
		}

		return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
	}
}
