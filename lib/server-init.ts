import { prisma } from '@/lib/db';
import { schedulerService } from '@/lib/services/scheduler';

/**
 * Initialize active campaigns when the server starts
 */
export async function initServer() {
	try {
		console.log('Initializing server and loading active campaigns...');

		// Find all active campaigns
		const activeCampaigns = await prisma.campaign.findMany({
			where: {
				status: 'active',
			},
		});

		console.log(`Found ${activeCampaigns.length} active campaigns`);

		// Initialize schedulers for each active campaign
		for (const campaign of activeCampaigns) {
			try {
				await schedulerService.createScheduledPosts(campaign.id);
				console.log(`Initialized scheduler for campaign ${campaign.id}`);
			} catch (error) {
				console.error(`Failed to initialize scheduler for campaign ${campaign.id}:`, error);
			}
		}

		console.log('Server initialization complete');
	} catch (error) {
		console.error('Error initializing server:', error);
	}
}
