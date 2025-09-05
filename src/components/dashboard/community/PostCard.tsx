
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageSquare, Send } from 'lucide-react';
import { Post, Comment } from './CreatePostForm';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type PostCardProps = {
    post: Post;
    onLike: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
};

export function PostCard({ post, onLike, onAddComment }: PostCardProps) {
    const [comment, setComment] = useState('');

    const handleCommentSubmit = () => {
        if (comment.trim()) {
            onAddComment(post.id, comment);
            setComment('');
        }
    };

    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

    return (
        <Card>
            <CardHeader className="flex-row gap-4 items-start">
                 <Avatar>
                    <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">{post.userName}</CardTitle>
                            <CardDescription>{timeSince(post.timestamp)}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="capitalize">{post.cropOrFruitName}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                    <div className="relative w-full aspect-video">
                        <Image src={post.imageUrl} alt={`Post by ${post.userName}`} fill className="rounded-md object-cover" />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={() => onLike(post.id)} className="flex items-center gap-2">
                        <Heart className={`h-4 w-4 ${post.likes > 0 ? 'text-red-500 fill-current' : ''}`} />
                        <span>{post.likes}</span>
                    </Button>
                     <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.comments.length}</span>
                    </div>
                </div>

                <Separator />
                
                <div className="w-full space-y-4">
                    {post.comments.map(c => (
                        <div key={c.id} className="flex gap-3 items-start">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>{c.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-secondary p-3 rounded-lg">
                                <div className="flex items-baseline justify-between">
                                    <p className="font-semibold text-sm">{c.userName}</p>
                                    <p className="text-xs text-muted-foreground">{timeSince(c.timestamp)}</p>
                                </div>
                                <p className="text-sm mt-1">{c.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex w-full items-center gap-2">
                    <Textarea
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={1}
                        className="min-h-0"
                    />
                    <Button size="icon" onClick={handleCommentSubmit} disabled={!comment.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

