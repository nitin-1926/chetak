'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import { usePageTransition } from '@/utils/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Twitter, Loader2, AlertCircle, RefreshCw, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import axios, { AxiosError } from 'axios';

type TwitterCredentials = {
	access_token: string;
	access_token_secret: string;
	connected_at: string;
};

const SettingsPage = () => {
	const { data: session } = useSession();
	const { animationClass } = usePageTransition();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTwitterLoading, setIsTwitterLoading] = useState(false);

	// Profile settings state
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	// Twitter integration state
	const [twitterAccessToken, setTwitterAccessToken] = useState('');
	const [twitterAccessSecret, setTwitterAccessSecret] = useState('');
	const [twitterConnected, setTwitterConnected] = useState(false);
	const [twitterCredentials, setTwitterCredentials] = useState<TwitterCredentials | null>(null);
	const [twitterConnectionDate, setTwitterConnectionDate] = useState<string | null>(null);

	// Fetch Twitter credentials
	const fetchTwitterCredentials = async () => {
		if (!session) return;

		setIsTwitterLoading(true);
		try {
			const response = await axios.get('/api/user/twitter');
			const data = response.data;

			if (data.connected) {
				setTwitterConnected(true);
				setTwitterCredentials(data.twitter);
				setTwitterConnectionDate(new Date(data.twitter.connected_at).toLocaleDateString());
			} else {
				setTwitterConnected(false);
				setTwitterCredentials(null);
				setTwitterConnectionDate(null);
			}
		} catch (error) {
			console.error('Error fetching Twitter credentials:', error);
		} finally {
			setIsTwitterLoading(false);
		}
	};

	// Fetch user data from API
	useEffect(() => {
		const fetchUserData = async () => {
			if (!session) return;

			setIsLoading(true);
			try {
				const response = await axios.get('/api/user/profile');
				const userData = response.data;

				setName(userData.name || '');
				setEmail(userData.email || '');

				// Check if Twitter integration exists
				if (userData.integrations?.twitter) {
					setTwitterConnected(true);
				}

				// Fetch Twitter credentials
				await fetchTwitterCredentials();
			} catch (error) {
				console.error('Error fetching user data:', error);
				toast({
					title: 'Error',
					description: 'Failed to load your profile data. Please try again.',
					variant: 'destructive',
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [session, toast]);

	const handleProfileUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isSubmitting) return;
		setIsSubmitting(true);

		try {
			// Validate form data
			if (name.trim().length < 2) {
				throw new Error('Name must be at least 2 characters');
			}

			// Call API to update profile
			await axios.put('/api/user/profile', {
				name,
				email,
			});

			toast({
				title: 'Profile Updated',
				description: 'Your profile information has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating profile:', error);
			const axiosError = error as AxiosError<{ error: string }>;

			toast({
				title: 'Update Failed',
				description:
					axiosError.response?.data?.error ||
					(error instanceof Error ? error.message : 'Failed to update profile'),
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePasswordUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isSubmitting) return;

		// Validate passwords
		if (newPassword !== confirmPassword) {
			toast({
				title: "Passwords Don't Match",
				description: 'New password and confirm password must match.',
				variant: 'destructive',
			});
			return;
		}

		if (newPassword.length < 6) {
			toast({
				title: 'Password Too Short',
				description: 'Password must be at least 6 characters long.',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Call API to update password
			await axios.put('/api/user/password', {
				currentPassword,
				newPassword,
			});

			// Clear password fields
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');

			toast({
				title: 'Password Updated',
				description: 'Your password has been updated successfully.',
			});
		} catch (error) {
			console.error('Error updating password:', error);
			const axiosError = error as AxiosError<{ error: string }>;

			// Show appropriate error message
			let errorMessage = 'Failed to update password';
			if (axiosError.response?.status === 400) {
				errorMessage = axiosError.response?.data?.error || 'Current password is incorrect';
			}

			toast({
				title: 'Update Failed',
				description: errorMessage,
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleTwitterIntegration = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isSubmitting) return;
		setIsSubmitting(true);

		try {
			// Validate inputs
			if (!twitterAccessToken.trim() || !twitterAccessSecret.trim()) {
				throw new Error('Both Access Token and Access Secret are required');
			}

			// Call API to update Twitter credentials
			const response = await axios.put('/api/user/twitter', {
				accessToken: twitterAccessToken,
				accessSecret: twitterAccessSecret,
			});

			setTwitterConnected(true);

			// Update Twitter credentials display
			if (response.data.twitter) {
				setTwitterCredentials(response.data.twitter);
				setTwitterConnectionDate(new Date(response.data.twitter.connected_at).toLocaleDateString());
			}

			toast({
				title: 'Twitter Connected',
				description: 'Your Twitter account has been connected successfully.',
			});
		} catch (error) {
			console.error('Error connecting Twitter:', error);
			const axiosError = error as AxiosError<{ error: string }>;

			toast({
				title: 'Connection Failed',
				description:
					axiosError.response?.data?.error ||
					(error instanceof Error ? error.message : 'Failed to connect Twitter account'),
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDisconnectTwitter = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);

		try {
			// Call API to remove Twitter integration
			await axios.delete('/api/user/twitter');

			setTwitterConnected(false);
			setTwitterCredentials(null);
			setTwitterConnectionDate(null);

			// Don't clear the inputs to allow for easy reconnection

			toast({
				title: 'Twitter Disconnected',
				description: 'Your Twitter account has been disconnected successfully.',
			});
		} catch (error) {
			console.error('Error disconnecting Twitter:', error);
			toast({
				title: 'Disconnection Failed',
				description: 'Failed to disconnect Twitter account. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Header />
				<main className={`flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${animationClass}`}>
					<div className="max-w-4xl mx-auto flex justify-center items-center h-full">
						<div className="flex flex-col items-center">
							<Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
							<p className="mt-4 text-muted-foreground">Loading settings...</p>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className={`flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${animationClass}`}>
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold">Settings</h1>
						<p className="text-muted-foreground mt-1">
							Manage your account settings and set up external connections
						</p>
					</div>

					<Tabs defaultValue="profile" className="mb-8">
						<TabsList className="mb-6">
							<TabsTrigger value="profile" className="flex items-center gap-1">
								<User className="h-4 w-4" />
								<span>Profile</span>
							</TabsTrigger>
							<TabsTrigger value="integrations" className="flex items-center gap-1">
								<Settings className="h-4 w-4" />
								<span>Integrations</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="profile">
							<div className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle>Profile Information</CardTitle>
										<CardDescription>Update your account information</CardDescription>
									</CardHeader>
									<CardContent>
										<form onSubmit={handleProfileUpdate} className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="name">Name</Label>
												<Input
													id="name"
													value={name}
													onChange={e => setName(e.target.value)}
													placeholder="Your name"
													required
													disabled={isSubmitting}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="email">Email</Label>
												<Input
													id="email"
													type="email"
													value={email}
													onChange={e => setEmail(e.target.value)}
													placeholder="your.email@example.com"
													required
													disabled={isSubmitting}
												/>
											</div>
											<Button type="submit" disabled={isSubmitting}>
												{isSubmitting ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Updating...
													</>
												) : (
													'Update Profile'
												)}
											</Button>
										</form>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Change Password</CardTitle>
										<CardDescription>Update your password to maintain security</CardDescription>
									</CardHeader>
									<CardContent>
										<form onSubmit={handlePasswordUpdate} className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="current-password">Current Password</Label>
												<Input
													id="current-password"
													type="password"
													value={currentPassword}
													onChange={e => setCurrentPassword(e.target.value)}
													placeholder="••••••••"
													required
													disabled={isSubmitting}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="new-password">New Password</Label>
												<Input
													id="new-password"
													type="password"
													value={newPassword}
													onChange={e => setNewPassword(e.target.value)}
													placeholder="••••••••"
													required
													disabled={isSubmitting}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="confirm-password">Confirm New Password</Label>
												<Input
													id="confirm-password"
													type="password"
													value={confirmPassword}
													onChange={e => setConfirmPassword(e.target.value)}
													placeholder="••••••••"
													required
													disabled={isSubmitting}
												/>
											</div>
											<Button type="submit" disabled={isSubmitting}>
												{isSubmitting ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Updating...
													</>
												) : (
													'Update Password'
												)}
											</Button>
										</form>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="integrations">
							<div className="space-y-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Twitter className="h-5 w-5" />
											Twitter Integration
										</CardTitle>
										<CardDescription>Connect your Twitter account to post content</CardDescription>
									</CardHeader>
									<CardContent>
										{!twitterConnected && (
											<div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
												<div className="flex items-start">
													<AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
													<div>
														<h3 className="text-sm font-medium text-amber-800">
															Twitter Integration Required
														</h3>
														<p className="mt-1 text-sm text-amber-700">
															You need to connect your Twitter account to enable automatic
															posting. Without this integration, post scheduling won't
															work.
														</p>
													</div>
												</div>
											</div>
										)}

										{twitterConnected && (
											<div className="mb-6">
												<div className="p-4 rounded-md bg-green-50 border border-green-100 mb-4">
													<div className="flex justify-between items-start">
														<div className="flex items-start">
															<Info className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
															<div>
																<h3 className="text-sm font-medium text-green-800">
																	Twitter Connection Active
																</h3>
																<p className="mt-1 text-sm text-green-700">
																	Your Twitter account is connected and ready to post
																	content.
																	{twitterConnectionDate &&
																		` Connected on ${twitterConnectionDate}.`}
																</p>
															</div>
														</div>
														<Button
															variant="outline"
															size="sm"
															onClick={fetchTwitterCredentials}
															disabled={isTwitterLoading}
															className="h-8"
														>
															{isTwitterLoading ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<RefreshCw className="h-4 w-4" />
															)}
														</Button>
													</div>
												</div>

												<div className="flex justify-between items-center mb-4">
													<h3 className="text-base font-medium">Update Credentials</h3>
													<Button
														variant="destructive"
														size="sm"
														onClick={handleDisconnectTwitter}
														disabled={isSubmitting}
													>
														{isSubmitting ? (
															<>
																<Loader2 className="mr-1 h-3 w-3 animate-spin" />
																Disconnecting...
															</>
														) : (
															'Disconnect'
														)}
													</Button>
												</div>
											</div>
										)}

										<form onSubmit={handleTwitterIntegration} className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="twitter-access-token">Twitter Access Token</Label>
												<Input
													id="twitter-access-token"
													value={twitterAccessToken}
													onChange={e => setTwitterAccessToken(e.target.value)}
													placeholder="Enter your Twitter access token"
													required
													disabled={isSubmitting}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="twitter-access-secret">Twitter Access Secret</Label>
												<Input
													id="twitter-access-secret"
													value={twitterAccessSecret}
													onChange={e => setTwitterAccessSecret(e.target.value)}
													placeholder="Enter your Twitter access token secret"
													required
													disabled={isSubmitting}
												/>
											</div>
											<div>
												<Button type="submit" disabled={isSubmitting}>
													{isSubmitting ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															{twitterConnected ? 'Updating...' : 'Connecting...'}
														</>
													) : twitterConnected ? (
														'Update Twitter Credentials'
													) : (
														'Connect Twitter'
													)}
												</Button>
											</div>
										</form>

										<Separator className="my-6" />
										<div className="text-sm text-muted-foreground">
											<p className="mb-2">How to get your Twitter API credentials:</p>
											<ol className="list-decimal pl-4 space-y-1">
												<li>Go to the Twitter Developer Portal</li>
												<li>Create a new Project and App</li>
												<li>Navigate to Keys and Tokens section</li>
												<li>Generate Access Token and Secret</li>
											</ol>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	);
};

export default SettingsPage;
