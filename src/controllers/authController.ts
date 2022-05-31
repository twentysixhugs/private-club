import { MiddlewareFn, ExpressSession } from 'src/types';
import User from '../models/User';
import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import {
  body,
  validationResult,
  ValidationChain,
} from 'express-validator';

const signupGET: MiddlewareFn = (req, res, next) => {
  if (!req.user) {
    return res.render('auth-form', {
      authAction: 'Sign up',
      title: 'Sign up',
    });
  }
  return res.redirect('/');
};

const signupPOST = (() => {
  const signupController: MiddlewareFn = async (req, res, next) => {
    const errors = await validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('auth-form', {
        authAction: 'Sign up',
        errors: errors.mapped(),
        username: req.body.username,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = new User({
        username: req.body.username,
        usernameLowercased: req.body.username.toLowerCase(),
        password: hashedPassword,
        membership: 'none',
        avatar: req.body.avatar,
      });

      await user.save();

      next();
    } catch (err) {
      return next(err);
    }
  };

  const validationChain: ValidationChain[] = [
    body('username')
      .trim()
      .escape()
      .not()
      .isEmpty()
      .withMessage('Username is required')
      .isAlphanumeric()
      .withMessage('Username must contain only letters and numbers')
      .custom(async (value) => {
        let userCheck = await User.findOne({
          usernameLowercased: value.toLowerCase(),
        });

        if (userCheck !== null) {
          return Promise.reject();
        }
      })
      .withMessage('This username already exists'),
    body('password')
      .not()
      .isEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password should be at least 6 characters long'),
    body('passwordConfirm')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
    body('avatar')
      .custom(
        (value) => value >= 1 && value <= 5 && typeof value === 'string',
      )
      .withMessage('Are you a hacker?'),
  ];

  return [
    ...validationChain,
    signupController,
    passport.authenticate('local', {
      failureRedirect: '/sign-up',
      successRedirect: '/',
    }),
  ];
})();

const loginGET: MiddlewareFn = (req, res, next) => {
  if (!req.user) {
    return res.render('auth-form', {
      authAction: 'Log in',
      title: 'Log in',
      incorrectPasswordMsg: (req.session as ExpressSession).messages?.[0],
    });
  }

  return res.redirect('/');
};

const loginPOST = (() => {
  const loginController: MiddlewareFn = async (req, res, next) => {
    const errors = await validationResult(req);

    (req.session as ExpressSession).messages = undefined;

    if (!errors.isEmpty()) {
      return res.render('auth-form', {
        authAction: 'Log in',
        errors: errors.mapped(),
        username: req.body.username,
        password: req.body.password,
      });
    }

    next();
  };

  const validationChain: ValidationChain[] = [
    body('username')
      .trim()
      .escape()
      .not()
      .isEmpty()
      .withMessage('Username is required')
      .custom(async (value) => {
        let userCheck = await User.findOne({
          usernameLowercased: value.toLowerCase(),
        });

        if (!userCheck) {
          // if the user is not found
          return Promise.reject();
        }
      })
      .withMessage('User not found'),
    body('password').not().isEmpty().withMessage('Password is required'),
  ];

  return [
    ...validationChain,
    loginController,
    passport.authenticate('local', {
      failureRedirect: '/log-in',
      failureMessage: true,
      successRedirect: '/',
    }),
  ];
})();

const logoutPOST: MiddlewareFn = (req, res, next) => {
  type LogoutFunction = (cb: (err: Error) => void) => void;

  (req.logout as LogoutFunction)((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};
export { signupGET, loginGET, signupPOST, loginPOST, logoutPOST };
