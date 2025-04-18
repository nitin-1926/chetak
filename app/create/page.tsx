'use client';

import React, { Suspense } from 'react';

// Import the CreateCampaignContent component (will move content directly into this file)
import CreateCampaignContent from './CreateCampaignContent';

export default function CreateCampaignPage() {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<CreateCampaignContent />
		</Suspense>
	);
}
