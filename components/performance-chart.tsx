"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts"

export default function PerformanceChart() {
  const [data, setData] = useState<Array<{ time: string; value: number }>>([])

  useEffect(() => {
    // Generate initial data
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: `${i}s`,
      value: Math.floor(Math.random() * 40) + 20,
    }))
    setData(initialData)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: `${prev.length}s`,
            value: Math.floor(Math.random() * 40) + 20,
          },
        ]
        return newData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="time"
            stroke="oklch(0.60 0.02 264)"
            tick={{ fill: "oklch(0.60 0.02 264)", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis stroke="oklch(0.60 0.02 264)" tick={{ fill: "oklch(0.60 0.02 264)", fontSize: 12 }} tickLine={false} />
          <Line type="monotone" dataKey="value" stroke="oklch(0.65 0.24 195)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
