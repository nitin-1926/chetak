'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/Header';
import { usePageTransition } from '@/utils/animations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const accountFormSchema = z.object({
	name: z.string().min(2, {
		message: 'Name must be at least 2 characters.',
	}),
	email: z.string().email({
		message: 'Please enter a valid email address.',
	}),
});

const notificationsFormSchema = z.object({
	emailNotifications: z.boolean().default(true),
	marketingEmails: z.boolean().default(false),
	newCampaignResults: z.boolean().default(true),
	accountAlerts: z.boolean().default(true),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

const SettingsPage = () => {
	const { animationClass } = usePageTransition();
	const [avatar, setAvatar] = useState('/avatars/placeholder.png');

	// Account form
	const accountForm = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: {
			name: 'Jane Smith',
			email: 'jane.smith@example.com',
		},
	});

	// Notifications form
	const notificationsForm = useForm<NotificationsFormValues>({
		resolver: zodResolver(notificationsFormSchema),
		defaultValues: {
			emailNotifications: true,
			marketingEmails: false,
			newCampaignResults: true,
			accountAlerts: true,
		},
	});

	function onAccountSubmit(data: AccountFormValues) {
		toast.success('Account settings updated');
		console.log(data);
	}

	function onNotificationsSubmit(data: NotificationsFormValues) {
		toast.success('Notification preferences updated');
		console.log(data);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className={`flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${animationClass}`}>
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold">Settings</h1>
						<p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
					</div>

					<Tabs defaultValue="account" className="mb-8">
						<TabsList className="mb-4">
							<TabsTrigger value="account">Account</TabsTrigger>
							<TabsTrigger value="notifications">Notifications</TabsTrigger>
						</TabsList>

						<TabsContent value="account">
							<Card>
								<CardHeader>
									<CardTitle>Account Information</CardTitle>
									<CardDescription>
										Update your account details and personal information
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center mb-6">
										<Avatar className="w-16 h-16 mr-4">
											<AvatarImage src={avatar} alt="Avatar" />
											<AvatarFallback>JS</AvatarFallback>
										</Avatar>
										<Button variant="outline" size="sm">
											Change Avatar
										</Button>
									</div>

									<Form {...accountForm}>
										<form
											onSubmit={accountForm.handleSubmit(onAccountSubmit)}
											className="space-y-6"
										>
											<FormField
												control={accountForm.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Name</FormLabel>
														<FormControl>
															<Input placeholder="Your name" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={accountForm.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email</FormLabel>
														<FormControl>
															<Input placeholder="Your email" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<Separator className="my-6" />

											<div className="flex flex-col space-y-4">
												<div>
													<h3 className="text-lg font-medium">Connected Accounts</h3>
													<p className="text-sm text-muted-foreground">
														Manage your connected social media accounts
													</p>
												</div>

												<div className="flex items-center justify-between py-2">
													<div className="flex items-center">
														<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
															<svg
																xmlns="http://www.w3.org/2000/svg"
																width="20"
																height="20"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
															</svg>
														</div>
														<div>
															<p className="font-medium">X (Twitter)</p>
															<p className="text-sm text-muted-foreground">@janesmith</p>
														</div>
													</div>
													<Button variant="outline" size="sm">
														Disconnect
													</Button>
												</div>
											</div>

											<div className="flex justify-end">
												<Button type="submit">Save Changes</Button>
											</div>
										</form>
									</Form>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="notifications">
							<Card>
								<CardHeader>
									<CardTitle>Notification Preferences</CardTitle>
									<CardDescription>Customize how and when you receive notifications</CardDescription>
								</CardHeader>
								<CardContent>
									<Form {...notificationsForm}>
										<form
											onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
											className="space-y-6"
										>
											<FormField
												control={notificationsForm.control}
												name="emailNotifications"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
														<div className="space-y-0.5">
															<FormLabel className="text-base">
																Email Notifications
															</FormLabel>
															<FormDescription>
																Receive emails for important updates and notifications
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={notificationsForm.control}
												name="marketingEmails"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
														<div className="space-y-0.5">
															<FormLabel className="text-base">
																Marketing Emails
															</FormLabel>
															<FormDescription>
																Receive emails about new features and promotions
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={notificationsForm.control}
												name="newCampaignResults"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
														<div className="space-y-0.5">
															<FormLabel className="text-base">
																Campaign Results
															</FormLabel>
															<FormDescription>
																Get notified about your campaign performance and metrics
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={notificationsForm.control}
												name="accountAlerts"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between p-3 rounded-lg border">
														<div className="space-y-0.5">
															<FormLabel className="text-base">Account Alerts</FormLabel>
															<FormDescription>
																Receive security and account-related notifications
															</FormDescription>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={field.onChange}
															/>
														</FormControl>
													</FormItem>
												)}
											/>

											<div className="flex justify-end">
												<Button type="submit">Save Preferences</Button>
											</div>
										</form>
									</Form>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	);
};

export default SettingsPage;
