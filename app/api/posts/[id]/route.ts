import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/posts/[id] - Get a specific post
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const postId = params.id;

		// Get the post
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				campaign: true,
			},
		});

		if (!post) {
			return NextResponse.json({ error: 'Post not found' }, { status: 404 });
		}

		// Check if the user owns the campaign that the post belongs to
		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user || post.campaign.user_id !== user.id) {
			return NextResponse.json({ error: 'Not authorized to access this post' }, { status: 403 });
		}

		return NextResponse.json(post);
	} catch (error) {
		console.error('Error fetching post:', error);
		return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
	}
}

// PUT /api/posts/[id] - Update a post
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const postId = params.id;
		const postData = await req.json();

		// Check if the post exists and get its campaign
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				campaign: true,
			},
		});

		if (!post) {
			return NextResponse.json({ error: 'Post not found' }, { status: 404 });
		}

		// Check if the user owns the campaign that the post belongs to
		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user || post.campaign.user_id !== user.id) {
			return NextResponse.json({ error: 'Not authorized to update this post' }, { status: 403 });
		}

		// Update the post
		const updatedPost = await prisma.post.update({
			where: { id: postId },
			data: {
				content: postData.content,
				scheduled_for: postData.scheduledFor ? new Date(postData.scheduledFor) : undefined,
				status: postData.status,
				platform_data: postData.platformData,
				error: postData.error,
			},
		});

		return NextResponse.json(updatedPost);
	} catch (error) {
		console.error('Error updating post:', error);
		return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
	}
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const postId = params.id;

		// Check if the post exists and get its campaign
		const post = await prisma.post.findUnique({
			where: { id: postId },
			include: {
				campaign: true,
			},
		});

		if (!post) {
			return NextResponse.json({ error: 'Post not found' }, { status: 404 });
		}

		// Check if the user owns the campaign that the post belongs to
		const userEmail = session.user.email;
		const user = await prisma.user.findUnique({
			where: { email: userEmail as string },
		});

		if (!user || post.campaign.user_id !== user.id) {
			return NextResponse.json({ error: 'Not authorized to delete this post' }, { status: 403 });
		}

		// Delete the post
		await prisma.post.delete({
			where: { id: postId },
		});

		// Decrement the posts count in the campaign
		await prisma.campaign.update({
			where: { id: post.campaign_id },
			data: {
				posts_count: {
					decrement: 1,
				},
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting post:', error);
		return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
	}
}
