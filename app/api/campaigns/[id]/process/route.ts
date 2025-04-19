import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { schedulerService } from '@/lib/services/scheduler';

// POST /api/campaigns/[id]/process - Process campaign and create scheduled posts
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const campaignId = params.id;

		// Check if campaign exists and belongs to the current user
		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const campaign = await prisma.campaign.findUnique({
			where: {
				id: campaignId,
				user_id: user.id,
			},
		});

		if (!campaign) {
			return NextResponse.json({ error: 'Campaign not found or does not belong to you' }, { status: 404 });
		}

		// Process the campaign to create scheduled posts
		await schedulerService.createScheduledPosts(campaignId);

		// Return updated campaign with posts count
		const updatedCampaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
			include: {
				posts: {
					select: {
						id: true,
						content: true,
						scheduled_for: true,
						status: true,
					},
					orderBy: {
						scheduled_for: 'asc',
					},
				},
			},
		});

		return NextResponse.json(updatedCampaign);
	} catch (error) {
		console.error('Error processing campaign:', error);
		return NextResponse.json({ error: 'Failed to process campaign' }, { status: 500 });
	}
}
