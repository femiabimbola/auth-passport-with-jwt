export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  // The active, non-expired refresh token ID for this user.
  // In a real application, this would track multiple tokens (one per device).
  activeRefreshTokenId?: string;
}
