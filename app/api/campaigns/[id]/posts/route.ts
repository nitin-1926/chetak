import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/campaigns/[id]/posts - Get all posts for a campaign
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const campaignId = params.id;

		// Check if the campaign exists
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
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

		// Get all posts for the campaign
		const posts = await prisma.post.findMany({
			where: { campaign_id: campaignId },
			orderBy: { scheduled_for: 'asc' },
		});

		return NextResponse.json(posts);
	} catch (error) {
		console.error('Error fetching posts:', error);
		return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
	}
}

// POST /api/campaigns/[id]/posts - Create a new post for a campaign
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const campaignId = params.id;

		// Check if the campaign exists
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
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

		// Parse request body
		const postData = await req.json();

		// Create post
		const post = await prisma.post.create({
			data: {
				content: postData.content,
				scheduled_for: new Date(postData.scheduledFor),
				status: postData.status || 'scheduled',
				platform_data: postData.platformData || {},
				campaign: {
					connect: {
						id: campaignId,
					},
				},
			},
		});

		// Update posts count in the campaign
		await prisma.campaign.update({
			where: { id: campaignId },
			data: {
				posts_count: {
					increment: 1,
				},
			},
		});

		return NextResponse.json(post, { status: 201 });
	} catch (error) {
		console.error('Error creating post:', error);
		return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
	}
}
