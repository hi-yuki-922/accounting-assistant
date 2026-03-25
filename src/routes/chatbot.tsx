import { createFileRoute } from '@tanstack/react-router'

import { ChatPageNew } from '@/components/chatbot/chat-page.new.tsx'
import { ChatbotPage } from '@/components/chatbot/chatbot-page'
import { AppLayout } from '@/components/layouts/app-layout'

export const Route = createFileRoute('/chatbot')({
  component: () => (
    <AppLayout>
      <ChatPageNew />
    </AppLayout>
  ),
})
