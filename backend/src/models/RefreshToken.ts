// src/models/RefreshToken.ts
import { Schema, model, Document, Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

interface IRefreshToken extends Document {
  tokenHash: string;
  // user: Schema.Types.ObjectId;
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
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    //   index: true,
    // },
    // user: Types.ObjectId, // Use Types, not Schema.Types
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
  
  //   // Convert string to ObjectId if needed
  // const userObjectId =
  //   typeof userId === 'string' ? new Schema.Types.ObjectId(userId) : userId;

  // const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;


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






// Static: Generate and save a new refresh token (returns plain token)

// refreshTokenSchema.statics.createToken = async function (
//   this: typeof RefreshToken,
//   userId: string | Schema.Types.ObjectId
// ): Promise<string> {
//   const token = uuidv4();
//   const tokenHash = await bcrypt.hash(token, 12);

//   const expiresAt = new Date();
//   const days = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10);
//   expiresAt.setDate(expiresAt.getDate() + days);

//   // Convert string to ObjectId if needed
//   const userObjectId =
//     typeof userId === 'string' ? new Schema.Types.ObjectId(userId) : userId;

//   await this.create({
//     tokenHash,
//     user: userObjectId, // now properly typed
//     expiresAt,
//   });

//   return token; // return plain token to send in cookie
// };

// Static: Verify a plain refresh token
// todo: this could better by adding a separate plain → hash lookup (e.g., using Redis)

// refreshTokenSchema.statics.verifyToken = async function (
//   token: string
// ): Promise<IRefreshToken | null> {
//   // 1. Fetch only tokens that haven't expired yet
//   const tokens = await this.find({ expiresAt: { $gt: new Date() } }); // only non-expired

//   console.log(tokens)
//   // 2. Iterate and compare hashes
//   for (const doc of tokens) {
//     const match = await bcrypt.compare(token, doc.tokenHash);
//     if (match) {
//       return doc;
//     }
//   }
//   return null;
// };

//Optimized

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
