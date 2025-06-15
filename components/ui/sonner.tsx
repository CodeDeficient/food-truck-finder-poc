"use client"

// @ts-expect-error TS(2792): Cannot find module 'next-themes'. Did you mean to ... Remove this comment to see the full error message
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

// @ts-expect-error TS(2456): Type alias 'ToasterProps' circularly references it... Remove this comment to see the full error message
type ToasterProps = React.ComponentProps<typeof Sonner>

// @ts-expect-error TS(7022): 'Toaster' implicitly has type 'any' because it doe... Remove this comment to see the full error message
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
