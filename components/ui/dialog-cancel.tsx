"use client"

import type * as React from "react"
import { DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DialogCancelProps extends React.ComponentProps<typeof Button> {}

function DialogCancel({ className, children = "Cancel", ...props }: DialogCancelProps) {
  return (
    <DialogClose asChild>
      <Button variant="outline" className={cn("bg-transparent", className)} {...props}>
        {children}
      </Button>
    </DialogClose>
  )
}

export { DialogCancel }
