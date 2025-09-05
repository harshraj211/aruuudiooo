
'use client';
import { ChatContainer } from "@/components/dashboard/chatbot/ChatContainer";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useState } from "react";


export default function ChatbotPage() {
    const { t } = useTranslation();
    const [managementType, setManagementType] = useState<'Crops' | 'Fruits' | 'General'>('General');

    useEffect(() => {
        if (document.referrer.includes('/dashboard/crops')) {
            setManagementType('Crops');
        } else if (document.referrer.includes('/dashboard/fruits')) {
            setManagementType('Fruits');
        }
    }, []);

    const pageTitle = managementType === 'General' 
        ? t('chatbotPage.title') 
        : `${t('chatbotPage.title')} for ${managementType}`;
        
    const pageDescription = managementType === 'General'
        ? t('chatbotPage.description')
        : `Your AI expert for ${managementType.toLowerCase()} farming.`;


    return (
        <main className="h-[calc(100vh-5rem)]">
             <div className="mb-4 space-y-2">
                <h1 className="text-3xl font-bold">{pageTitle}</h1>
                <p className="text-muted-foreground">
                    {pageDescription}
                </p>
            </div>
            <ChatContainer managementType={managementType} />
        </main>
    )
}
