import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { schedulerService } from '@/lib/services/scheduler';

// POST /api/campaigns/[id]/schedule - Start a campaign scheduling
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

		// Set up the scheduler for this campaign
		await schedulerService.createScheduledPosts(campaignId);

		// Return updated campaign
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
		console.error('Error scheduling campaign:', error);
		return NextResponse.json({ error: 'Failed to schedule campaign' }, { status: 500 });
	}
}

// DELETE /api/campaigns/[id]/schedule - Stop a campaign scheduling
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

		// Stop the scheduler for this campaign
		await schedulerService.stopCampaign(campaignId);

		// Return updated campaign
		const updatedCampaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
		});

		return NextResponse.json(updatedCampaign);
	} catch (error) {
		console.error('Error stopping campaign schedule:', error);
		return NextResponse.json({ error: 'Failed to stop campaign schedule' }, { status: 500 });
	}
}
