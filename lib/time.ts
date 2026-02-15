export function getNowActivityLabels() {
    const now = new Date()
  
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(now)
  
    const dateNumeric = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now)
  
    const dateTime24 = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(now)
      .replace(",", "")
  
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfThatDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  
    const dayLabel = (() => {
      const thisDay = startOfThatDay(now)
      if (thisDay === startOfToday) return "Today"
      if (thisDay === startOfToday - 24 * 60 * 60 * 1000) return "Yesterday"
      return dateNumeric
    })()
  
    return {
      time, // "05:15 PM"
      date: dayLabel, // "Today" | "Yesterday" | "18/12/2025"
      dateNumeric, // "18/12/2025"
      dateTime24, // "18/12/2025 17:15"
    }
  }
  