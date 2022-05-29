import * as createError from 'http-errors';
import * as express from 'express';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as mongoose from 'mongoose';
import * as passport from 'passport';
import * as session from 'express-session';
import * as bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';
import 'dotenv/config';

import indexRouter from './routes/index';
import authRouter from './routes/auth';

import { ResponseError, ExpressUser } from './types';
import User from './models/User';

const app = express();

const mongoDB = String(process.env.DBCONNECTION);
mongoose.connect(mongoDB);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Auth setup

app.use(
  session({
    secret: process.env.SESSIONSECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }).exec((err, user) => {
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
    });
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

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (
  err: ResponseError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
