import { MiddlewareFn } from 'src/types';
import Message from '../models/Message';
import { IUser } from '../models/User';
import {
  ValidationChain,
  validationResult,
  body,
} from 'express-validator';
import { HydratedDocument } from 'mongoose';

const messageGET: MiddlewareFn = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/log-in');
  }

  return res.render('message-form', { title: 'New message' });
};

const messagePOST = (() => {
  const middlewareChain: MiddlewareFn[] = [
    (req, res, next) => {
      if (!req.user) {
        return res.redirect('/log-in');
      }

      return next();
    },
    async (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.render('message-form', {
          title: 'New message',
          errors: errors.mapped(),
        });
      }

      const message = new Message({
        text: req.body.message,
        user: (req.user as HydratedDocument<IUser>).id,
        date: new Date(),
      });

      try {
        await message.save();

        return res.redirect('/');
      } catch (err) {
        return next(err);
      }
    },
  ];

  const validationChain: ValidationChain[] = [
    body('message')
      .trim()
      .escape()
      .isLength({ min: 1 })
      .withMessage(
        'You cannot send an empty message, or filled with spaces only. Why not try to write something? :)',
      ),
  ];

  return [...validationChain, ...middlewareChain];
})();

export { messageGET, messagePOST };
