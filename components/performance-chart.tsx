"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type ChartPoint = {
  time: string
  value: number
}

const data: ChartPoint[] = [
  { time: "00:00", value: 28 },
  { time: "02:00", value: 32 },
  { time: "04:00", value: 30 },
  { time: "06:00", value: 35 },
  { time: "08:00", value: 38 },
  { time: "10:00", value: 33 },
  { time: "12:00", value: 36 },
  { time: "14:00", value: 40 },
  { time: "16:00", value: 37 },
  { time: "18:00", value: 34 },
  { time: "20:00", value: 31 },
  { time: "22:00", value: 29 },
]

export function PerformanceChart() {
  return (
    <Card className="bg-card border-border p-4">
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
