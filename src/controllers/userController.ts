import {
  ValidationChain,
  body,
  validationResult,
} from 'express-validator';
import { HydratedDocument } from 'mongoose';
import User, { IUser } from '../models/User';
import { MiddlewareFn } from '../types';

const membershipGET: MiddlewareFn = (req, res, next) => {
  const hasMembership =
    req.params.membership.toLowerCase() === 'admin' ||
    req.params.membership.toLowerCase() === 'member';

  console.log(req.user);

  if (hasMembership && req.user) {
    return res.render('membership', {
      title: `Become ${req.params.membership.toLowerCase()}`,
    });
  }

  return res.redirect('/log-in');
};

const membershipPOST = (() => {
  const validationChain: ValidationChain[] = [
    body('secretWord').trim().escape(),
  ];

  const middlewareChain: MiddlewareFn[] = [
    (req, res, next) => {
      if (!req.user) {
        return res.redirect('/');
      }

      next();
    },
    async (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.render('membership', {
          title: `Become ${req.params.membership.toLowerCase()}`,
          errors: errors.mapped(),
        });
      }

      if (
        req.params.membership.toLowerCase() === 'member' &&
        req.body.secretWord === process.env.SECRETWORDMEMBER
      ) {
        (req.user as HydratedDocument<IUser>).membership = 'member';
        await (req.user as HydratedDocument<IUser>).save();

        return res.render('success', {
          title: 'Membership',
          membership: 'member',
        });
      }

      if (
        req.params.membership.toLowerCase() === 'admin' &&
        req.body.secretWord === process.env.SECRETWORDADMIN
      ) {
        (req.user as HydratedDocument<IUser>).membership = 'admin';
        await (req.user as HydratedDocument<IUser>).save();

        return res.render('success', {
          title: 'Membership',
          membership: 'admin',
        });
      }

      return res.render('membership', {
        title: `Become ${req.params.membership.toLowerCase()}`,
        incorrectWordMsg: "That's not right",
      });
    },
  ];

  return [...validationChain, ...middlewareChain];
})();

export { membershipGET, membershipPOST };
