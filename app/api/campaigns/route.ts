import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/campaigns - Get all campaigns for the current user
export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user ID from the session
		const userEmail = session.user.email;

		// Find the user by email
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Get all campaigns for the user
		const campaigns = await prisma.campaign.findMany({
			where: { user_id: user.id },
			orderBy: { created_at: 'desc' },
			include: {
				posts: {
					select: {
						id: true,
						status: true,
					},
				},
			},
		});

		return NextResponse.json(campaigns);
	} catch (error) {
		console.error('Error fetching campaigns:', error);
		return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
	}
}

// POST /api/campaigns - Create a new campaign
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user ID from the session
		const userEmail = session.user.email;

		// Find the user by email
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		// Parse request body
		const campaignData = await req.json();

		// Create campaign
		const campaign = await prisma.campaign.create({
			data: {
				title: campaignData.title,
				description: campaignData.description || '',
				status: campaignData.status || 'draft',
				frequency: campaignData.frequency,
				start_date: new Date(campaignData.startDate),
				start_time: campaignData.startTime,
				end_date: campaignData.endDate ? new Date(campaignData.endDate) : null,
				duration: campaignData.duration,
				timezone: campaignData.timezone || 'UTC',
				custom_days: campaignData.customDays || [],
				custom_times: campaignData.customTimes || [],
				interests: campaignData.interests || [],
				languages: campaignData.languages || [],
				locations: campaignData.locations || [],
				age_range: campaignData.ageRange || null,
				gender: campaignData.gender || [],
				content_template: campaignData.contentTemplate || '',
				user: {
					connect: {
						id: user.id,
					},
				},
			},
		});

		return NextResponse.json(campaign, { status: 201 });
	} catch (error) {
		console.error('Error creating campaign:', error);
		return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
	}
}
