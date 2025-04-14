import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import CampaignCard, { CampaignStatus } from '@/components/CampaignCard';
import { Plus } from 'lucide-react';
import { usePageTransition } from '@/utils/animations';

// Mock campaign data
const mockCampaigns = [
	{
		id: '1',
		title: 'Daily Tech Tips',
		description: 'Automated tech tips posted every day',
		status: 'active' as CampaignStatus,
		theme: 'Tech News',
		frequency: 'Daily',
		postsCount: 30,
		startDate: '2023-09-01',
		endDate: '2023-10-01',
	},
	{
		id: '2',
		title: 'Motivational Quotes',
		description: 'Inspirational quotes for followers',
		status: 'paused' as CampaignStatus,
		theme: 'Motivation',
		frequency: 'Every 12 hours',
		postsCount: 45,
		startDate: '2023-08-15',
	},
	{
		id: '3',
		title: 'Industry Insights',
		description: 'Latest trends and analysis',
		status: 'completed' as CampaignStatus,
		theme: 'Business',
		frequency: 'Weekly',
		postsCount: 8,
		startDate: '2023-07-10',
		endDate: '2023-09-01',
	},
	{
		id: '4',
		title: 'Random Facts',
		description: 'Interesting facts about the world',
		status: 'draft' as CampaignStatus,
		theme: 'Random Facts',
		frequency: 'Every 2 days',
		postsCount: 0,
		startDate: '2023-09-10',
	},
];

const Dashboard = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { animationClass } = usePageTransition();
	const [campaigns, setCampaigns] = useState(mockCampaigns);
	const [selectedFilter, setSelectedFilter] = useState('all');

	const handleCreateCampaign = () => {
		navigate('/create');
	};

	const handleEditCampaign = (id: string) => {
		toast({
			title: 'Edit Campaign',
			description: `Editing campaign with ID: ${id}`,
		});
		navigate(`/create?edit=${id}`);
	};

	const handleDeleteCampaign = (id: string) => {
		// In a real app, you'd show a confirmation dialog first
		toast({
			title: 'Campaign Deleted',
			description: 'The campaign has been deleted successfully.',
		});
		setCampaigns(campaigns.filter(campaign => campaign.id !== id));
	};

	const handleStatusChange = (id: string, newStatus: CampaignStatus) => {
		setCampaigns(campaigns.map(campaign => (campaign.id === id ? { ...campaign, status: newStatus } : campaign)));

		toast({
			title: `Campaign ${newStatus === 'active' ? 'Activated' : 'Paused'}`,
			description: `Campaign status changed to ${newStatus}.`,
		});
	};

	const filteredCampaigns = campaigns.filter(campaign => {
		if (selectedFilter === 'all') return true;
		return campaign.status === selectedFilter;
	});

	const getStatusCounts = () => {
		const counts = {
			all: campaigns.length,
			active: campaigns.filter(c => c.status === 'active').length,
			paused: campaigns.filter(c => c.status === 'paused').length,
			completed: campaigns.filter(c => c.status === 'completed').length,
			draft: campaigns.filter(c => c.status === 'draft').length,
		};
		return counts;
	};

	const statusCounts = getStatusCounts();

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
											<p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
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
							<CardDescription>View and manage your X content automation campaigns</CardDescription>
						</CardHeader>
						<CardContent>
							<Tabs defaultValue="all" value={selectedFilter} onValueChange={setSelectedFilter}>
								<TabsList className="mb-4">
									<TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
									<TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
									<TabsTrigger value="paused">Paused ({statusCounts.paused})</TabsTrigger>
									<TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
									<TabsTrigger value="draft">Drafts ({statusCounts.draft})</TabsTrigger>
								</TabsList>

								<TabsContent value={selectedFilter} className="mt-0">
									{filteredCampaigns.length > 0 ? (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{filteredCampaigns.map(campaign => (
												<CampaignCard
													key={campaign.id}
													{...campaign}
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
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
