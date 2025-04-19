'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugDisplay() {
	const { data: session, status } = useSession();
	const [isOpen, setIsOpen] = useState(false);

	if (!isOpen) {
		return (
			<div className="fixed bottom-4 right-4 z-50">
				<Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="bg-secondary">
					Debug
				</Button>
			</div>
		);
	}

	return (
		<div className="fixed bottom-4 right-4 z-50 max-w-md">
			<Card className="border-2 border-secondary">
				<CardHeader className="p-4 pb-2">
					<div className="flex justify-between items-center">
						<CardTitle className="text-base">Debug Info</CardTitle>
						<Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
							Close
						</Button>
					</div>
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<div className="space-y-2 text-sm">
						<div>
							<strong>Auth Status:</strong> {status}
						</div>
						{session ? (
							<>
								<div>
									<strong>User ID:</strong> {session.user.id}
								</div>
								<div>
									<strong>Email:</strong> {session.user.email}
								</div>
								<div>
									<strong>Name:</strong> {session.user.name || 'Not set'}
								</div>
							</>
						) : (
							<div className="text-destructive">Not authenticated</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
