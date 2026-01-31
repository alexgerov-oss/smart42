// lib/core/roles.ts

export const ROLES = ["admin", "full_access", "open_close_only"] as const;
export type Role = (typeof ROLES)[number];

export function isAdmin(role: Role) {
  return role === "admin";
}

export function isFullAccess(role: Role) {
  return role === "full_access";
}

export function isOpenCloseOnly(role: Role) {
  return role === "open_close_only";
}
