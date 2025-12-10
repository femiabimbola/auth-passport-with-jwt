// src/config/passport.ts

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User';
import { verifyAccessToken } from '../utils/token';

// const { JWT_ACCESS_SECRET } = process.env;

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

if (!JWT_ACCESS_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined in environment');
}

// Local Strategy (email/password login)
// Export a function that configures the passed passport instance
const configurePassport = (passportInstance: typeof passport) => {
  // Local Strategy (email/password login)
  passportInstance.use(
    'local', // explicitly name it 'local'
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user)
            return done(null, false, { message: 'Invalid credentials' });

          const isMatch = await user.comparePassword(password);
          if (!isMatch)
            return done(null, false, { message: 'Invalid credentials' });

          // Return minimal user info (avoid sending full user object)
          return done(null, { id: user._id, email: user.email });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};

// JWT Strategy (for protected routes)
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_ACCESS_SECRET,
  // Optional: add these for better security/control
  // issuer: 'your-app-name',
  // audience: 'your-app-client',
  // passReqToCallback: true, // if you want access to `req` in verify callback
};

passport.use(
  'jwt',
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

export default configurePassport;
