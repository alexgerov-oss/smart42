import { useCallback, useState } from "react"
import type { Controller } from "@/lib/core/types"
import {
  addControllerCore,
  updateControllerCore,
  removeControllerCore,
  updateControllerStatusCore,
  getActiveControllerCore,
  markControllerRestartingCore,
} from "@/lib/core/controllers"

export function useControllersState(params: {
  canOperate: boolean
}): {
  controllers: Controller[]
  addController: (serialNumber: string, ip?: string) => boolean
  updateController: (id: string, serialNumber: string, ip?: string) => boolean
  removeController: (id: string) => void
  updateControllerStatus: (id: string, status: "online" | "offline") => void
  getActiveController: () => Controller | null
  restartController: (id: string) => void
} {
  const { canOperate } = params
  const [controllers, setControllers] = useState<Controller[]>([])

  const addController = useCallback(
    (serialNumber: string, ip?: string): boolean => {
      if (!canOperate) return false
      const result = addControllerCore(controllers, serialNumber, ip)
      if (!result.ok) return false
      setControllers(result.next)
      return true
    },
    [canOperate, controllers],
  )

  const updateController = useCallback(
    (id: string, serialNumber: string, ip?: string): boolean => {
      if (!canOperate) return false
      const result = updateControllerCore(controllers, id, serialNumber, ip)
      if (!result.ok) return false
      setControllers(result.next)
      return true
    },
    [canOperate, controllers],
  )

  const removeController = useCallback(
    (id: string) => {
      if (!canOperate) return
      setControllers((prev) => removeControllerCore(prev, id))
    },
    [canOperate],
  )

  const updateControllerStatus = useCallback(
    (id: string, status: "online" | "offline") => {
      if (!canOperate) return
      setControllers((prev) => updateControllerStatusCore(prev, id, status))
    },
    [canOperate],
  )

  const getActiveController = useCallback((): Controller | null => {
    return getActiveControllerCore(controllers)
  }, [controllers])

  const restartController = useCallback(
    (id: string) => {
      if (!canOperate) return

      setControllers((prev) => markControllerRestartingCore(prev, id, true))

      setTimeout(() => {
        setControllers((prev) => updateControllerStatusCore(markControllerRestartingCore(prev, id, false), id, "online"))
      }, 5000)
    },
    [canOperate],
  )

  return { controllers, addController, updateController, removeController, updateControllerStatus, getActiveController, restartController }
}
