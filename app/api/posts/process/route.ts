import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { schedulerService } from '@/lib/services/scheduler';

// This route is designed to be called by a cron job
// It should have appropriate authentication in production

// POST /api/posts/process - Process scheduled posts
export async function POST(req: NextRequest) {
	try {
		// Check for API key authentication (simple implementation)
		const apiKey = req.headers.get('x-api-key');

		if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Process scheduled posts
		await schedulerService.processScheduledPosts();

		return NextResponse.json({ success: true, message: 'Posts processed successfully' });
	} catch (error) {
		console.error('Error processing scheduled posts:', error);
		return NextResponse.json({ error: 'Failed to process scheduled posts' }, { status: 500 });
	}
}
