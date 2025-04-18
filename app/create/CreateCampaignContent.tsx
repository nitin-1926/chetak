'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Edit2, FilePlus, Hash, Image, List, Settings, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import ThemeSelector, { Theme } from '@/components/ThemeSelector';
import ScheduleSelector, { ScheduleOption } from '@/components/ScheduleSelector';
import PreviewPost from '@/components/PreviewPost';
import { usePageTransition } from '@/utils/animations';

// Mock themes
const mockThemes: Theme[] = [
	{
		id: 'tech',
		name: 'Tech News',
		description: 'Latest updates, innovations, and insights from the tech world.',
		icon: <FilePlus />,
		popular: true,
	},
	{
		id: 'motivation',
		name: 'Motivational Quotes',
		description: 'Inspirational quotes and messages to motivate your audience.',
		icon: <Edit2 />,
		popular: true,
	},
	{
		id: 'business',
		name: 'Business Insights',
		description: 'Industry trends, analysis, and strategic business concepts.',
		icon: <List />,
	},
	{
		id: 'facts',
		name: 'Random Facts',
		description: 'Interesting and surprising facts about various topics.',
		icon: <Settings />,
	},
	{
		id: 'custom',
		name: 'Custom Theme',
		description: 'Define your own theme with specific topics and keywords.',
		icon: <Edit2 />,
	},
];

// Mock frequency options
const frequencyOptions: ScheduleOption[] = [
	{
		id: 'hourly',
		label: 'Hourly',
		value: '1h',
		description: 'Post content every hour (24 posts per day).',
	},
	{
		id: '6h',
		label: 'Every 6 Hours',
		value: '6h',
		description: '4 posts spread throughout the day.',
	},
	{
		id: '12h',
		label: 'Twice Daily',
		value: '12h',
		description: '2 posts per day, morning and evening.',
	},
	{
		id: 'daily',
		label: 'Daily',
		value: '24h',
		description: 'One post each day at the specified time.',
	},
];

// Mock preview posts
const mockPreviews = [
	'The future of AI is not about replacing humans, but enhancing human capabilities. Technology should serve us, not the other way around.',
	'Introducing our new app that simplifies task management. Boost your productivity with intuitive features and seamless integration.',
	"5G technology isn't just about faster downloads. It's the foundation for smart cities, autonomous vehicles, and the next wave of innovation.",
];

// Component content that uses useSearchParams
const CreateCampaignContent = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const { animationClass } = usePageTransition();

	// Form state
	const [activeTab, setActiveTab] = useState('theme');
	const [campaignName, setCampaignName] = useState('');
	const [campaignDescription, setCampaignDescription] = useState('');
	const [selectedTheme, setSelectedTheme] = useState('');
	const [customTheme, setCustomTheme] = useState('');
	const [selectedFrequency, setSelectedFrequency] = useState('daily');
	const [startDate, setStartDate] = useState<Date | undefined>(new Date());
	const [startTime, setStartTime] = useState('09:00');
	const [duration, setDuration] = useState('ongoing');
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [useImages, setUseImages] = useState(false);
	const [hashtags, setHashtags] = useState<string[]>([]);
	const [hashtagInput, setHashtagInput] = useState('');
	const [previewPosts, setPreviewPosts] = useState(mockPreviews);

	const isEditMode = searchParams.has('edit');

	// Prefill form when in edit mode
	useEffect(() => {
		if (isEditMode) {
			// In a real app, fetch campaign data based on ID
			setCampaignName('Daily Tech Tips');
			setCampaignDescription('Automated tech tips posted every day');
			setSelectedTheme('tech');
			setSelectedFrequency('daily');
			setStartDate(new Date('2023-09-01'));
			setStartTime('09:00');
			setDuration('30d');
			setUseImages(true);
			setHashtags(['tech', 'automation', 'tips']);
		}
	}, [isEditMode]);

	const handleNextTab = () => {
		if (activeTab === 'theme') {
			if (!selectedTheme) {
				toast({
					variant: 'destructive',
					title: 'Theme required',
					description: 'Please select a content theme to continue.',
				});
				return;
			}
			setActiveTab('schedule');
		} else if (activeTab === 'schedule') {
			if (!startDate) {
				toast({
					variant: 'destructive',
					title: 'Start date required',
					description: 'Please select a start date to continue.',
				});
				return;
			}
			setActiveTab('settings');
		} else if (activeTab === 'settings') {
			setActiveTab('preview');
		}
	};

	const handlePreviousTab = () => {
		if (activeTab === 'schedule') {
			setActiveTab('theme');
		} else if (activeTab === 'settings') {
			setActiveTab('schedule');
		} else if (activeTab === 'preview') {
			setActiveTab('settings');
		}
	};

	const handleAddHashtag = () => {
		if (hashtagInput && !hashtags.includes(hashtagInput) && hashtags.length < 3) {
			setHashtags([...hashtags, hashtagInput]);
			setHashtagInput('');
		} else if (hashtags.length >= 3) {
			toast({
				variant: 'destructive',
				title: 'Hashtag limit reached',
				description: 'You can only add up to 3 hashtags.',
			});
		}
	};

	const handleRemoveHashtag = (tag: string) => {
		setHashtags(hashtags.filter(t => t !== tag));
	};

	const handleUpdatePreview = (index: number, content: string) => {
		const updatedPreviews = [...previewPosts];
		updatedPreviews[index] = content;
		setPreviewPosts(updatedPreviews);
	};

	const handleCreateCampaign = () => {
		// In a real app, this would send the data to the server
		toast({
			title: isEditMode ? 'Campaign Updated' : 'Campaign Created',
			description: isEditMode
				? 'Your campaign has been updated successfully.'
				: 'Your new campaign has been created and scheduled.',
		});

		setTimeout(() => router.push('/dashboard'), 1000);
	};

	const isFormValid = () => {
		return campaignName && selectedTheme && (selectedTheme !== 'custom' || customTheme) && startDate;
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className={`flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${animationClass}`}>
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold">{isEditMode ? 'Edit Campaign' : 'Create New Campaign'}</h1>
						<p className="text-muted-foreground mt-1">
							{isEditMode
								? 'Update your existing campaign settings and content'
								: 'Set up an automated content posting campaign for X'}
						</p>
					</div>

					{/* Campaign Basic Info */}
					<Card className="mb-8">
						<CardContent className="p-6 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="campaign-name">Campaign Name</Label>
								<Input
									id="campaign-name"
									placeholder="e.g., Daily Tech Tips"
									value={campaignName}
									onChange={e => setCampaignName(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="campaign-description">Description (Optional)</Label>
								<Input
									id="campaign-description"
									placeholder="Brief description of this campaign"
									value={campaignDescription}
									onChange={e => setCampaignDescription(e.target.value)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Setup Tabs */}
					<Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
						<TabsList className="grid grid-cols-4 mb-8">
							<TabsTrigger value="theme" className="flex items-center gap-1">
								<List className="h-4 w-4" />
								<span className="hidden sm:inline">Theme</span>
							</TabsTrigger>
							<TabsTrigger value="schedule" className="flex items-center gap-1">
								<Calendar className="h-4 w-4" />
								<span className="hidden sm:inline">Schedule</span>
							</TabsTrigger>
							<TabsTrigger value="settings" className="flex items-center gap-1">
								<Settings className="h-4 w-4" />
								<span className="hidden sm:inline">Settings</span>
							</TabsTrigger>
							<TabsTrigger value="preview" className="flex items-center gap-1">
								<Image className="h-4 w-4" />
								<span className="hidden sm:inline">Preview</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="theme" className="mt-0">
							<div className="space-y-6">
								<h2 className="text-2xl font-semibold">Select Content Theme</h2>
								<p className="text-muted-foreground">
									Choose a theme for your automated content. This will determine the type of posts
									that will be generated.
								</p>

								<ThemeSelector
									themes={mockThemes}
									selectedThemeId={selectedTheme}
									onSelectTheme={setSelectedTheme}
								/>

								{selectedTheme === 'custom' && (
									<div className="mt-6 space-y-3">
										<Label htmlFor="custom-theme">Custom Theme Details</Label>
										<Input
											id="custom-theme"
											placeholder="Describe your custom theme (e.g., Cryptocurrency trends and updates)"
											value={customTheme}
											onChange={e => setCustomTheme(e.target.value)}
										/>
									</div>
								)}
							</div>

							<div className="mt-8 flex justify-end">
								<Button onClick={handleNextTab}>Continue</Button>
							</div>
						</TabsContent>

						<TabsContent value="schedule" className="mt-0">
							<div className="space-y-6">
								<h2 className="text-2xl font-semibold">Set Posting Schedule</h2>
								<p className="text-muted-foreground">
									Configure when and how often your content will be posted to X.
								</p>

								<ScheduleSelector
									frequencyOptions={frequencyOptions}
									selectedFrequency={selectedFrequency}
									onSelectFrequency={setSelectedFrequency}
									startDate={startDate}
									onSelectStartDate={setStartDate}
									startTime={startTime}
									onSelectStartTime={setStartTime}
									endDate={endDate}
									onSelectEndDate={setEndDate}
									duration={duration}
									onSelectDuration={setDuration}
								/>
							</div>

							<div className="mt-8 flex justify-between">
								<Button variant="outline" onClick={handlePreviousTab}>
									Back
								</Button>
								<Button onClick={handleNextTab}>Continue</Button>
							</div>
						</TabsContent>

						<TabsContent value="settings" className="mt-0">
							<div className="space-y-6">
								<h2 className="text-2xl font-semibold">Additional Settings</h2>
								<p className="text-muted-foreground">
									Customize your campaign with additional options.
								</p>

								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-medium mb-4">Media Settings</h3>
										<div className="flex items-center space-x-2">
											<Switch
												id="use-images"
												checked={useImages}
												onCheckedChange={setUseImages}
											/>
											<Label htmlFor="use-images">Generate AI images for posts</Label>
										</div>
										<p className="text-sm text-muted-foreground mt-1 ml-6">
											AI will create relevant images to accompany your posts
										</p>
									</div>

									<Separator />

									<div>
										<h3 className="text-lg font-medium mb-4">Hashtags</h3>
										<p className="text-sm text-muted-foreground mb-4">
											Add up to 3 hashtags to include with each post (optional)
										</p>

										<div className="flex space-x-2 mb-4">
											<div className="relative flex-grow">
												<Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													placeholder="Enter hashtag"
													value={hashtagInput}
													onChange={e => setHashtagInput(e.target.value.replace(/\s+/g, ''))}
													className="pl-10"
													onKeyDown={e => {
														if (e.key === 'Enter') {
															e.preventDefault();
															handleAddHashtag();
														}
													}}
												/>
											</div>
											<Button
												type="button"
												onClick={handleAddHashtag}
												disabled={
													!hashtagInput ||
													hashtags.includes(hashtagInput) ||
													hashtags.length >= 3
												}
											>
												Add
											</Button>
										</div>

										<div className="flex flex-wrap gap-2">
											{hashtags.map(tag => (
												<Badge
													key={tag}
													variant="secondary"
													className="p-1 pl-3 hover:bg-secondary/80 cursor-pointer"
													onClick={() => handleRemoveHashtag(tag)}
												>
													#{tag}
													<Button
														variant="ghost"
														className="h-auto p-1 ml-1 hover:bg-transparent"
														onClick={e => {
															e.stopPropagation();
															handleRemoveHashtag(tag);
														}}
													>
														<X className="h-3 w-3" />
														<span className="sr-only">Remove</span>
													</Button>
												</Badge>
											))}
										</div>
									</div>
								</div>
							</div>

							<div className="mt-8 flex justify-between">
								<Button variant="outline" onClick={handlePreviousTab}>
									Back
								</Button>
								<Button onClick={handleNextTab}>Continue</Button>
							</div>
						</TabsContent>

						<TabsContent value="preview" className="mt-0">
							<div className="space-y-6">
								<h2 className="text-2xl font-semibold">Preview Generated Content</h2>
								<p className="text-muted-foreground">
									Review and edit sample posts that will be published on your behalf.
								</p>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
									{previewPosts.map((post, index) => (
										<PreviewPost
											key={index}
											content={post}
											hashtags={hashtags}
											hasImage={useImages}
											onContentChange={content => handleUpdatePreview(index, content)}
											previewIndex={index}
											totalPreviews={previewPosts.length}
										/>
									))}
								</div>

								<div className="bg-muted/40 rounded-lg p-4 mt-4">
									<p className="text-sm text-muted-foreground">
										These are sample posts. Once your campaign is active, AI will generate unique
										content matching your selected theme.
									</p>
								</div>
							</div>

							<div className="mt-8 flex justify-between">
								<Button variant="outline" onClick={handlePreviousTab}>
									Back
								</Button>
								<Button disabled={!isFormValid()} onClick={handleCreateCampaign}>
									{isEditMode ? 'Update Campaign' : 'Create Campaign'}
								</Button>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	);
};

export default CreateCampaignContent;
