import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hash, compare } from 'bcrypt';
import { z } from 'zod';

// Define schema for validation
const passwordUpdateSchema = z.object({
	currentPassword: z.string().min(1, 'Current password is required'),
	newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// PUT /api/user/password - Update user password
export async function PUT(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get and validate request body
		const body = await req.json();
		const { currentPassword, newPassword } = passwordUpdateSchema.parse(body);

		// Get user with password
		const user = await prisma.user.findUnique({
			where: { email: session.user.email as string },
			select: {
				id: true,
				hashed_password: true,
			},
		});

		if (!user || !user.hashed_password) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Verify current password
		const isPasswordValid = await compare(currentPassword, user.hashed_password);
		if (!isPasswordValid) {
			return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
		}

		// Hash new password
		const hashedPassword = await hash(newPassword, 10);

		// Update password
		await prisma.user.update({
			where: { id: user.id },
			data: {
				hashed_password: hashedPassword,
			},
		});

		return NextResponse.json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Error updating password:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.errors }, { status: 400 });
		}

		return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
	}
}
