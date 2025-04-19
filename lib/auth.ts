import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import { compare } from 'bcrypt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db'; // Use the unified db client

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(db),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/auth',
	},
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const user = await db.user.findUnique({
					where: {
						email: credentials.email,
					},
				});

				if (!user || !user.hashed_password) {
					return null;
				}

				const isPasswordValid = await compare(credentials.password, user.hashed_password);

				if (!isPasswordValid) {
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
				};
			},
		}),
	],
	callbacks: {
		async session({ token, session }) {
			if (token) {
				session.user.id = token.id as string;
				session.user.name = token.name;
				session.user.email = token.email;
			}

			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
			}

			return token;
		},
	},
};
