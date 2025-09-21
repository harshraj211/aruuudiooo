
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Conversation, Message } from '@/lib/chat-types';
import { Logo } from '@/components/Logo';
import Image from 'next/image';
import { Bot, User, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';


const CHAT_HISTORY_KEY = 'agriVision-chatHistory';

export default function PrintChatPage() {
    const params = useParams();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);

    useEffect(() => {
        if (params.id) {
            const storedHistory = localStorage.getItem(`${CHAT_HISTORY_KEY}-farmer@example.com`);
            if (storedHistory) {
                const conversations: Conversation[] = JSON.parse(storedHistory);
                const foundConversation = conversations.find(c => c.id === params.id);
                setConversation(foundConversation || null);
            }
        }
        setLoading(false);
    }, [params.id]);
    
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `eKheti - Chat Report - ${conversation?.title || 'Conversation'}`,
    });

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!conversation) {
        return <div className="p-8 text-center text-red-500">Could not find conversation.</div>;
    }

    const renderMessageContent = (message: Message) => (
        <div
            className={cn(
                'max-w-[85%] rounded-lg p-3 text-sm relative group',
                message.role === 'user'
                    ? 'bg-primary/10 text-primary-foreground'
                    : 'bg-secondary'
            )}
        >
            {message.imagePreview && (
                <div className='mb-2'>
                    <p className='text-xs text-muted-foreground mb-1'>[Image Attached]</p>
                    <Image src={message.imagePreview} alt="User upload" width={200} height={150} className="rounded-md" />
                </div>
            )}
            {message.document && (
                <div className="mb-2 p-2 rounded-md bg-black/5">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        <span className="font-semibold truncate">{message.document.name}</span>
                    </div>
                </div>
            )}
             <div className="prose prose-sm max-w-none text-inherit prose-p:my-0 prose-ul:my-0 prose-li:my-0 prose-strong:text-inherit">
                <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen">
             <header className="bg-white p-4 print:hidden flex justify-between items-center sticky top-0 z-10 border-b">
                <h1 className="text-lg font-bold">Print Chat Report</h1>
                <Button onClick={handlePrint}>Print or Save as PDF</Button>
            </header>
            <main ref={printRef} className="p-8 bg-white max-w-4xl mx-auto">
                <header className="flex justify-between items-center pb-4 border-b mb-8">
                    <Logo />
                    <div className='text-right'>
                        <h1 className="text-2xl font-bold">Chat Report</h1>
                        <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
                    </div>
                </header>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold">{conversation.title}</h2>
                    <p className="text-sm text-muted-foreground">
                        Conversation from {new Date(conversation.createdAt).toLocaleString()}
                    </p>
                     <p className="text-sm text-muted-foreground">
                        User: Pro Farmer (farmer@example.com)
                    </p>
                </div>
                
                <div className="space-y-6">
                    {conversation.messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                            {message.role === 'assistant' && (
                                <Avatar className="h-8 w-8 bg-primary text-primary-foreground print:bg-gray-200">
                                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            {renderMessageContent(message)}
                            {message.role === 'user' && (
                                <Avatar className="h-8 w-8 print:bg-gray-200">
                                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
