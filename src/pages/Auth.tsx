import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { usePageTransition } from '@/utils/animations';
import { authAPI, twitterAPI } from '@/lib/api';

const Auth = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { animationClass } = usePageTransition();
	const [isLoading, setIsLoading] = useState(false);

	// Form state
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');

	const handleConnectX = async () => {
		try {
			setIsLoading(true);
			// In a real app, this would be a URL that can handle the Twitter OAuth callback
			const callbackUrl = `${window.location.origin}/twitter-callback`;
			const response = await twitterAPI.getAuthUrl(callbackUrl);

			// Redirect to Twitter for authentication
			window.location.href = response.auth_url;
		} catch (error) {
			console.error('Twitter auth error:', error);
			toast({
				variant: 'destructive',
				title: 'Authentication failed',
				description: 'Could not connect to Twitter. Please try again.',
			});
			setIsLoading(false);
		}
	};

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate input
		if (!username || !password) {
			toast({
				variant: 'destructive',
				title: 'Invalid credentials',
				description: 'Please enter both username and password.',
			});
			return;
		}

		try {
			setIsLoading(true);
			// const data = await authAPI.login(username, password);

			// // Store authentication data
			// localStorage.setItem('token', data.access_token);
			// localStorage.setItem(
			// 	'user',
			// 	JSON.stringify({
			// 		id: data.user_id,
			// 		username: data.username,
			// 	}),
			// );

			// toast({
			// 	title: 'Welcome back!',
			// 	description: `You're now signed in as ${data.username}`,
			// });

			// Navigate to dashboard
			navigate('/dashboard');
		} catch (error: unknown) {
			console.error('Login error:', error);
			toast({
				variant: 'destructive',
				title: 'Authentication failed',
				description: error instanceof Error ? error.message : 'Invalid username or password',
			});
			setIsLoading(false);
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate input
		if (!username || !email || !password) {
			toast({
				variant: 'destructive',
				title: 'Missing information',
				description: 'Please fill out all fields.',
			});
			return;
		}

		try {
			setIsLoading(true);
			const data = await authAPI.register(username, email, password);

			// Store authentication data
			localStorage.setItem('token', data.access_token);
			localStorage.setItem(
				'user',
				JSON.stringify({
					id: data.user_id,
					username: data.username,
				}),
			);

			toast({
				title: 'Account created!',
				description: `Welcome to Chetak, ${data.username}!`,
			});

			// Navigate to dashboard
			navigate('/dashboard');
		} catch (error: unknown) {
			console.error('Registration error:', error);
			toast({
				variant: 'destructive',
				title: 'Registration failed',
				description:
					error instanceof Error ? error.message : 'Could not create account. Try a different username or email.',
			});
			setIsLoading(false);
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
										<Label htmlFor="username">Username</Label>
										<Input
											id="username"
											placeholder="your_username"
											value={username}
											onChange={e => setUsername(e.target.value)}
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

									<div className="relative w-full flex items-center justify-center">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-gray-200 dark:border-gray-700" />
										</div>
										<div className="relative px-4 text-sm bg-card">
											<span className="text-muted-foreground">or</span>
										</div>
									</div>

									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={handleConnectX}
										disabled={isLoading}
									>
										Connect with X
									</Button>
								</CardFooter>
							</form>
						</TabsContent>

						<TabsContent value="signup">
							<form onSubmit={handleSignUp}>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="username-signup">Username</Label>
										<Input
											id="username-signup"
											placeholder="Choose a username"
											value={username}
											onChange={e => setUsername(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email-signup">Email</Label>
										<Input
											id="email-signup"
											type="email"
											placeholder="your@email.com"
											value={email}
											onChange={e => setEmail(e.target.value)}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="password-signup">Password</Label>
										<Input
											id="password-signup"
											type="password"
											value={password}
											onChange={e => setPassword(e.target.value)}
											required
										/>
									</div>
								</CardContent>
								<CardFooter className="flex flex-col space-y-4">
									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? 'Creating account...' : 'Create Account'}
									</Button>

									<div className="relative w-full flex items-center justify-center">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-gray-200 dark:border-gray-700" />
										</div>
										<div className="relative px-4 text-sm bg-card">
											<span className="text-muted-foreground">or</span>
										</div>
									</div>

									<Button
										type="button"
										variant="outline"
										className="w-full"
										onClick={handleConnectX}
										disabled={isLoading}
									>
										Connect with X
									</Button>
								</CardFooter>
							</form>
						</TabsContent>
					</Tabs>
				</Card>
			</main>
		</div>
	);
};

export default Auth;
