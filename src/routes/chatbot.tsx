import { createFileRoute } from '@tanstack/react-router'

import { AppLayout } from '@/components/layouts/app-layout'
import { ChatbotPage } from '@/pages/chatbot/chatbot-page.tsx'

export const Route = createFileRoute('/chatbot')({
  component: () => (
    <AppLayout>
      <ChatbotPage />
    </AppLayout>
  ),
})
