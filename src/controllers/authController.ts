import { ControllerFn } from 'src/types';

const signupGET: ControllerFn = (req, res, next) => {
  res.render('auth-form', { authAction: 'Sign up', title: 'Sign up' });
};

const loginGET: ControllerFn = (req, res, next) => {
  res.render('auth-form', { authAction: 'Log in', title: 'Log in' });
};
};

const signupPOST: ControllerFn = (req, res, next) => {};

const loginPOST: ControllerFn = (req, res, next) => {};

export { signupGET, loginGET, signupPOST, loginPOST };
