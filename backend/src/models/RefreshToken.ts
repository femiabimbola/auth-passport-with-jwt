// src/models/RefreshToken.ts
import { Schema, model, Document, Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

interface IRefreshToken extends Document {
  tokenHash: string;
  user:Types.ObjectId;
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
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

// Updated Create Token: Sends "id:plainToken"
refreshTokenSchema.statics.createToken = async function (userId: string): Promise<string> {
  const token = uuidv4();
  const tokenHash = await bcrypt.hash(token, 12);

  // We create a doc and let MongoDB generate an _id
  const doc = await this.create({
    tokenHash,
    user: userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  // Return "DatabaseID:PlainToken"
  return `${doc._id}:${token}`;
};


// Updated Verify Token: Efficient lookup
refreshTokenSchema.statics.verifyToken = async function (rawToken: string) {
  
  const [id, plainToken] = rawToken.split(':');

  if (!id || !plainToken) return null;

  // 1. Find the specific token by ID (Very fast indexed lookup)
  const storedToken = await this.findById(id);
  
  if (!storedToken || storedToken.expiresAt < new Date()) {
    return null;
  }

  // 2. Compare the hash only for this specific token
  const isMatch = await bcrypt.compare(plainToken, storedToken.tokenHash);
  return isMatch ? storedToken : null;
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
