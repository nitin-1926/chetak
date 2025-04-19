import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/campaigns/[id] - Get a single campaign
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const campaignId = params.id;

		// Get the campaign with its posts
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
			include: {
				posts: {
					orderBy: { scheduled_for: 'asc' },
				},
			},
		});

		if (!campaign) {
			return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
		}

		// Check if the user owns the campaign
		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user || campaign.user_id !== user.id) {
			return NextResponse.json({ error: 'Not authorized to access this campaign' }, { status: 403 });
		}

		return NextResponse.json(campaign);
	} catch (error) {
		console.error('Error fetching campaign:', error);
		return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
	}
}

// PUT /api/campaigns/[id] - Update a campaign
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const campaignId = params.id;
		const campaignData = await req.json();

		// Check if the campaign exists
		const existingCampaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
		});

		if (!existingCampaign) {
			return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
		}

		// Check if the user owns the campaign
		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user || existingCampaign.user_id !== user.id) {
			return NextResponse.json({ error: 'Not authorized to update this campaign' }, { status: 403 });
		}

		// Update the campaign
		const updatedCampaign = await prisma.campaign.update({
			where: { id: campaignId },
			data: {
				title: campaignData.title,
				description: campaignData.description,
				status: campaignData.status,
				frequency: campaignData.frequency,
				start_date: campaignData.startDate ? new Date(campaignData.startDate) : undefined,
				start_time: campaignData.startTime,
				end_date: campaignData.endDate ? new Date(campaignData.endDate) : null,
				duration: campaignData.duration,
				timezone: campaignData.timezone,
				custom_days: campaignData.customDays,
				custom_times: campaignData.customTimes,
				interests: campaignData.interests,
				languages: campaignData.languages,
				locations: campaignData.locations,
				age_range: campaignData.ageRange,
				gender: campaignData.gender,
				content_template: campaignData.contentTemplate,
			},
		});

		return NextResponse.json(updatedCampaign);
	} catch (error) {
		console.error('Error updating campaign:', error);
		return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
	}
}

// DELETE /api/campaigns/[id] - Delete a campaign
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const campaignId = params.id;

		// Check if the campaign exists
		const existingCampaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
		});

		if (!existingCampaign) {
			return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
		}

		// Check if the user owns the campaign
		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user || existingCampaign.user_id !== user.id) {
			return NextResponse.json({ error: 'Not authorized to delete this campaign' }, { status: 403 });
		}

		// Delete all posts for this campaign first
		await prisma.post.deleteMany({
			where: { campaign_id: campaignId },
		});

		// Delete the campaign
		await prisma.campaign.delete({
			where: { id: campaignId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting campaign:', error);
		return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
	}
}
