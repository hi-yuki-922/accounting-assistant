import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner.tsx'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'

const RootComponent = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
        <TanStackRouterDevtools />
      </div>
      <Toaster />
    </TooltipProvider>
  </ThemeProvider>
)

export const Route = createRootRoute({
  component: RootComponent,
})
