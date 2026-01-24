"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ModalSelectorOption {
  value: string
  label: string
}

interface ModalSelectorProps {
  value: string
  onValueChange: (value: string) => void
  options: ModalSelectorOption[]
  placeholder?: string
  label: string
  triggerClassName?: string
}

export function ModalSelector({
  value,
  onValueChange,
  options,
  placeholder,
  label,
  triggerClassName,
}: ModalSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = selectedOption?.label || placeholder || "Select..."

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 text-sm",
          "border-2 border-muted bg-background/50 rounded-md",
          "hover:bg-accent/50 active:bg-accent transition-colors",
          "text-left font-normal",
          !selectedOption && "text-muted-foreground",
          triggerClassName,
        )}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <div className="space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md hover:bg-accent transition-colors",
                    option.value === value && "bg-accent",
                  )}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
