'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { usePageTransition } from '@/utils/animations';
import { signIn } from 'next-auth/react';
import axios, { AxiosError } from 'axios';

export default function AuthPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { animationClass } = usePageTransition();
	const [isLoading, setIsLoading] = useState(false);

	// Form state
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate input
		if (!email || !password) {
			toast({
				variant: 'destructive',
				title: 'Invalid credentials',
				description: 'Please enter both email and password.',
			});
			return;
		}

		try {
			setIsLoading(true);
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				throw new Error(result.error);
			}

			toast({
				title: 'Welcome back!',
				description: 'You have signed in successfully',
			});

			// Navigate to dashboard
			router.push('/dashboard');
			router.refresh();
		} catch (error: unknown) {
			console.error('Login error:', error);
			setIsLoading(false);
			toast({
				variant: 'destructive',
				title: 'Authentication failed',
				description: error instanceof Error ? error.message : 'Invalid email or password',
			});
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate input
		if (!name || !email || !password) {
			toast({
				variant: 'destructive',
				title: 'Missing information',
				description: 'Please fill out all fields.',
			});
			return;
		}

		try {
			setIsLoading(true);

			// Register user
			const response = await axios.post('/api/register', {
				name,
				email,
				password,
			});

			// Sign in the user after registration
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				throw new Error(result.error);
			}

			toast({
				title: 'Account created!',
				description: `Welcome to Chetak, ${name}!`,
			});

			// Navigate to dashboard
			router.push('/dashboard');
			router.refresh();
		} catch (error: unknown) {
			console.error('Registration error:', error);
			setIsLoading(false);

			let errorMessage = 'Could not create account. Try a different email.';

			if (error instanceof AxiosError && error.response) {
				errorMessage = error.response.data.message || error.response.data.error || errorMessage;

				// Handle 409 conflict (user already exists)
				if (error.response.status === 409) {
					errorMessage = 'User with this email already exists. Try signing in instead.';
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			toast({
				variant: 'destructive',
				title: 'Registration failed',
				description: errorMessage,
			});
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className={`flex-1 flex items-center justify-center px-4 sm:px-6 py-24 ${animationClass}`}>
				<Card className="w-full max-w-md shadow-lg hover-card-shadow">
					<CardHeader>
						<CardTitle className="text-2xl text-center">Welcome to Chetak</CardTitle>
						<CardDescription className="text-center">
							Sign in or create an account to get started
						</CardDescription>
					</CardHeader>

					<Tabs defaultValue="signin" className="w-full">
						<TabsList className="grid w-full grid-cols-2 mb-4">
							<TabsTrigger value="signin">Sign In</TabsTrigger>
							<TabsTrigger value="signup">Create Account</TabsTrigger>
						</TabsList>

						<TabsContent value="signin">
							<form onSubmit={handleSignIn}>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											type="email"
											placeholder="your.email@example.com"
											value={email}
											onChange={e => setEmail(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="password">Password</Label>
											<Button
												type="button"
												variant="link"
												className="p-0 h-auto font-normal text-xs"
											>
												Forgot password?
											</Button>
										</div>
										<Input
											id="password"
											type="password"
											value={password}
											onChange={e => setPassword(e.target.value)}
											required
										/>
									</div>
								</CardContent>
								<CardFooter className="flex flex-col space-y-4">
									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? 'Signing in...' : 'Sign In'}
									</Button>
								</CardFooter>
							</form>
						</TabsContent>

						<TabsContent value="signup">
							<form onSubmit={handleSignUp}>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Name</Label>
										<Input
											id="name"
											placeholder="Your Name"
											value={name}
											onChange={e => setName(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="signup-email">Email</Label>
										<Input
											id="signup-email"
											type="email"
											placeholder="your.email@example.com"
											value={email}
											onChange={e => setEmail(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="signup-password">Password</Label>
										<Input
											id="signup-password"
											type="password"
											placeholder="Create a secure password"
											value={password}
											onChange={e => setPassword(e.target.value)}
											required
										/>
									</div>
								</CardContent>
								<CardFooter className="flex flex-col space-y-4">
									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? 'Creating Account...' : 'Create Account'}
									</Button>
								</CardFooter>
							</form>
						</TabsContent>
					</Tabs>
				</Card>
			</main>
		</div>
	);
}
