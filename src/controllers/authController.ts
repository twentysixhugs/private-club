import { ControllerFn } from 'src/types';
import User from '../models/User';
import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import {
  body,
  validationResult,
  ValidationChain,
} from 'express-validator';

const signupGET: ControllerFn = (req, res, next) => {
  res.render('auth-form', { authAction: 'Sign up', title: 'Sign up' });
};

const signupPOST = (() => {
  const signupController: ControllerFn = async (req, res, next) => {
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
        password: hashedPassword,
        membership: 'none',
        avatar: '1',
      });

      await user.save();

      next();
    } catch (err) {
      return next(err);
    }
  };

  const validationChain: ValidationChain[] = [
    body('username')
      .isAlphanumeric()
      .withMessage('Username must contain only letters and numbers')
      .not()
      .isEmpty()
      .withMessage('Username is required')
      .custom(async (value) => {
        let userCheck = await User.findOne({ username: value });

        if (userCheck !== null) {
          return Promise.reject();
        }
      })
      .withMessage('This username already exists')
      .escape()
      .trim(),
    body('password')
      .not()
      .isEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password should be at least 6 characters long'),
    body('passwordConfirm')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match'),
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

const loginGET: ControllerFn = (req, res, next) => {
  res.render('auth-form', { authAction: 'Log in', title: 'Log in' });
};

const loginPOST = (() => {
  const loginController: ControllerFn = (req, res, next) => {};
  const validationChain: ValidationChain[] = [];

  return [...validationChain, loginController];
})();
export { signupGET, loginGET, signupPOST, loginPOST };
