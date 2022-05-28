import { ControllerFn } from 'src/types';

const signupGET: ControllerFn = (req, res, next) => {
  res.render('auth-form');
};

const loginGET: ControllerFn = (req, res, next) => {
  res.render('auth-form');
};

const signupPOST: ControllerFn = (req, res, next) => {};

const loginPOST: ControllerFn = (req, res, next) => {};

export { signupGET, loginGET, signupPOST, loginPOST };
