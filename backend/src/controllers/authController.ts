import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import RefreshToken from '../models/RefreshToken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token';
import { v4 as uuidv4 } from 'uuid';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  // 1. Check for validation errors (add express-validator middleware before this)
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   res
  //     .status(400)
  //     .json({ message: 'Validation failed', errors: errors.array() });
  //   return;
  // }

  const { email, password } = req.body;

  try {
    // 2. Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    // 3. Create user — password will be hashed automatically by pre-save hook
    const user: IUser = new User({
      email: email.toLowerCase().trim(),
      password, // pre-save hook handles hashing
    });

    await user.save(); // This triggers the pre('save') hook

    // 4. Don't return the full user object (security: never send password hash!)
    const userResponse = {
      id: user._id,
      email: user.email,
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
    });
  } catch (err: any) {
    // 5. Handle specific Mongoose errors gracefully
    if (err.code === 11000) {
      // Duplicate key error (in case of race condition)
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    if (err.name === 'ValidationError') {
      res.status(400).json({ message: 'Invalid data', errors: err.errors });
      return;
    }

    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  const user = req.user as { id: string; email: string };

  const accessToken = generateAccessToken({ sub: user.id });
  const refreshToken = generateRefreshToken({ sub: user.id, jti: uuidv4() });

  // Save refresh token to DB
  // await RefreshToken.create({
  //   token: refreshToken,
  //   user: user.id,
  //   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  // });

  const plainRefreshToken = await RefreshToken.createToken(user.id);

  res.cookie('refreshToken', plainRefreshToken, COOKIE_OPTIONS);
  res.json({ accessToken });
};

// Refresh Token
export const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  let decoded: any;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  // Find the stored refresh token entry for this user that matches the incoming token
  const storedToken = await RefreshToken.findOne({
    user: decoded.sub,
    expiresAt: { $gt: new Date() }, // not expired
  });

  // Case 1: No matching valid token found
  if (!storedToken) {
    // Possible token reuse or already rotated → revoke all just in case
    await RefreshToken.deleteMany({ user: decoded.sub });
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    return res
      .status(401)
      .json({ message: 'Invalid or expired refresh token' });
  }

  // Case 2: Critical — verify the plain token matches the stored hash
  const isMatch = await bcrypt.compare(oldRefreshToken, storedToken.tokenHash);
  if (!isMatch) {
    // Token reuse detected! Someone is using a stolen token
    await RefreshToken.deleteMany({ user: decoded.sub });
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    // Optional: trigger security alert
    return res
      .status(401)
      .json({ message: 'Token reuse detected - all sessions revoked' });
  }

  // Token is valid → rotate it
  await storedToken.deleteOne(); // remove old one

  // Generate new tokens
  const newAccessToken = generateAccessToken({ sub: decoded.sub });
  const newRefreshToken = generateRefreshToken({
    sub: decoded.sub,
    jti: uuidv4(),
  });

  // Store new hashed refresh token
  await RefreshToken.createToken(decoded.sub); // uses your static method

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
  return res.json({ accessToken: newAccessToken });
};

// Logout
export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await RefreshToken.findOneAndUpdate(
      { token: refreshToken },
      { isValid: false }
    );
  }
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.json({ message: 'Logged out' });
};

// Get Profile (protected)
export const me = (req: Request, res: Response) => {
  res.json({ user: req.user });
};
