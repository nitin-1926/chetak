import { NextRequest, NextResponse } from 'next/server';
import { schedulerService } from '@/lib/services/scheduler';

// GET /api/debug/scheduler - Get active cron jobs and scheduler status
export async function GET(req: NextRequest) {
	try {
		// Get the active cron jobs
		const activeCronJobs = Array.from((schedulerService as any).activeCronJobs.keys());

		// Get the count of active jobs
		const activeJobsCount = activeCronJobs.length;

		return NextResponse.json({
			status: 'active',
			activeJobsCount,
			activeCronJobs,
			serverTime: new Date().toISOString(),
			message: 'Scheduler is running',
		});
	} catch (error) {
		console.error('Error fetching scheduler debug info:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch scheduler debug info',
				message: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
