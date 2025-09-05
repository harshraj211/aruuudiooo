
'use client';
import { ChatContainer } from "@/components/dashboard/chatbot/ChatContainer";

export default function FruitChatbotPage() {
    return (
        <main className="h-[calc(100vh-5rem)]">
             <div className="mb-4 space-y-2">
                <h1 className="text-3xl font-bold">Fruit Chat Assistant</h1>
                <p className="text-muted-foreground">
                    Your AI expert for fruit farming. Ask anything about your orchards.
                </p>
            </div>
            <ChatContainer managementType="Fruits" />
        </main>
    )
}
