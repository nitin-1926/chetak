import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db'; // Import the prisma client

// Define a schema for input validation
const userSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, email, password } = userSchema.parse(body);

		// Check if user already exists
		const existingUserByEmail = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUserByEmail) {
			return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
		}

		// Hash the password
		const hashedPassword = await hash(password, 10);

		// Create the user
		const user = await prisma.user.create({
			data: {
				name,
				email,
				hashed_password: hashedPassword,
			},
		});

		// Return the user without password
		const { hashed_password, ...userWithoutPassword } = user;

		return NextResponse.json({
			user: userWithoutPassword,
			message: 'User registered successfully',
		});
	} catch (error) {
		console.error('Registration error:', error);

		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: error.errors }, { status: 400 });
		}

		return NextResponse.json(
			{
				message: 'Something went wrong',
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
