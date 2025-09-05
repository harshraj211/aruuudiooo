
'use client';
import { ChatContainer } from "@/components/dashboard/chatbot/ChatContainer";

export default function CropChatbotPage() {
    return (
        <main className="h-[calc(100vh-5rem)]">
             <div className="mb-4 space-y-2">
                <h1 className="text-3xl font-bold">Crop Chat Assistant</h1>
                <p className="text-muted-foreground">
                    Your AI expert for crop farming. Ask anything about your field crops.
                </p>
            </div>
            <ChatContainer managementType="Crops" />
        </main>
    )
}
