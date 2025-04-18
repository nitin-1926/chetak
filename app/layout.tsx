import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';
import '../styles/index.css';
import { Toaster } from '../components/ui/toaster';
import { Toaster as Sonner } from '../components/ui/sonner';
import { TooltipProvider } from '../components/ui/tooltip';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
	title: 'chetak-automate-content',
	description: 'Lovable Generated Project',
	authors: [{ name: 'Lovable' }],
	openGraph: {
		title: 'Lovable Generated Project',
		description: 'Lovable Generated Project',
		type: 'website',
		images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
	},
	twitter: {
		card: 'summary_large_image',
		site: '@lovable_dev',
		images: ['https://lovable.dev/opengraph-image-p98pqg.png'],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.variable}>
				<Providers>
					<TooltipProvider>
						<Toaster />
						<Sonner />
						{children}
					</TooltipProvider>
				</Providers>
			</body>
		</html>
	);
}
