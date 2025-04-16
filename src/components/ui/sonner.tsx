'use client';

import * as React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
	return (
		<HotToaster
			position="top-right"
			toastOptions={{
				className: 'bg-background text-foreground',
				style: {
					background: 'hsl(var(--background))',
					color: 'hsl(var(--foreground))',
				},
			}}
		/>
	);
}
