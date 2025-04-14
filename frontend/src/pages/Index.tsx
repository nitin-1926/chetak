import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useInViewAnimation } from '@/utils/animations';
import { ArrowRight, Calendar, Layers, RefreshCw } from 'lucide-react';

const Index = () => {
	const navigate = useNavigate();
	const [heroRef, heroInView] = useInViewAnimation();
	const [featuresRef, featuresInView] = useInViewAnimation(0.1);
	const [ctaRef, ctaInView] = useInViewAnimation(0.1);

	const handleGetStarted = () => {
		navigate('/auth');
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			{/* Hero Section */}
			<section
				ref={heroRef}
				className={`pt-32 pb-24 px-4 sm:px-6 md:px-8 transition-opacity duration-1000 ${
					heroInView ? 'opacity-100' : 'opacity-0'
				}`}
			>
				<div className="max-w-4xl mx-auto text-center">
					<div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
						Automate your X presence effortlessly
					</div>
					<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-balance">
						Schedule and automate your <span className="text-gradient">content</span> on X
					</h1>
					<p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
						Create, schedule, and post engaging content automatically. Save time and maintain a consistent
						presence on X with AI-powered content generation.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" onClick={handleGetStarted} className="rounded-full group px-6 font-medium">
							Get Started
							<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="rounded-full px-6 font-medium"
							onClick={() => navigate('/dashboard')}
						>
							View Demo
						</Button>
					</div>
				</div>

				{/* Hero Image */}
				<div className="mt-16 max-w-5xl mx-auto relative">
					<div className="aspect-video rounded-2xl overflow-hidden shadow-2xl hover-card-shadow">
						<div className="w-full h-full bg-gradient-to-br from-primary/90 to-blue-600/90 flex items-center justify-center text-white">
							<div className="text-center">
								<p className="text-xl font-medium mb-4">Preview of AutoXPoster Dashboard</p>
								<Button variant="outline" className="text-white border-white hover:bg-white/10">
									Coming soon...
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section
				ref={featuresRef}
				className={`py-24 px-4 sm:px-6 md:px-8 bg-secondary/50 transition-opacity duration-1000 ${
					featuresInView ? 'opacity-100' : 'opacity-0'
				}`}
			>
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">
							Everything you need to automate your X content
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							From AI-powered content generation to scheduling, AutoXPoster handles all aspects of your X
							automation needs.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								icon: <Layers className="h-8 w-8 text-primary" />,
								title: 'AI Content Generation',
								description:
									"Automatically generate engaging, contextual content based on themes you select. No more writer's block.",
							},
							{
								icon: <Calendar className="h-8 w-8 text-primary" />,
								title: 'Intelligent Scheduling',
								description:
									'Set and forget with smart scheduling. Post at optimal times to reach your audience effectively.',
							},
							{
								icon: <RefreshCw className="h-8 w-8 text-primary" />,
								title: 'Continuous Posting',
								description:
									'Maintain a consistent presence on X without lifting a finger. Let automation work for you.',
							},
						].map((feature, index) => (
							<div key={index} className="bg-card rounded-xl p-6 shadow-sm hover-lift hover-card-shadow">
								<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
									{feature.icon}
								</div>
								<h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
								<p className="text-muted-foreground">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section
				ref={ctaRef}
				className={`py-24 px-4 sm:px-6 md:px-8 transition-opacity duration-1000 ${
					ctaInView ? 'opacity-100' : 'opacity-0'
				}`}
			>
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to automate your X presence?</h2>
					<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
						Join thousands of content creators, marketers, and businesses who are saving time and boosting
						their engagement with AutoXPoster.
					</p>
					<Button size="lg" onClick={handleGetStarted} className="rounded-full px-8 py-6 font-medium text-lg">
						Get Started for Free
					</Button>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-card py-12 px-4 sm:px-6 md:px-8 mt-auto">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
					<div className="mb-6 md:mb-0">
						<p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
							AutoXPoster
						</p>
						<p className="text-muted-foreground mt-2">© 2023 AutoXPoster. All rights reserved.</p>
					</div>
					<div className="flex space-x-6">
						<a href="#" className="text-muted-foreground hover:text-primary transition-colors">
							Privacy
						</a>
						<a href="#" className="text-muted-foreground hover:text-primary transition-colors">
							Terms
						</a>
						<a href="#" className="text-muted-foreground hover:text-primary transition-colors">
							Contact
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Index;
