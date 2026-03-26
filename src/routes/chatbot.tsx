import { createFileRoute } from '@tanstack/react-router'

import { ChatbotPage } from "@/pages/chatbot/chatbot-page.tsx"
import { AppLayout } from '@/components/layouts/app-layout'

export const Route = createFileRoute('/chatbot')({
  component: () => (
    <AppLayout>
      <ChatbotPage />
    </AppLayout>
  ),
})
