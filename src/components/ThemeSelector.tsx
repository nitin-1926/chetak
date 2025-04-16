import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export interface Theme {
	id: string;
	name: string;
	description: string;
	icon?: React.ReactNode;
	popular?: boolean;
}

interface ThemeSelectorProps {
	themes: Theme[];
	selectedThemeId: string;
	onSelectTheme: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, selectedThemeId, onSelectTheme }) => {
	return (
		<RadioGroup
			value={selectedThemeId}
			onValueChange={onSelectTheme}
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
		>
			{themes.map(theme => (
				<div key={theme.id} className="relative">
					<RadioGroupItem value={theme.id} id={`theme-${theme.id}`} className="peer sr-only" />
					<Label htmlFor={`theme-${theme.id}`} className="cursor-pointer">
						<Card className="h-full transition-all border overflow-hidden peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary hover:shadow-md">
							<CardContent className="p-6 flex flex-col">
								<div className="flex justify-between items-start mb-4">
									<div className="flex items-center gap-2">
										{theme.icon && (
											<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
												{theme.icon}
											</div>
										)}
										<div>
											<div className="font-medium text-lg">{theme.name}</div>
											{theme.popular && (
												<Badge variant="secondary" className="ml-2 font-normal text-xs">
													Popular
												</Badge>
											)}
										</div>
									</div>
								</div>
								<p className="text-muted-foreground text-sm">{theme.description}</p>
							</CardContent>
						</Card>
					</Label>
				</div>
			))}
		</RadioGroup>
	);
};

export default ThemeSelector;
