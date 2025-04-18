'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { usePageTransition } from '@/utils/animations';

const HelpPage = () => {
	const { animationClass } = usePageTransition();

	const faqs = [
		{
			question: 'What is Chetak?',
			answer: 'Chetak is an AI-powered content automation platform for X (formerly Twitter). It helps you maintain a consistent posting schedule by generating high-quality content based on your chosen themes and preferences.',
		},
		{
			question: 'How does the content generation work?',
			answer: 'Chetak uses advanced AI models to create content that matches your selected theme. You can choose from predefined themes like Tech News or Motivational Quotes, or create a custom theme with your own topics and keywords.',
		},
		{
			question: 'Is there a limit to how many campaigns I can create?',
			answer: 'The free plan allows you to create up to 2 active campaigns. Premium plans offer more active campaigns and higher post frequency options.',
		},
		{
			question: 'Can I edit the generated content before it posts?',
			answer: 'Yes! You can enable "Review before posting" in campaign settings to approve each post before it goes live, or make edits to the AI suggestions.',
		},
		{
			question: 'How do I connect my X account?',
			answer: 'Go to the Auth page and click "Connect with X". You\'ll be guided through the X authentication process to grant Chetak permission to post on your behalf.',
		},
		{
			question: 'Can I schedule when posts are published?',
			answer: 'Absolutely. When creating a campaign, you can set the posting frequency (hourly, daily, etc.) and specify the time window when posts should be published.',
		},
		{
			question: 'How do I cancel a campaign?',
			answer: 'You can pause or cancel a campaign anytime from the Dashboard. Select the campaign and click "Pause" or "Delete" from the menu options.',
		},
	];

	const gettingStartedSteps = [
		{
			title: 'Create an account',
			description: 'Sign up using your email or connect directly with your X account.',
		},
		{
			title: 'Connect your X profile',
			description: "Authorize Chetak to post content on your behalf through X's official API.",
		},
		{
			title: 'Create your first campaign',
			description: 'Choose a content theme, set your posting schedule, and customize settings.',
		},
		{
			title: 'Review sample content',
			description: 'Preview AI-generated content examples and make any adjustments to your campaign settings.',
		},
		{
			title: 'Activate your campaign',
			description:
				"Once you're satisfied with the setup, activate your campaign and Chetak will start posting according to your schedule.",
		},
	];

	return (
		<div className="min-h-screen flex flex-col">
			<Header />

			<main className={`flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 ${animationClass}`}>
				<div className="max-w-4xl mx-auto">
					<div className="mb-8">
						<h1 className="text-3xl font-bold">Help Center</h1>
						<p className="text-muted-foreground mt-1">
							Find answers to common questions and learn how to use Chetak effectively
						</p>
					</div>

					<Tabs defaultValue="faq" className="mb-8">
						<TabsList className="mb-4">
							<TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
							<TabsTrigger value="getting-started">Getting Started</TabsTrigger>
						</TabsList>

						<TabsContent value="faq">
							<Card>
								<CardContent className="pt-6">
									<Accordion type="single" collapsible className="w-full">
										{faqs.map((faq, index) => (
											<AccordionItem key={index} value={`item-${index}`}>
												<AccordionTrigger className="text-left font-medium">
													{faq.question}
												</AccordionTrigger>
												<AccordionContent className="text-muted-foreground">
													{faq.answer}
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="getting-started">
							<Card>
								<CardContent className="pt-6">
									<ol className="space-y-6">
										{gettingStartedSteps.map((step, index) => (
											<li key={index} className="flex gap-4">
												<div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
													{index + 1}
												</div>
												<div>
													<h3 className="font-medium">{step.title}</h3>
													<p className="text-muted-foreground mt-1">{step.description}</p>
												</div>
											</li>
										))}
									</ol>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>

					<div className="bg-muted/40 rounded-lg p-6 mt-8">
						<h2 className="text-xl font-semibold mb-4">Still need help?</h2>
						<p className="text-muted-foreground mb-4">
							If you couldn't find the answer to your question, our support team is happy to help.
						</p>
						<div className="flex flex-col sm:flex-row gap-4">
							<a
								href="mailto:support@chetak.app"
								className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
							>
								Email Support
							</a>
							<a
								href="https://twitter.com/chetakapp"
								className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
							>
								DM us on X
							</a>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default HelpPage;
