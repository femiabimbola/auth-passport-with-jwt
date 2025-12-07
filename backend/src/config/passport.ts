// src/config/passport.ts

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';
import { verifyAccessToken } from '../utils/token';

const { JWT_ACCESS_SECRET } = process.env;

if (JWT_ACCESS_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined in environment');
}

// Local Strategy (email/password login)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch)
          return done(null, false, { message: 'Invalid credentials' });

        return done(null, { id: user._id, email: user.email });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT Strategy (for protected routes)
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_ACCESS_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.sub);
      if (user) {
        return done(null, { id: user._id, email: user.email });
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
