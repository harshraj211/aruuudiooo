
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { provideChatbotAdvisory, ProvideChatbotAdvisoryInput } from '@/ai/flows/provide-chatbot-advisory';
import { generateSpeechFromText } from '@/ai/flows/generate-speech-from-text';
import { ChatbotCard } from '../ChatbotCard';
import { ChatHistorySidebar } from './ChatHistorySidebar';
import type { Message, Conversation, DocumentAttachment } from '@/lib/chat-types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';


const CHAT_HISTORY_KEY = 'agriVision-chatHistory';

export function ChatContainer() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isSending, startSending] = useTransition();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const [audioState, setAudioState] = useState({
        isPlaying: false,
        isLoading: false,
        messageId: null as string | null,
    });
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    // Load chat history from localStorage on component mount
    useEffect(() => {
        if (user) {
            const storedHistory = localStorage.getItem(`${CHAT_HISTORY_KEY}-${user.email}`);
            if (storedHistory) {
                const loadedConversations: Conversation[] = JSON.parse(storedHistory);
                if(loadedConversations.length > 0) {
                    setConversations(loadedConversations.map(c => ({...c, createdAt: new Date(c.createdAt)})));
                    setActiveConversationId(loadedConversations[0].id);
                }
            }
        }
    }, [user]);

    // Save chat history to localStorage whenever it changes
    useEffect(() => {
        if (user && conversations.length > 0) {
            localStorage.setItem(`${CHAT_HISTORY_KEY}-${user.email}`, JSON.stringify(conversations));
        }
    }, [conversations, user]);


    const handleNewChat = () => {
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setIsSheetOpen(false);
    }
    
    const handleDeleteChat = (conversationId: string) => {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (activeConversationId === conversationId) {
            const remainingConversations = conversations.filter(c => c.id !== conversationId);
            setActiveConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
        }
    }
    
    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id);
        setIsSheetOpen(false);
    }

    const handleTextToSpeech = async (text: string, messageId: string) => {
        if (audioState.isPlaying && audioState.messageId === messageId) {
            audio?.pause();
            setAudioState({ isPlaying: false, isLoading: false, messageId: null });
            return;
        }

        setAudioState({ isPlaying: false, isLoading: true, messageId });
        try {
            const result = await generateSpeechFromText({ text });
            const audioData = result.audioDataUri;
            
            if (audioData) {
                const newAudio = new Audio(audioData);
                setAudio(newAudio);
                newAudio.play();
                setAudioState({ isPlaying: true, isLoading: false, messageId });
                newAudio.onended = () => {
                    setAudioState({ isPlaying: false, isLoading: false, messageId: null });
                };
            }
        } catch (error) {
            console.error("Error generating speech:", error);
            toast({
                variant: 'destructive',
                title: "Speech Error",
                description: "Could not generate audio for this message."
            });
            setAudioState({ isPlaying: false, isLoading: false, messageId: null });
        }
    };


    const handleSendMessage = (userMessage: Message, attachments: { image?: string | null, document?: DocumentAttachment | null }) => {
        let conversationId = activeConversationId;
        
        if (!conversationId) {
            const newConversation: Conversation = {
                id: Date.now().toString(),
                title: userMessage.text.substring(0, 30) || 'New Chat',
                messages: [],
                createdAt: new Date(),
            };
            setConversations(prev => [newConversation, ...prev]);
            conversationId = newConversation.id;
            setActiveConversationId(conversationId);
        }
        
        const currentConversationId = conversationId;

        setConversations(prev => prev.map(c => {
            if (c.id === currentConversationId) {
                const updatedMessages = [...c.messages, userMessage];
                return { 
                    ...c,
                    title: c.messages.length === 0 ? userMessage.document?.name || userMessage.text.substring(0, 30) : c.title,
                    messages: updatedMessages
                };
            }
            return c;
        }));


        startSending(async () => {
            try {
                const currentConversation = conversations.find(c => c.id === currentConversationId);
                const currentHistory = currentConversation?.messages.slice(-10) || [];

                const payload: ProvideChatbotAdvisoryInput = {
                    query: userMessage.text,
                    photoDataUri: attachments.image || undefined,
                    documentContent: attachments.document?.content || undefined,
                    history: currentHistory.map(m => ({
                        role: m.role,
                        text: m.text,
                    })),
                };

                const { advice } = await provideChatbotAdvisory(payload);
                const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: advice };

                setConversations(prev => prev.map(c => {
                    if (c.id === currentConversationId) {
                        return { ...c, messages: [...c.messages, assistantMessage] };
                    }
                    return c;
                }));

            } catch (err) {
                console.error("Error calling chatbot advisory flow:", err);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not get a response from the assistant. Please try again."
                });
                setConversations(prev => prev.map(c => {
                     if (c.id === currentConversationId) {
                        return { ...c, messages: c.messages.filter(m => m.id !== userMessage.id) };
                    }
                    return c;
                }));
            }
        });
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 h-full relative">
            <div className="absolute top-2 left-2 z-10 md:hidden">
                 <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <PanelLeft className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-full max-w-sm">
                        <ChatHistorySidebar
                            conversations={conversations}
                            activeConversationId={activeConversationId}
                            onSelectConversation={handleSelectConversation}
                            onNewChat={handleNewChat}
                            onDeleteChat={handleDeleteChat}
                        />
                    </SheetContent>
                </Sheet>
            </div>
            <ChatHistorySidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                className="hidden md:flex"
            />
            <div className="h-full">
                <ChatbotCard
                    conversation={activeConversation || null}
                    onMessage={handleSendMessage}
                    isSending={isSending}
                    onTextToSpeech={handleTextToSpeech}
                    audioState={audioState}
                />
            </div>
        </div>
    );
}
