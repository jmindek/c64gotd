// src/utils/user.ts

export function getOrCreateUserId(): string {
  let userId = localStorage.getItem('starUserId');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('starUserId', userId);
  }
  return userId;
}
