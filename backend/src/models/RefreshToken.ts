// src/models/RefreshToken.ts
import { Schema, model, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

interface IRefreshToken extends Document {
  tokenHash: string;
  user: Schema.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  isExpired(): boolean;
}

interface RefreshTokenModel extends Model<IRefreshToken> {
  createToken(userId: Schema.Types.ObjectId | string): Promise<string>;
  verifyToken(token: string): Promise<IRefreshToken | null>;
  revokeToken(token: string): Promise<void>;
}

const refreshTokenSchema = new Schema<IRefreshToken, RefreshTokenModel>(
  {
    tokenHash: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true, // gives createdAt automatically
  }
);

// TTL Index: Auto-delete expired tokens after 0 seconds past expiry
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method
refreshTokenSchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

// Static: Generate and save a new refresh token (returns plain token)
refreshTokenSchema.statics.createToken = async function (
  this: typeof RefreshToken,
  userId: string | Schema.Types.ObjectId
): Promise<string> {
  const token = uuidv4();
  const tokenHash = await bcrypt.hash(token, 12);

  const expiresAt = new Date();
  const days = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10);
  expiresAt.setDate(expiresAt.getDate() + days);

  // Convert string to ObjectId if needed
  const userObjectId =
    typeof userId === 'string' ? new Schema.Types.ObjectId(userId) : userId;

  await this.create({
    tokenHash,
    user: userObjectId, // now properly typed
    expiresAt,
  });

  return token; // return plain token to send in cookie
};

// Static: Verify a plain refresh token
// todo: this could better by adding a separate plain → hash lookup (e.g., using Redis)
refreshTokenSchema.statics.verifyToken = async function (
  token: string
): Promise<IRefreshToken | null> {
  const tokens = await this.find({ expiresAt: { $gt: new Date() } }); // only non-expired

  for (const doc of tokens) {
    const match = await bcrypt.compare(token, doc.tokenHash);
    if (match) {
      return doc;
    }
  }
  return null;
};

// Optional: Explicit revoke (in case of logout or reuse detection)
refreshTokenSchema.statics.revokeToken = async function (
  token: string
): Promise<void> {
  const result = await this.verifyToken(token);
  if (result) {
    await result.deleteOne();
  }
};

const RefreshToken = model<IRefreshToken, RefreshTokenModel>(
  'RefreshToken',
  refreshTokenSchema
);

export default RefreshToken;
