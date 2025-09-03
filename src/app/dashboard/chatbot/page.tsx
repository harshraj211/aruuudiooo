
'use client';
import { ChatContainer } from "@/components/dashboard/chatbot/ChatContainer";
import { useTranslation } from "@/hooks/useTranslation";


export default function ChatbotPage() {
    const { t } = useTranslation();
    return (
        <main className="h-[calc(100vh-5rem)]">
             <div className="mb-4 space-y-2">
                <h1 className="text-3xl font-bold">{t('chatbotPage.title')}</h1>
                <p className="text-muted-foreground">
                    {t('chatbotPage.description')}
                </p>
            </div>
            <ChatContainer />
        </main>
    )
}
