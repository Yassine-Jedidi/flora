"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-pink-50 group-[.toaster]:text-[#9D174D] group-[.toaster]:border-pink-100 group-[.toaster]:shadow-xl group-[.toaster]:rounded-3xl group-[.toaster]:font-sans group-[.toaster]:p-4",
          title: "group-[.toast]:text-[#9D174D] group-[.toast]:font-black text-sm",
          description: "group-[.toast]:!text-black group-[.toast]:!opacity-100 group-[.toast]:font-bold group-[.toast]:text-xs mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toaster]:rounded-full",
          cancelButton:
            "group-[.toast]:bg-pink-100 group-[.toast]:text-pink-600",
          success: "group-[.toast]:bg-pink-50 group-[.toast]:text-[#9D174D] group-[.toast]:border-pink-200",
          info: "group-[.toast]:bg-pink-50 group-[.toast]:text-[#9D174D] group-[.toast]:border-pink-100",
          error: "group-[.toast]:bg-red-50 group-[.toast]:text-red-500 group-[.toast]:border-red-100",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-pink-500" />,
        info: <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin text-pink-500" />,
      }}
      style={
        {
          "--normal-bg": "#FFF5F8",
          "--normal-text": "#9D174D",
          "--normal-border": "#fce7f3",
          "--border-radius": "1.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
