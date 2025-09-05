
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Combobox } from '@/components/ui/combobox';
import { cropData, fruitData } from '@/lib/item-data';
import { ImagePlus, Send, X } from 'lucide-react';
import Image from 'next/image';

export type Comment = {
    id: string;
    userId: string;
    userName: string;
    comment: string;
    timestamp: Date;
};

export type Post = {
    id: string;
    userId: string;
    userName: string;
    type: 'crop' | 'fruit';
    cropOrFruitName: string;
    content: string;
    imageUrl: string;
    timestamp: Date;
    likes: number;
    comments: Comment[];
};

type CreatePostFormProps = {
    onSubmit: (content: string, cropOrFruitName: string, type: 'crop' | 'fruit', imageUrl?: string) => void;
};

export function CreatePostForm({ onSubmit }: CreatePostFormProps) {
    const [content, setContent] = useState('');
    const [item, setItem] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { toast } = useToast();
    const imageInputRef = useRef<HTMLInputElement>(null);

    const allItems = [
        ...Object.keys(cropData).map(key => ({ value: cropData[key as keyof typeof cropData].name, label: cropData[key as keyof typeof cropData].name, type: 'crop' as const })),
        ...Object.keys(fruitData).map(key => ({ value: fruitData[key as keyof typeof fruitData].name, label: fruitData[key as keyof typeof fruitData].name, type: 'fruit' as const }))
    ].sort((a,b) => a.label.localeCompare(b.label));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                toast({ variant: 'destructive', title: "Image too large", description: "Please upload an image smaller than 4MB." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                // In a real app, this would be uploaded to Firebase Storage,
                // and reader.result would be the data to upload.
                // For this mock, we just store the Data URI.
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    }

    const handleSubmit = () => {
        if (!content.trim() || !item) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please write some content and select a crop/fruit type.',
            });
            return;
        }

        const selectedItem = allItems.find(i => i.value === item);
        if (!selectedItem) {
             toast({
                variant: 'destructive',
                title: 'Invalid Item',
                description: 'Please select a valid crop or fruit from the list.',
            });
            return;
        }

        onSubmit(content, selectedItem.value, selectedItem.type, imagePreview || undefined);
        setContent('');
        setItem('');
        clearImage();
        toast({ title: 'Post Created!', description: 'Your post is now live in the community forum.' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create a New Post</CardTitle>
                <CardDescription>Share your knowledge or ask a question.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="What's on your mind? For example: My wheat leaves are turning yellow. What should I do?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                />
                 <Combobox
                    options={allItems}
                    value={item}
                    onChange={setItem}
                    placeholder="Select crop/fruit..."
                    searchPlaceholder="Search for a crop or fruit..."
                    emptyText="No item found."
                />
                
                {imagePreview && (
                    <div className="relative w-full aspect-video">
                        <Image src={imagePreview} alt="Preview" fill className="rounded-md object-cover" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={clearImage}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
                
                <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => imageInputRef.current?.click()}>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        {imagePreview ? 'Change Image' : 'Add Image'}
                    </Button>
                    <input
                        type="file"
                        ref={imageInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    <Button onClick={handleSubmit}>
                        <Send className="mr-2 h-4 w-4" />
                        Post
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

