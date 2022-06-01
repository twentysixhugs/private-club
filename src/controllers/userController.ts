import {
  ValidationChain,
  body,
  validationResult,
} from 'express-validator';
import { HydratedDocument } from 'mongoose';
import User, { IUser } from '../models/User';
import { MiddlewareFn } from '../types';

const membershipGET: MiddlewareFn = (req, res, next) => {
  const isAdmin =
    (req.user as HydratedDocument<IUser>).membership.toLowerCase() ===
    'admin';
  const isMember =
    (req.user as HydratedDocument<IUser>).membership.toLowerCase() ===
    'member';

  const isParamAdmin = req.params.membership.toLowerCase() === 'admin';
  const isParamMember = req.params.membership.toLowerCase() === 'member';

  const isValidParam = isParamAdmin || isParamMember;

  if (
    isValidParam &&
    ((isMember && !isAdmin && isParamAdmin) || (!isMember && !isAdmin))
  ) {
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
        try {
          await (req.user as HydratedDocument<IUser>).save();

          return res.render('success', {
            title: 'Membership',
            membership: 'member',
          });
        } catch (err) {
          return next(err);
        }
      }

      if (
        req.params.membership.toLowerCase() === 'admin' &&
        req.body.secretWord === process.env.SECRETWORDADMIN
      ) {
        (req.user as HydratedDocument<IUser>).membership = 'admin';
        try {
          await (req.user as HydratedDocument<IUser>).save();

          return res.render('success', {
            title: 'Membership',
            membership: 'admin',
          });
        } catch (err) {
          return next(err);
        }
      }

      return res.render('membership', {
        title: `Become ${req.params.membership.toLowerCase()}`,
        incorrectWordMsg: `${
          req.params.membership === 'member'
            ? "That's not right. Try to log out and see introductory that message again :)"
            : "Well, that's not right"
        }`,
      });
    },
  ];

  return [...validationChain, ...middlewareChain];
})();

export { membershipGET, membershipPOST };
