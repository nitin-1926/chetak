'use client';

import CampaignCard, { CampaignStatus } from '@/components/CampaignCard';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Campaign as CampaignType } from '@/types/api';
import { usePageTransition } from '@/utils/animations';
import { CampaignAPI } from '@/utils/api';
import { Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

export default function DashboardPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { animationClass } = usePageTransition();
	const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
	const [selectedFilter, setSelectedFilter] = useState('all');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Use useCallback to prevent recreating this function on every render
	const fetchCampaigns = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await CampaignAPI.getAll();
			setCampaigns(data);
		} catch (err) {
			console.error('Error fetching campaigns:', err);
			setError('Failed to load your campaigns. Please try again.');
			toast({
				title: 'Error',
				description: 'Failed to load your campaigns. Please try again.',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchCampaigns();
	}, [fetchCampaigns]);

	const handleCreateCampaign = () => {
		router.push('/create');
	};

	const handleEditCampaign = (id: string) => {
		router.push(`/create?edit=${id}`);
	};

	const handleDeleteCampaign = async (id: string) => {
		try {
			await CampaignAPI.delete(id);

			toast({
				title: 'Campaign Deleted',
				description: 'The campaign has been deleted successfully.',
			});

			// Remove the deleted campaign from state
			setCampaigns(prevCampaigns => prevCampaigns.filter(campaign => campaign.id !== id));
		} catch (err) {
			console.error('Error deleting campaign:', err);
			toast({
				title: 'Error',
				description: 'Failed to delete the campaign. Please try again.',
				variant: 'destructive',
			});
		}
	};

	const handleStatusChange = async (id: string, newStatus: CampaignStatus) => {
		try {
			const campaign = campaigns.find(c => c.id === id);
			if (!campaign) return;

			await CampaignAPI.update(id, {
				...campaign,
				status: newStatus,
			});

			// Update local state using functional update to avoid stale closures
			setCampaigns(prevCampaigns =>
				prevCampaigns.map(campaign => (campaign.id === id ? { ...campaign, status: newStatus } : campaign)),
			);

			toast({
				title: `Campaign ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
				description: `Campaign status changed to ${newStatus}.`,
			});
		} catch (err) {
			console.error('Error updating campaign status:', err);
			toast({
				title: 'Error',
				description: 'Failed to update the campaign status. Please try again.',
				variant: 'destructive',
			});
		}
	};

	// Use memoized filteredCampaigns to prevent recalculation on each render
	const filteredCampaigns = React.useMemo(() => {
		return campaigns.filter(campaign => {
			if (selectedFilter === 'all') return true;
			return campaign.status === selectedFilter;
		});
	}, [campaigns, selectedFilter]);

	// Use memoized statusCounts to prevent recalculation on each render
	const statusCounts = React.useMemo(() => {
		return {
			all: campaigns.length,
			active: campaigns.filter(c => c.status === 'active').length,
			paused: campaigns.filter(c => c.status === 'paused').length,
			completed: campaigns.filter(c => c.status === 'completed').length,
			draft: campaigns.filter(c => c.status === 'draft').length,
		};
	}, [campaigns]);

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className={`flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${animationClass}`}>
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
						<div>
							<h1 className="text-3xl font-bold">Dashboard</h1>
							<p className="text-muted-foreground mt-1">Manage and track your automated X campaigns</p>
						</div>
						<Button onClick={handleCreateCampaign} className="mt-4 md:mt-0">
							<Plus className="mr-2 h-4 w-4" />
							Create Campaign
						</Button>
					</div>

					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-20">
							<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
							<p className="text-xl font-medium">Loading campaigns...</p>
							<p className="text-muted-foreground">Please wait while we fetch your data</p>
						</div>
					) : error ? (
						<div className="py-20 text-center">
							<p className="text-muted-foreground mb-4">{error}</p>
							<Button onClick={fetchCampaigns}>Retry</Button>
						</div>
					) : (
						<>
							{/* Stats Overview */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
								{[
									{ title: 'Total Campaigns', value: statusCounts.all, color: 'bg-blue-500' },
									{ title: 'Active', value: statusCounts.active, color: 'bg-green-500' },
									{ title: 'Paused', value: statusCounts.paused, color: 'bg-yellow-500' },
									{ title: 'Completed', value: statusCounts.completed, color: 'bg-gray-500' },
								].map((stat, index) => (
									<Card key={index}>
										<CardContent className="p-6">
											<div className="flex items-center space-x-4">
												<div
													className={`w-12 h-12 rounded-full ${stat.color} bg-opacity-10 flex items-center justify-center`}
												>
													<div className={`w-6 h-6 rounded-full ${stat.color}`}></div>
												</div>
												<div>
													<p className="text-sm font-medium text-muted-foreground">
														{stat.title}
													</p>
													<p className="text-3xl font-bold">{stat.value}</p>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>

							{/* Campaign Listing */}
							<Card>
								<CardHeader>
									<CardTitle>Your Campaigns</CardTitle>
									<CardDescription>
										View and manage your X content automation campaigns
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Tabs defaultValue="all" value={selectedFilter} onValueChange={setSelectedFilter}>
										<TabsList className="mb-4">
											<TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
											<TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
											<TabsTrigger value="paused">Paused ({statusCounts.paused})</TabsTrigger>
											<TabsTrigger value="completed">
												Completed ({statusCounts.completed})
											</TabsTrigger>
											<TabsTrigger value="draft">Drafts ({statusCounts.draft})</TabsTrigger>
										</TabsList>

										<TabsContent value={selectedFilter} className="mt-0">
											{filteredCampaigns.length > 0 ? (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{filteredCampaigns.map(campaign => (
														<CampaignCard
															key={campaign.id}
															id={campaign.id}
															title={campaign.title}
															description={campaign.description || ''}
															status={campaign.status as CampaignStatus}
															theme={campaign.frequency} // Using frequency as theme for display
															frequency={campaign.frequency}
															postsCount={campaign.posts_count}
															startDate={
																new Date(campaign.start_date)
																	.toISOString()
																	.split('T')[0]
															}
															endDate={
																campaign.end_date
																	? new Date(campaign.end_date)
																			.toISOString()
																			.split('T')[0]
																	: undefined
															}
															onEdit={handleEditCampaign}
															onDelete={handleDeleteCampaign}
															onStatusChange={handleStatusChange}
														/>
													))}
												</div>
											) : (
												<div className="py-12 text-center">
													<p className="text-muted-foreground mb-4">
														No campaigns found with this status.
													</p>
													<Button onClick={handleCreateCampaign}>
														<Plus className="mr-2 h-4 w-4" />
														Create Your First Campaign
													</Button>
												</div>
											)}
										</TabsContent>
									</Tabs>
								</CardContent>
							</Card>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
