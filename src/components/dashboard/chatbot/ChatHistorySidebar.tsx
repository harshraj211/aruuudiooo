
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, MessageSquare, FileDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/chat-types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

type ChatHistorySidebarProps = {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onDeleteChat: (id: string) => void;
    className?: string;
};

export function ChatHistorySidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteChat,
    className
}: ChatHistorySidebarProps) {
    return (
        <Card className={cn("flex flex-col h-full", className)}>
            <CardHeader className="flex-row items-center justify-between p-4 border-b">
                <CardTitle className="text-lg">Chat History</CardTitle>
                <Button variant="ghost" size="icon" onClick={onNewChat}>
                    <PlusCircle className="h-5 w-5" />
                    <span className="sr-only">New Chat</span>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-2">
                <ScrollArea className="h-full">
                    <div className="space-y-1">
                        {conversations.length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No past chats.
                            </div>
                        )}
                        {conversations.map(convo => (
                            <div key={convo.id} className="group relative pr-14">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start text-left h-auto py-2",
                                        activeConversationId === convo.id && 'bg-secondary'
                                    )}
                                    onClick={() => onSelectConversation(convo.id)}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
                                    <div className="flex-1 truncate">
                                        <p className="font-semibold truncate">{convo.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(convo.createdAt).toLocaleString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </Button>
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100">
                                     <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                        <Link href={`/dashboard/print/chat/${convo.id}`} target="_blank">
                                            <FileDown className="h-4 w-4 text-muted-foreground" />
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete this chat conversation. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDeleteChat(convo.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
