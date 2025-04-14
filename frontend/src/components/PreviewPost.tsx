import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';

interface PreviewPostProps {
	content: string;
	hashtags: string[];
	hasImage: boolean;
	onContentChange: (content: string) => void;
	previewIndex: number;
	totalPreviews: number;
}

const MAX_CHARACTERS = 280;

const PreviewPost: React.FC<PreviewPostProps> = ({
	content,
	hashtags,
	hasImage,
	onContentChange,
	previewIndex,
	totalPreviews,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedContent, setEditedContent] = useState(content);

	const contentWithHashtags = `${content} ${hashtags.map(tag => `#${tag}`).join(' ')}`;
	const characterCount = contentWithHashtags.length;
	const isOverLimit = characterCount > MAX_CHARACTERS;

	const handleEdit = () => {
		setIsEditing(true);
		setEditedContent(content);
	};

	const handleSave = () => {
		onContentChange(editedContent);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditedContent(content);
	};

	return (
		<Card className="overflow-hidden hover-card-shadow">
			<CardContent className="p-5">
				<div className="flex justify-between items-center mb-3">
					<div>
						<Badge variant="outline" className="font-normal">
							Preview {previewIndex + 1} of {totalPreviews}
						</Badge>
					</div>
					<div
						className={`text-xs font-medium ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}
					>
						{characterCount}/{MAX_CHARACTERS}
					</div>
				</div>

				{isEditing ? (
					<div className="relative">
						<Textarea
							value={editedContent}
							onChange={e => setEditedContent(e.target.value)}
							className="min-h-[100px] resize-none"
							placeholder="Edit your post content..."
						/>
						{editedContent.length + hashtags.join(' ').length + hashtags.length > MAX_CHARACTERS && (
							<div className="text-xs text-destructive mt-1">
								Content exceeds the maximum character limit.
							</div>
						)}
					</div>
				) : (
					<div className="bg-muted/40 rounded-lg p-4 min-h-[100px] relative text-sm">
						<p>{content}</p>
						<div className="mt-2 flex flex-wrap gap-1">
							{hashtags.map((tag, i) => (
								<Badge key={i} variant="secondary" className="font-normal">
									#{tag}
								</Badge>
							))}
						</div>
					</div>
				)}

				{hasImage && (
					<div className="mt-3 bg-muted/40 rounded-lg aspect-video flex items-center justify-center">
						<div className="text-sm text-muted-foreground">AI-generated image will appear here</div>
					</div>
				)}
			</CardContent>

			<CardFooter className="bg-card border-t px-5 py-3 flex justify-end">
				{isEditing ? (
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={handleCancel}>
							<X className="mr-1 h-4 w-4" />
							Cancel
						</Button>
						<Button size="sm" onClick={handleSave} disabled={isOverLimit}>
							<Save className="mr-1 h-4 w-4" />
							Save
						</Button>
					</div>
				) : (
					<Button variant="outline" size="sm" onClick={handleEdit}>
						<Edit className="mr-1 h-4 w-4" />
						Edit
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};

export default PreviewPost;
