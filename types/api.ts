/**
 * Campaign related types
 */
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type PostStatus = 'scheduled' | 'processing' | 'published' | 'failed';

export type Campaign = {
	id: string;
	title: string;
	description: string | null;
	status: CampaignStatus;
	posts_count: number;
	created_at: string;
	updated_at: string;
	user_id: string;

	// Schedule fields
	frequency: string;
	start_date: string;
	start_time: string;
	end_date: string | null;
	duration: string | null;
	timezone: string;
	custom_days: string[];
	custom_times: string[];

	// Audience preference fields
	interests: string[];
	languages: string[];
	locations: string[];
	age_range: string | null;
	gender: string[];

	// Content template fields
	content_template: string;

	// Relations
	posts?: Post[];
};

/**
 * Post related types
 */
export type Post = {
	id: string;
	content: string;
	scheduled_for: string;
	status: PostStatus;
	platform_data?: Record<string, any> | null;
	error?: string | null;
	created_at: string;
	updated_at: string;
	campaign_id: string;

	// Relations
	campaign?: Campaign;
};

/**
 * Campaign creation/update payload
 */
export type CampaignPayload = {
	title: string;
	description?: string;
	status?: CampaignStatus;
	frequency: string;
	startDate: string;
	startTime: string;
	endDate?: string | null;
	duration?: string;
	timezone?: string;
	customDays?: string[];
	customTimes?: string[];
	interests?: string[];
	languages?: string[];
	locations?: string[];
	ageRange?: string | null;
	gender?: string[];
	contentTemplate: string;
};

/**
 * Post creation/update payload
 */
export type PostPayload = {
	content: string;
	scheduledFor: string;
	status?: PostStatus;
	platformData?: Record<string, any>;
};
