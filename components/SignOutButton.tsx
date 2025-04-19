'use client';

import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	showIcon?: boolean;
	className?: string;
}

export default function SignOutButton({ variant = 'default', showIcon = true, className = '' }: SignOutButtonProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleSignOut = async () => {
		try {
			setIsLoading(true);
			await signOut({ redirect: false });
			router.push('/auth');
			router.refresh();
		} catch (error) {
			console.error('Sign out error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			variant={variant}
			onClick={handleSignOut}
			disabled={isLoading}
			className={`flex items-center gap-2 ${className}`}
		>
			{showIcon && <LogOut className="w-4 h-4" />}
			{isLoading ? 'Signing out...' : 'Sign out'}
		</Button>
	);
}
