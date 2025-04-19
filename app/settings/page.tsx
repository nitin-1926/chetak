'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { usePageTransition } from '@/utils/animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SettingsPage = () => {
	const { animationClass } = usePageTransition();
	const { toast } = useToast();
	const [avatar, setAvatar] = useState('/avatars/placeholder.png');

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

	useEffect(() => {
		// Mock fetch user data
		// In a real app, you would fetch from your API
		setTimeout(() => {
			setName('John Doe');
			setEmail('john.doe@example.com');
		}, 500);
	}, []);

	const handleProfileUpdate = e => {
		e.preventDefault();

		// Here you would call your API to update the profile
		toast({
			title: 'Profile Updated',
			description: 'Your profile information has been updated successfully.',
		});
	};

	const handlePasswordUpdate = e => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast({
				title: "Passwords Don't Match",
				description: 'New password and confirm password must match.',
				variant: 'destructive',
			});
			return;
		}

		// Here you would call your API to update the password
		setCurrentPassword('');
		setNewPassword('');
		setConfirmPassword('');

		toast({
			title: 'Password Updated',
			description: 'Your password has been updated successfully.',
		});
	};

	const handleTwitterIntegration = e => {
		e.preventDefault();

		// Here you would validate and save Twitter credentials
		setTwitterConnected(true);

		toast({
			title: 'Twitter Connected',
			description: 'Your Twitter account has been connected successfully.',
		});
	};

	const handleDisconnectTwitter = () => {
		setTwitterConnected(false);
		setTwitterAccessToken('');
		setTwitterAccessSecret('');

		toast({
			title: 'Twitter Disconnected',
			description: 'Your Twitter account has been disconnected successfully.',
		});
	};

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
												/>
											</div>
											<Button type="submit">Update Profile</Button>
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
												/>
											</div>
											<Button type="submit">Update Password</Button>
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
										{twitterConnected ? (
											<div className="space-y-4">
												<div className="p-4 rounded-md bg-muted flex items-center justify-between">
													<div>
														<p className="font-medium">Twitter Connected</p>
														<p className="text-sm text-muted-foreground">
															Your Twitter account is connected
														</p>
													</div>
													<Button variant="destructive" onClick={handleDisconnectTwitter}>
														Disconnect
													</Button>
												</div>
											</div>
										) : (
											<form onSubmit={handleTwitterIntegration} className="space-y-4">
												<div className="space-y-2">
													<Label htmlFor="twitter-access-token">Twitter Access Token</Label>
													<Input
														id="twitter-access-token"
														value={twitterAccessToken}
														onChange={e => setTwitterAccessToken(e.target.value)}
														placeholder="Enter your Twitter access token"
														required
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
													/>
												</div>
												<div>
													<Button type="submit">Connect Twitter</Button>
												</div>
											</form>
										)}
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
