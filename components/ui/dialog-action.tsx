"use client"

import type * as React from "react"
import { DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DialogActionProps extends React.ComponentProps<typeof Button> {
  closeOnClick?: boolean
}

function DialogAction({ className, children = "Confirm", closeOnClick = true, ...props }: DialogActionProps) {
  if (closeOnClick) {
    return (
      <DialogClose asChild>
        <Button className={className} {...props}>
          {children}
        </Button>
      </DialogClose>
    )
  }

  return (
    <Button className={className} {...props}>
      {children}
    </Button>
  )
}

export { DialogAction }
