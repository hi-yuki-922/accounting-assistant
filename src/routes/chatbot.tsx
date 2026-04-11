import { createFileRoute } from '@tanstack/react-router'

import { ChatbotPage } from '@/pages/chatbot/chatbot-page'

const ChatbotRoute = () => <ChatbotPage />

export const Route = createFileRoute('/chatbot')({
  component: ChatbotRoute,
})
