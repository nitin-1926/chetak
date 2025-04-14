import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

export interface ScheduleOption {
	id: string;
	label: string;
	value: string;
	description: string;
}

interface ScheduleSelectorProps {
	frequencyOptions: ScheduleOption[];
	selectedFrequency: string;
	onSelectFrequency: (frequency: string) => void;
	startDate: Date | undefined;
	onSelectStartDate: (date: Date | undefined) => void;
	startTime: string;
	onSelectStartTime: (time: string) => void;
	endDate: Date | undefined;
	onSelectEndDate: (date: Date | undefined) => void;
	duration: string;
	onSelectDuration: (duration: string) => void;
}

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
	frequencyOptions,
	selectedFrequency,
	onSelectFrequency,
	startDate,
	onSelectStartDate,
	startTime,
	onSelectStartTime,
	endDate,
	onSelectEndDate,
	duration,
	onSelectDuration,
}) => {
	const durationOptions = [
		{ value: 'ongoing', label: 'Ongoing' },
		{ value: '1d', label: '1 day' },
		{ value: '3d', label: '3 days' },
		{ value: '7d', label: '1 week' },
		{ value: '14d', label: '2 weeks' },
		{ value: '30d', label: '1 month' },
		{ value: 'custom', label: 'Custom end date' },
	];

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium mb-3">Posting Frequency</h3>
				<RadioGroup
					value={selectedFrequency}
					onValueChange={onSelectFrequency}
					className="grid grid-cols-1 md:grid-cols-2 gap-4"
				>
					{frequencyOptions.map(option => (
						<div key={option.id} className="relative">
							<RadioGroupItem value={option.id} id={`frequency-${option.id}`} className="peer sr-only" />
							<Label htmlFor={`frequency-${option.id}`} className="cursor-pointer">
								<Card className="h-full transition-all border overflow-hidden peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary hover:shadow-md">
									<CardContent className="p-4">
										<div className="font-medium">{option.label}</div>
										<p className="text-muted-foreground text-sm mt-1">{option.description}</p>
									</CardContent>
								</Card>
							</Label>
						</div>
					))}
				</RadioGroup>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<h3 className="text-lg font-medium mb-3">Start Date & Time</h3>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="start-date" className="mb-2 block">
								Date
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-start text-left font-normal h-10"
										id="start-date"
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={startDate}
										onSelect={onSelectStartDate}
										initialFocus
										disabled={date => date < new Date()}
									/>
								</PopoverContent>
							</Popover>
						</div>
						<div>
							<Label htmlFor="start-time" className="mb-2 block">
								Time
							</Label>
							<div className="relative">
								<Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="start-time"
									type="time"
									value={startTime}
									onChange={e => onSelectStartTime(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
					</div>
				</div>

				<div>
					<h3 className="text-lg font-medium mb-3">Duration</h3>
					<Label htmlFor="duration" className="mb-2 block">
						Campaign Length
					</Label>
					<Select value={duration} onValueChange={onSelectDuration}>
						<SelectTrigger id="duration">
							<SelectValue placeholder="Select duration" />
						</SelectTrigger>
						<SelectContent>
							{durationOptions.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{duration === 'custom' && (
						<div className="mt-4">
							<Label htmlFor="end-date" className="mb-2 block">
								End Date
							</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-start text-left font-normal h-10"
										id="end-date"
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={endDate}
										onSelect={onSelectEndDate}
										initialFocus
										disabled={date => (startDate ? date <= startDate : date <= new Date())}
									/>
								</PopoverContent>
							</Popover>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ScheduleSelector;
