import { createFileRoute } from '@tanstack/react-router'

import { ChatbotPage } from '@/components/chatbot/chatbot-page'
import { AppLayout } from '@/components/layouts/app-layout'

export const Route = createFileRoute('/chatbot')({
  component: () => (
    <AppLayout>
      <ChatbotPage />
    </AppLayout>
  ),
})
