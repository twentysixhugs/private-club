import * as passport from 'passport';
import * as bcrypt from 'bcrypt';

import { Strategy as LocalStrategy } from 'passport-local';

import User from '../models/User';
import { ExpressUser } from '../types';

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ usernameLowercased: username.toLowerCase() }).exec(
      (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return done(err);
          }

          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password' });
          }
        });
      },
    );
  }),
);

passport.serializeUser((user, done) => {
  done(null, (user as ExpressUser).id);
});

passport.deserializeUser((id, done) => {
  User.findById(id as string).exec((err, user) => {
    done(err, user);
  });
});

export default passport;
