import * as createError from 'http-errors';
import * as express from 'express';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as logger from 'morgan';
import * as mongoose from 'mongoose';
import * as session from 'express-session';
import MongoStore = require('connect-mongo');
import 'dotenv/config';

import passport from './config/passport';

import indexRouter from './routes/index';
import authRouter from './routes/auth';
import membershipRouter from './routes/membership';
import messageRouter from './routes/message';

import { ResponseError } from './types';

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
    store: MongoStore.create({ mongoUrl: process.env.DBCONNECTION! }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000 * 24 * 180,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// routes
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/membership', membershipRouter);
app.use('/message', messageRouter);

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
