import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit, Pause, Play, Trash } from 'lucide-react';

export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

interface CampaignCardProps {
	id: string;
	title: string;
	description: string;
	status: CampaignStatus;
	theme: string;
	frequency: string;
	postsCount: number;
	startDate: string;
	endDate?: string;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onStatusChange: (id: string, status: CampaignStatus) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
	id,
	title,
	description,
	status,
	theme,
	frequency,
	postsCount,
	startDate,
	endDate,
	onEdit,
	onDelete,
	onStatusChange,
}) => {
	const getStatusColor = () => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
			case 'paused':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400';
			case 'completed':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
			case 'draft':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const handleToggleStatus = () => {
		if (status === 'active') {
			onStatusChange(id, 'paused');
		} else if (status === 'paused' || status === 'draft') {
			onStatusChange(id, 'active');
		}
	};

	const canToggle = ['active', 'paused', 'draft'].includes(status);

	return (
		<Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover-lift">
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-xl">{title}</CardTitle>
						<CardDescription className="mt-1">{description}</CardDescription>
					</div>
					<Badge className={`font-normal ${getStatusColor()}`}>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="pb-2">
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div className="flex items-center gap-1.5">
						<div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
							<div className="w-2 h-2 rounded-full bg-primary" />
						</div>
						<span className="text-muted-foreground">Theme:</span>
						<span className="font-medium">{theme}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Clock className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-muted-foreground">Frequency:</span>
						<span className="font-medium">{frequency}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-muted-foreground">Started:</span>
						<span className="font-medium">{startDate}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-muted-foreground">End:</span>
						<span className="font-medium">{endDate || 'Ongoing'}</span>
					</div>
				</div>
				<div className="mt-3 flex items-center gap-1.5">
					<span className="text-sm text-muted-foreground">Posts:</span>
					<Badge variant="outline" className="font-normal rounded-full">
						{postsCount} posts
					</Badge>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between pt-2">
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-8 px-2 text-muted-foreground"
						onClick={() => onEdit(id)}
					>
						<Edit className="h-3.5 w-3.5 mr-1" />
						Edit
					</Button>
					<Button
						variant="outline"
						size="sm"
						className="h-8 px-2 text-destructive hover:text-destructive"
						onClick={() => onDelete(id)}
					>
						<Trash className="h-3.5 w-3.5 mr-1" />
						Delete
					</Button>
				</div>
				{canToggle && (
					<Button
						variant={status === 'active' ? 'outline' : 'default'}
						size="sm"
						className={`h-8 px-3 ${status === 'active' ? 'text-amber-600 hover:text-amber-700' : ''}`}
						onClick={handleToggleStatus}
					>
						{status === 'active' ? (
							<>
								<Pause className="h-3.5 w-3.5 mr-1" />
								Pause
							</>
						) : (
							<>
								<Play className="h-3.5 w-3.5 mr-1" />
								Start
							</>
						)}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};

export default CampaignCard;
