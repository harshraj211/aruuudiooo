
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Post } from './CreatePostForm';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PostCardProps = {
    post: Post;
    onLike: (postId: string) => void;
    onAddComment: (postId: string, commentText: string) => void;
    currentUser: { displayName: string, email: string } | null;
};

export function PostCard({ post, onLike, onAddComment, currentUser }: PostCardProps) {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const { toast } = useToast();

    const handleCommentSubmit = () => {
        if (!commentText.trim()) return;
        onAddComment(post.id, commentText);
        setCommentText('');
        toast({title: 'Comment posted!'});
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar>
                    <AvatarFallback>{post.userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                         <div>
                            <p className="font-semibold">{post.userName}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                            </p>
                        </div>
                        <Badge variant="secondary">{post.cropOrFruitName}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                    <div className="relative aspect-video w-full">
                        <Image src={post.imageUrl} alt="Post image" fill className="rounded-lg object-cover" />
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => onLike(post.id)}>
                        <ThumbsUp className="mr-2 h-4 w-4" /> {post.likes} Like{post.likes !== 1 && 's'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
                        <MessageSquare className="mr-2 h-4 w-4" /> {post.comments?.length || 0} Comment{post.comments?.length !== 1 && 's'}
                    </Button>
                </div>

                {showComments && (
                    <div className="w-full space-y-4 pt-4">
                        <Separator />
                        <div className="w-full flex gap-2">
                            <Textarea
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={1}
                                className="h-auto"
                            />
                            <Button onClick={handleCommentSubmit} size="icon" disabled={!commentText.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                             {(post.comments || []).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(comment => (
                                <div key={comment.id} className="flex items-start gap-3">
                                     <Avatar className="h-8 w-8">
                                        <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-secondary p-3 rounded-lg">
                                        <div className="flex items-baseline justify-between">
                                            <p className="font-semibold text-sm">{comment.userName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <p className="text-sm mt-1">{comment.comment}</p>
                                    </div>
                                </div>
                            ))}
                            {(!post.comments || post.comments.length === 0) && (
                                <p className="text-sm text-center text-muted-foreground py-4">No comments yet. Be the first to reply!</p>
                            )}
                        </div>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
