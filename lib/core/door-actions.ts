import { Api } from "./api"

export const doorActions = {
  lock: (doorId: string) => Api.lockDoor(doorId),
  unlock: (doorId: string) => Api.unlockDoor(doorId),
}

