import { prisma } from '@/lib/db';
import { contentGeneratorService } from './contentGenerator';
import { twitterService } from './twitter';
import { addDays, addWeeks, addMonths, format, isBefore, setHours, setMinutes } from 'date-fns';
import cron from 'node-cron';

// Define enums to match Prisma schema
enum CampaignStatus {
	draft = 'draft',
	active = 'active',
	paused = 'paused',
	completed = 'completed',
}

enum PostStatus {
	scheduled = 'scheduled',
	processing = 'processing',
	published = 'published',
	failed = 'failed',
}

interface ScheduleOptions {
	frequency: string;
	startDate: Date;
	startTime: string;
	endDate?: Date;
	timezone: string;
	customDays?: string[];
	customTimes?: string[];
}

export class SchedulerService {
	private activeCronJobs: Map<string, cron.ScheduledTask> = new Map();

	constructor() {
		// Initialize the main cron job that processes scheduled posts
		this.initializeScheduler();
	}

	/**
	 * Initialize the main scheduler that runs every minute
	 * to check for posts that need to be published
	 */
	private initializeScheduler(): void {
		// Run every minute to check for scheduled posts
		console.log('[Scheduler] Initializing main scheduler to run every minute');
		const task = cron.schedule('* * * * *', async () => {
			console.log('[Scheduler] Main scheduler tick at', new Date().toISOString());
			await this.processScheduledPosts();
		});

		this.activeCronJobs.set('main-scheduler', task);
		console.log('[Scheduler] Main scheduler initialized successfully');
	}

	/**
	 * Generate scheduled dates based on the provided options
	 */
	public generateScheduledDates(options: ScheduleOptions): Date[] {
		const { frequency, startDate, startTime, endDate, customDays = [], customTimes = [] } = options;

		const result: Date[] = [];
		const [hours, minutes] = startTime.split(':').map(Number);

		// Start with the provided start date and time
		let currentDate = new Date(startDate);
		currentDate = setHours(setMinutes(currentDate, minutes), hours);

		// Function to check if a date is valid according to customDays (if provided)
		const isValidDay = (date: Date): boolean => {
			if (customDays.length === 0) return true;
			const dayOfWeek = format(date, 'EEEE').toLowerCase();
			return customDays.includes(dayOfWeek);
		};

		// Handle custom times
		const times = customTimes.length > 0 ? customTimes : [startTime];

		switch (frequency.toLowerCase()) {
			case 'daily':
				while (!endDate || isBefore(currentDate, endDate)) {
					if (isValidDay(currentDate)) {
						for (const time of times) {
							const [h, m] = time.split(':').map(Number);
							const scheduledDate = new Date(currentDate);
							scheduledDate.setHours(h, m, 0, 0);
							result.push(scheduledDate);
						}
					}
					currentDate = addDays(currentDate, 1);
				}
				break;

			case 'weekly':
				while (!endDate || isBefore(currentDate, endDate)) {
					if (isValidDay(currentDate)) {
						for (const time of times) {
							const [h, m] = time.split(':').map(Number);
							const scheduledDate = new Date(currentDate);
							scheduledDate.setHours(h, m, 0, 0);
							result.push(scheduledDate);
						}
					}
					currentDate = addWeeks(currentDate, 1);
				}
				break;

			case 'monthly':
				while (!endDate || isBefore(currentDate, endDate)) {
					if (isValidDay(currentDate)) {
						for (const time of times) {
							const [h, m] = time.split(':').map(Number);
							const scheduledDate = new Date(currentDate);
							scheduledDate.setHours(h, m, 0, 0);
							result.push(scheduledDate);
						}
					}
					currentDate = addMonths(currentDate, 1);
				}
				break;

			case 'custom':
				// For custom schedules, we need both custom days and times
				if (customDays.length > 0 && customTimes.length > 0) {
					let tempDate = new Date(currentDate);

					while (!endDate || isBefore(tempDate, endDate)) {
						const dayOfWeek = format(tempDate, 'EEEE').toLowerCase();

						if (customDays.includes(dayOfWeek)) {
							for (const time of customTimes) {
								const [h, m] = time.split(':').map(Number);
								const scheduledDate = new Date(tempDate);
								scheduledDate.setHours(h, m, 0, 0);

								if (!endDate || isBefore(scheduledDate, endDate)) {
									result.push(scheduledDate);
								}
							}
						}

						tempDate = addDays(tempDate, 1);
					}
				}
				break;
		}

		return result;
	}

	/**
	 * Create scheduled posts for a campaign
	 */
	public async createScheduledPosts(campaignId: string): Promise<void> {
		console.log(`[Scheduler] Starting to create scheduled posts for campaign ${campaignId}`);
		// Fetch campaign details
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
			include: {
				user: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!campaign) {
			console.error(`[Scheduler] Campaign with ID ${campaignId} not found`);
			throw new Error(`Campaign with ID ${campaignId} not found`);
		}

		console.log(`[Scheduler] Found campaign ${campaignId}: ${campaign.title}`);

		// Update campaign to active
		await prisma.campaign.update({
			where: { id: campaignId },
			data: {
				status: CampaignStatus.active as string,
			},
		});
		console.log(`[Scheduler] Updated campaign ${campaignId} status to active`);

		// Create a unique identifier for this campaign's scheduler
		const cronJobId = `campaign-${campaignId}`;

		// If a cron job already exists for this campaign, stop it first
		if (this.activeCronJobs.has(cronJobId)) {
			console.log(`[Scheduler] Stopping existing cron job for campaign ${campaignId}`);
			this.activeCronJobs.get(cronJobId)?.stop();
			this.activeCronJobs.delete(cronJobId);
		}

		// Convert the campaign schedule to a cron expression
		const cronExpression = this.campaignScheduleToCronExpression(campaign);

		if (!cronExpression) {
			console.error(`[Scheduler] Could not determine cron schedule for campaign ${campaignId}`);
			throw new Error('Could not determine cron schedule for campaign');
		}

		console.log(`[Scheduler] Setting up cron job for campaign ${campaignId} with schedule: ${cronExpression}`);

		// Set up the cron job for this campaign
		const task = cron.schedule(
			cronExpression,
			async () => {
				console.log(`[Scheduler] Cron triggered for campaign ${campaignId} at ${new Date().toISOString()}`);

				// Only proceed if the campaign is still active
				const currentCampaign = await prisma.campaign.findUnique({
					where: { id: campaignId },
				});

				if (!currentCampaign) {
					console.log(`[Scheduler] Campaign ${campaignId} no longer exists, skipping`);
					return;
				}

				if (currentCampaign.status !== CampaignStatus.active) {
					console.log(
						`[Scheduler] Campaign ${campaignId} is not active (status: ${currentCampaign.status}), skipping`,
					);
					return;
				}

				console.log(`[Scheduler] Generating and posting content for campaign ${campaignId}`);
				try {
					// Generate and post content immediately for this campaign
					await this.generateAndPostForCampaign(campaignId);
				} catch (error) {
					console.error(`[Scheduler] Error in cron job for campaign ${campaignId}:`, error);
				}
			},
			{
				timezone: campaign.timezone,
			},
		);

		// Start the task immediately
		task.start();

		// Store the task in our map
		this.activeCronJobs.set(cronJobId, task);
		console.log(`[Scheduler] Successfully scheduled job for campaign ${campaignId}`);

		// If this is an "every_2_minutes" campaign, trigger the first post immediately
		if (campaign.frequency === 'every_2_minutes' || campaign.frequency === 'every_minute') {
			console.log(`[Scheduler] Triggering immediate post for ${campaign.frequency} campaign ${campaignId}`);
			// Add a small delay to ensure the campaign is properly set up
			setTimeout(() => {
				this.generateAndPostForCampaign(campaignId).catch(err => {
					console.error(`[Scheduler] Error triggering immediate post for campaign ${campaignId}:`, err);
				});
			}, 2000);
		}
	}

	/**
	 * Convert campaign schedule to cron expression
	 */
	private campaignScheduleToCronExpression(campaign: any): string | null {
		console.log(
			`[Scheduler] Generating cron expression for campaign ${campaign.id} with frequency ${campaign.frequency}`,
		);
		const { frequency, start_time, custom_days, custom_times } = campaign;

		// Extract hours and minutes from start_time
		const [hours, minutes] = start_time.split(':').map(Number);

		switch (frequency.toLowerCase()) {
			case 'every_minute':
				console.log(`[Scheduler] Using every minute schedule: * * * * *`);
				return '* * * * *';

			case 'every_2_minutes':
				console.log(`[Scheduler] Using every 2 minutes schedule: */2 * * * *`);
				return '*/2 * * * *';

			case 'daily':
				const dailyCron = `${minutes} ${hours} * * *`;
				console.log(`[Scheduler] Using daily schedule: ${dailyCron}`);
				return dailyCron;

			case 'weekly':
				// If custom days are specified, use them
				if (custom_days && custom_days.length > 0) {
					// Convert day names to cron day numbers (0-6, where 0 is Sunday)
					const dayMap: Record<string, number> = {
						sunday: 0,
						monday: 1,
						tuesday: 2,
						wednesday: 3,
						thursday: 4,
						friday: 5,
						saturday: 6,
					};

					const cronDays = custom_days
						.map(day => dayMap[day.toLowerCase()])
						.filter(day => day !== undefined)
						.join(',');

					const weeklyCron = `${minutes} ${hours} * * ${cronDays}`;
					console.log(`[Scheduler] Using weekly schedule with custom days: ${weeklyCron}`);
					return weeklyCron;
				}

				// Default to Monday if no custom days
				const defaultWeeklyCron = `${minutes} ${hours} * * 1`;
				console.log(`[Scheduler] Using default weekly schedule: ${defaultWeeklyCron}`);
				return defaultWeeklyCron;

			case 'monthly':
				// For monthly, use the day of month from start_date
				const dayOfMonth = new Date(campaign.start_date).getDate();
				const monthlyCron = `${minutes} ${hours} ${dayOfMonth} * *`;
				console.log(`[Scheduler] Using monthly schedule: ${monthlyCron}`);
				return monthlyCron;

			case 'custom':
				// For custom schedules with multiple times per day
				if (custom_times && custom_times.length > 0 && custom_days && custom_days.length > 0) {
					// Handle custom days
					const dayMap: Record<string, number> = {
						sunday: 0,
						monday: 1,
						tuesday: 2,
						wednesday: 3,
						thursday: 4,
						friday: 5,
						saturday: 6,
					};

					const cronDays = custom_days
						.map(day => dayMap[day.toLowerCase()])
						.filter(day => day !== undefined)
						.join(',');

					// For custom times, we need to create multiple cron jobs
					// For simplicity, just use the first time in the custom_times array
					const [firstTime] = custom_times;
					const [customHours, customMinutes] = firstTime.split(':').map(Number);

					const customCron = `${customMinutes} ${customHours} * * ${cronDays}`;
					console.log(`[Scheduler] Using custom schedule: ${customCron}`);
					return customCron;
				}
				console.log(`[Scheduler] Could not create custom schedule, missing required fields`);
				return null;

			default:
				console.log(`[Scheduler] Unknown frequency: ${frequency}`);
				return null;
		}
	}

	/**
	 * Helper function to get Twitter credentials from the database and decrypt them
	 */
	private async getUserTwitterCredentials(userId: string): Promise<{
		consumerKey: string;
		consumerSecret: string;
		accessToken: string;
		accessSecret: string;
	} | null> {
		console.log(`[Scheduler] Getting Twitter credentials for user ${userId}`);
		// Import decrypt function here to avoid circular dependencies
		const { decrypt } = await import('@/lib/crypto');

		try {
			// Get user with integrations
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { integrations: true },
			});

			if (!user) {
				console.log(`[Scheduler] User ${userId} not found`);
				return null;
			}

			if (!user.integrations) {
				console.log(`[Scheduler] User ${userId} has no integrations`);
				return null;
			}

			// Parse integrations JSON if needed
			const integrations =
				typeof user.integrations === 'string' ? JSON.parse(user.integrations as string) : user.integrations;

			const twitterIntegration = integrations?.twitter;

			if (!twitterIntegration) {
				console.log(`[Scheduler] User ${userId} has no Twitter integration`);
				return null;
			}

			if (
				!twitterIntegration.api_key ||
				!twitterIntegration.api_secret ||
				!twitterIntegration.access_token ||
				!twitterIntegration.access_token_secret
			) {
				console.log(`[Scheduler] User ${userId} has incomplete Twitter credentials`);
				return null;
			}

			// Decrypt credentials
			try {
				const credentials = {
					consumerKey: decrypt(twitterIntegration.api_key),
					consumerSecret: decrypt(twitterIntegration.api_secret),
					accessToken: decrypt(twitterIntegration.access_token),
					accessSecret: decrypt(twitterIntegration.access_token_secret),
				};
				console.log(`[Scheduler] Successfully retrieved Twitter credentials for user ${userId}`);
				return credentials;
			} catch (error) {
				console.error(`[Scheduler] Error decrypting Twitter credentials: ${error}`);
				return null;
			}
		} catch (error) {
			console.error(`[Scheduler] Error getting Twitter credentials for user ${userId}:`, error);
			return null;
		}
	}

	/**
	 * Generate content and post for a campaign
	 */
	private async generateAndPostForCampaign(campaignId: string): Promise<void> {
		try {
			console.log(`[Scheduler] Starting content generation for campaign ${campaignId}`);

			// Fetch campaign details
			const campaign = await prisma.campaign.findUnique({
				where: { id: campaignId },
				include: {
					user: {
						select: {
							id: true,
						},
					},
				},
			});

			if (!campaign) {
				console.error(`[Scheduler] Campaign ${campaignId} not found`);
				throw new Error(`Campaign with ID ${campaignId} not found`);
			}

			console.log(`[Scheduler] Found campaign ${campaignId} owned by user ${campaign.user.id}`);

			// Get Twitter credentials directly from the database
			const twitterCredentials = await this.getUserTwitterCredentials(campaign.user.id);

			if (!twitterCredentials) {
				console.error(`[Scheduler] Missing Twitter credentials for user ${campaign.user.id}`);
				throw new Error('User does not have complete Twitter credentials set up');
			}

			console.log(`[Scheduler] Retrieved Twitter credentials for campaign ${campaignId}`);

			// Prepare content generation parameters
			const contentParams = {
				theme: campaign.title,
				interests: campaign.interests || [],
				languages: campaign.languages || [],
				locations: campaign.locations || [],
				ageRange: campaign.age_range || undefined,
				gender: campaign.gender || [],
				maxLength: 280, // Twitter character limit
				contentTemplate: campaign.content_template,
			};

			console.log(`[Scheduler] Generating content based on theme "${campaign.title}" for campaign ${campaignId}`);

			// Generate content in real-time (or use test content for testing)
			let content;
			try {
				content = await contentGeneratorService.generateContent(contentParams);
				console.log(`[Scheduler] Content generated successfully for campaign ${campaignId}`);
			} catch (genError) {
				console.error(`[Scheduler] Error generating content, falling back to content template:`, genError);
				// Fallback to content template if content generation fails
				content =
					campaign.content_template || `Post from campaign ${campaign.title} at ${new Date().toISOString()}`;
				console.log(`[Scheduler] Using fallback content for campaign ${campaignId}`);
			}

			console.log(`[Scheduler] Generated content for campaign ${campaignId}: "${content.substring(0, 30)}..."`);

			// Create the post record
			console.log(`[Scheduler] Creating post record in database for campaign ${campaignId}`);
			const post = await prisma.post.create({
				data: {
					content,
					scheduled_for: new Date(),
					status: PostStatus.processing as string,
					campaign_id: campaignId,
				},
			});

			console.log(`[Scheduler] Created post ${post.id} for campaign ${campaignId}`);

			// Initialize Twitter client with user credentials from database
			console.log(`[Scheduler] Initializing Twitter client for posting`);
			twitterService.initialize(
				twitterCredentials.consumerKey,
				twitterCredentials.consumerSecret,
				twitterCredentials.accessToken,
				twitterCredentials.accessSecret,
			);

			// Post to Twitter
			console.log(`[Scheduler] Posting to Twitter for campaign ${campaignId}`);
			try {
				const response = await twitterService.postTweet(content);
				console.log(`[Scheduler] Successfully posted to Twitter for campaign ${campaignId}: `, response);

				// Update post as published
				await prisma.post.update({
					where: { id: post.id },
					data: {
						status: PostStatus.published as string,
						platform_data: response,
					},
				});

				console.log(`[Scheduler] Updated post ${post.id} status to published`);

				// Update campaign posts count
				await prisma.campaign.update({
					where: { id: campaignId },
					data: {
						posts_count: {
							increment: 1,
						},
					},
				});

				console.log(`[Scheduler] Incremented post count for campaign ${campaignId}`);
				console.log(`[Scheduler] Successfully completed posting process for campaign ${campaignId}`);
			} catch (twitterError) {
				console.error(`[Scheduler] Error posting to Twitter: `, twitterError);

				// Update post as failed
				await prisma.post.update({
					where: { id: post.id },
					data: {
						status: PostStatus.failed as string,
						error: twitterError instanceof Error ? twitterError.message : String(twitterError),
					},
				});

				console.error(`[Scheduler] Updated post ${post.id} status to failed`);
				throw twitterError; // Rethrow to be caught by the outer catch block
			}
		} catch (error) {
			console.error(`[Scheduler] Error in generateAndPostForCampaign for campaign ${campaignId}:`, error);

			// Create a failed post record if one wasn't created yet
			try {
				await prisma.post.create({
					data: {
						content: 'Content generation failed',
						scheduled_for: new Date(),
						status: PostStatus.failed as string,
						campaign_id: campaignId,
						error: error instanceof Error ? error.message : String(error),
					},
				});
				console.log(`[Scheduler] Created failed post record for campaign ${campaignId}`);
			} catch (postError) {
				console.error(`[Scheduler] Error creating failed post record:`, postError);
			}
		}
	}

	/**
	 * Stop a campaign's scheduled job
	 */
	public async stopCampaign(campaignId: string): Promise<void> {
		const cronJobId = `campaign-${campaignId}`;

		if (this.activeCronJobs.has(cronJobId)) {
			this.activeCronJobs.get(cronJobId)?.stop();
			this.activeCronJobs.delete(cronJobId);

			// Update campaign status
			await prisma.campaign.update({
				where: { id: campaignId },
				data: {
					status: CampaignStatus.paused as string,
				},
			});

			console.log(`Stopped scheduler for campaign ${campaignId}`);
		}
	}

	/**
	 * Process scheduled posts that are due to be published
	 * This method is kept for compatibility but will not be used anymore
	 */
	public async processScheduledPosts(): Promise<void> {
		console.log('[Scheduler] processScheduledPosts called, but all posts are now generated directly');
		// No longer process scheduled posts from the database
		// All posts are generated in real-time
	}

	/**
	 * Check if a campaign is using direct content generation (every_2_minutes frequency)
	 */
	public isDirectGenerationCampaign(campaign: any): boolean {
		return campaign && campaign.frequency === 'every_2_minutes';
	}
}

// Create a singleton instance
export const schedulerService = new SchedulerService();

export default schedulerService;
