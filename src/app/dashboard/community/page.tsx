
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CreatePostForm, Post } from '@/components/dashboard/community/CreatePostForm';
import { PostCard } from '@/components/dashboard/community/PostCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cropData, fruitData } from '@/lib/item-data';

const COMMUNITY_POSTS_KEY = 'agriVision-communityPosts';

export default function CommunityPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Load posts from localStorage
    useEffect(() => {
        const storedPosts = localStorage.getItem(COMMUNITY_POSTS_KEY);
        if (storedPosts) {
            setPosts(JSON.parse(storedPosts).map((p: Post) => ({...p, timestamp: new Date(p.timestamp)})));
        }
    }, []);

    const savePosts = (newPosts: Post[]) => {
        setPosts(newPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(newPosts));
    };

    const handleCreatePost = (content: string, cropOrFruitName: string, type: 'crop' | 'fruit', imageUrl?: string) => {
        if (!user) return;
        const newPost: Post = {
            id: Date.now().toString(),
            userId: user.email ?? 'anonymous',
            userName: user.displayName ?? 'Anonymous Farmer',
            type,
            cropOrFruitName,
            content,
            imageUrl: imageUrl || '',
            timestamp: new Date(),
            likes: 0,
            comments: [],
        };
        savePosts([newPost, ...posts]);
    };

    const handleLikePost = (postId: string) => {
        const newPosts = posts.map(p => {
            if (p.id === postId) {
                // In a real app, you'd check if the user already liked it.
                return { ...p, likes: p.likes + 1 };
            }
            return p;
        });
        savePosts(newPosts);
    };

    const handleAddComment = (postId: string, commentText: string) => {
        if (!user) return;
        const newPosts = posts.map(p => {
            if (p.id === postId) {
                const newComment = {
                    id: Date.now().toString(),
                    userId: user.email ?? 'anonymous',
                    userName: user.displayName ?? 'Anonymous',
                    comment: commentText,
                    timestamp: new Date(),
                };
                return { ...p, comments: [...(p.comments || []), newComment] };
            }
            return p;
        });
        savePosts(newPosts);
    };

    const filteredPosts = useMemo(() => {
        return posts
            .filter(post => {
                if (filterType === 'all') return true;
                return post.cropOrFruitName.toLowerCase() === filterType.toLowerCase();
            })
            .filter(post => {
                if (!searchTerm) return true;
                return post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       post.userName.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [posts, filterType, searchTerm]);
    
    const allItems = useMemo(() => {
        const crops = Object.values(cropData).map(crop => ({ value: crop.name, label: crop.name }));
        const fruits = Object.values(fruitData).map(fruit => ({ value: fruit.name, label: fruit.name }));
        return [...crops, ...fruits].sort((a,b) => a.label.localeCompare(b.label));
    }, []);

    return (
        <main>
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold">Community Forum</h1>
                <p className="text-muted-foreground">
                    Ask questions, share advice, and connect with fellow farmers.
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search posts or users..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select onValueChange={setFilterType} value={filterType}>
                            <SelectTrigger className="w-full md:w-[240px]">
                                <SelectValue placeholder="Filter by crop/fruit..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Crops/Fruits</SelectItem>
                                {allItems.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-6">
                         {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post} 
                                    onLike={handleLikePost} 
                                    onAddComment={handleAddComment}
                                    currentUser={user}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 text-muted-foreground bg-secondary/30 rounded-lg">
                                <p>No posts found.</p>
                                <p className="text-sm">Try adjusting your search or filter.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 sticky top-20">
                    <CreatePostForm onSubmit={handleCreatePost} />
                </div>
            </div>
        </main>
    );
}
