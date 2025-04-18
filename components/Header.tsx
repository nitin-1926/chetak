'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface NavItem {
	name: string;
	href: string;
}

const navigation: NavItem[] = [
	{ name: 'Dashboard', href: '/dashboard' },
	{ name: 'Create', href: '/create' },
	{ name: 'Help', href: '/help' },
];

const Header = () => {
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Close mobile menu when changing routes
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [pathname]);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
				scrolled || mobileMenuOpen
					? 'bg-white/70 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm'
					: 'bg-transparent'
			}`}
		>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center">
						<Link href="/" className="flex items-center">
							<span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
								Chetak
							</span>
						</Link>
					</div>

					{/* Desktop navigation */}
					<nav className="hidden md:flex items-center space-x-8">
						{navigation.map(item => (
							<Link
								key={item.name}
								href={item.href}
								className={`text-sm font-medium transition-colors hover:text-primary ${
									pathname === item.href ? 'text-primary' : 'text-foreground/80'
								}`}
							>
								{item.name}
							</Link>
						))}
						<div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
						<Link href="/auth">
							<Button variant="default" size="sm" className="rounded-full">
								Sign In
							</Button>
						</Link>
					</nav>

					{/* Mobile menu button */}
					<button
						type="button"
						className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						<span className="sr-only">Open main menu</span>
						{mobileMenuOpen ? (
							<X className="block h-6 w-6" aria-hidden="true" />
						) : (
							<Menu className="block h-6 w-6" aria-hidden="true" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile menu */}
			<div
				className={`md:hidden transition-all duration-300 ease-in-out ${
					mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
				}`}
			>
				<div className="space-y-1 px-4 py-4 pb-6">
					{navigation.map(item => (
						<Link
							key={item.name}
							href={item.href}
							className={`block px-3 py-2 rounded-md text-base font-medium ${
								pathname === item.href
									? 'text-primary bg-gray-50 dark:bg-gray-800'
									: 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
							}`}
						>
							{item.name}
						</Link>
					))}
					<Link href="/auth" className="block w-full mt-4">
						<Button variant="default" size="sm" className="w-full">
							Sign In
						</Button>
					</Link>
				</div>
			</div>
		</header>
	);
};

export default Header;
