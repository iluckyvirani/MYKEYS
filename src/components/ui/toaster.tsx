"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:flex-col md:max-w-105">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <div
          key={id}
          className="animate-in slide-in-from-top-full sm:slide-in-from-bottom-full mb-2"
        >
          <Toast
            variant={variant}
            onClose={() => dismiss(id)}
            {...props}
          >
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </Toast>
        </div>
      ))}
    </div>
  )
}
