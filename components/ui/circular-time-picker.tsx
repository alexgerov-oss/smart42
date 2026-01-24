"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CircularTimePickerProps {
  hour: string
  minute: string
  period: "AM" | "PM"
  onTimeChange: (hour: string, minute: string, period: "AM" | "PM") => void
  label: string
  disabled?: boolean
}

export function CircularTimePicker({
  hour,
  minute,
  period,
  onTimeChange,
  label,
  disabled = false,
}: CircularTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [tempHour, setTempHour] = useState(hour)
  const [tempMinute, setTempMinute] = useState(minute)
  const [tempPeriod, setTempPeriod] = useState<"AM" | "PM">(period)
  const [mode, setMode] = useState<"hour" | "minute">("hour")

  const hours = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"))

  const handleOpen = () => {
    if (disabled) return
    setTempHour(hour)
    setTempMinute(minute)
    setTempPeriod(period)
    setMode("hour")
    setOpen(true)
  }

  const handleSet = () => {
    onTimeChange(tempHour, tempMinute, tempPeriod)
    setOpen(false)
  }

  const handleNumberClick = (value: string) => {
    if (mode === "hour") {
      setTempHour(value)
      setMode("minute")
    } else {
      setTempMinute(value)
    }
  }

  const renderClock = () => {
    const numbers = mode === "hour" ? hours : minutes
    const radius = 90
    const centerX = 120
    const centerY = 120

    return (
      <div className="relative w-[240px] h-[240px] mx-auto">
        <svg className="absolute inset-0 w-full h-full">
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          <circle cx={centerX} cy={centerY} r="4" fill="currentColor" className="text-primary" />
        </svg>

        {numbers.map((num, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180)
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          const isSelected = mode === "hour" ? num === tempHour : num === tempMinute

          return (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"
              }`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
              }}
            >
              {num}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground text-center block">{label}</Label>
      <div className="flex items-center gap-2">
        <button
          onClick={handleOpen}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 rounded-md border border-border transition-colors ${
            disabled ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" : "bg-background hover:bg-muted"
          }`}
        >
          <span className="text-sm font-medium">
            {hour}:{minute} {period}
          </span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px] p-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold">
                {tempHour}:{tempMinute}
              </div>
              <div className="text-sm text-muted-foreground">{mode === "hour" ? "Select hour" : "Select minute"}</div>
            </div>

            {renderClock()}

            <div className="flex items-center justify-center gap-2">
              <Label className="text-sm">Period:</Label>
              <Select value={tempPeriod} onValueChange={(val: "AM" | "PM") => setTempPeriod(val)}>
                <SelectTrigger className="w-20 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setMode(mode === "hour" ? "minute" : "hour")}
              >
                Switch to {mode === "hour" ? "minute" : "hour"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSet} className="w-full">
              SET
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
