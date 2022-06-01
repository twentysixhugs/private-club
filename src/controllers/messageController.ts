import { MiddlewareFn } from 'src/types';
import Message from '../models/Message';
import { IUser } from '../models/User';
import {
  ValidationChain,
  validationResult,
  body,
} from 'express-validator';
import { HydratedDocument } from 'mongoose';
import profanityFilter from '../config/profanity-filter';

function hasCRUDPermission(user: HydratedDocument<IUser>) {
  const isMember = user.membership === 'member';
  const isAdmin = user.membership === 'admin';

  return isMember || isAdmin;
}

const messageFormGET: MiddlewareFn = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/log-in');
  }

  if (!hasCRUDPermission(req.user as HydratedDocument<IUser>)) {
    return res.redirect('/membership/member');
  }

  return res.render('message-form', { title: 'New message' });
};

const messageCreatePOST = (() => {
  const middlewareChain: MiddlewareFn[] = [
    (req, res, next) => {
      if (!req.user) {
        return res.redirect('/log-in');
      }

      if (!hasCRUDPermission(req.user as HydratedDocument<IUser>)) {
        return res.redirect('/membership/member');
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
        introductory: false,
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
      )
      .customSanitizer((value) => profanityFilter.clean(value)),
  ];

  return [...validationChain, ...middlewareChain];
})();

const messageDeletePOST: MiddlewareFn = async (req, res, next) => {
  if (req.user) {
    try {
      const message = await Message.findById(req.params.id).populate(
        'user',
      );

      if (!message) {
        return res.redirect('back');
      }

      const isDeletingOwnMessage =
        message.user.id === (req.user as HydratedDocument<IUser>).id;

      const isAdmin =
        (req.user as HydratedDocument<IUser>).membership === 'admin';

      if (isDeletingOwnMessage || isAdmin) {
        await Message.deleteOne({ _id: message.id });
      }
    } catch (err) {
      return next(err);
    }
  }

  return res.redirect('back');
};

const messageEditGET: MiddlewareFn = async (req, res, next) => {
  if (!req.user) {
    return res.redirect('/log-in');
  }

  if (!hasCRUDPermission(req.user as HydratedDocument<IUser>)) {
    return res.redirect('/membership/member');
  }

  const message = await Message.findOne({ _id: req.params.id }).populate(
    'user',
  );

  if (!message) {
    return res.redirect('/');
  }

  if (
    (req.user as HydratedDocument<IUser>).membership !== 'admin' &&
    message?.user.id !== (req.user as HydratedDocument<IUser>).id
  ) {
    return res.redirect('/membership/admin');
  }

  return res.render('message-form', {
    title: 'Edit message',
    message: message?.text,
  });
};

const messageEditPOST = (() => {
  const middlewareChain: MiddlewareFn[] = [
    (req, res, next) => {
      if (!req.user) {
        return res.redirect('/log-in');
      }

      if (!hasCRUDPermission(req.user as HydratedDocument<IUser>)) {
        return res.redirect('/membership/member');
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

      try {
        const message = await Message.findOne({
          _id: req.params.id,
        }).populate('user');

        if (
          (req.user as HydratedDocument<IUser>).membership !== 'admin' &&
          message?.user.id !== (req.user as HydratedDocument<IUser>).id
        ) {
          return res.redirect('/membership/admin');
        }

        if (!message) {
          return res.redirect('/');
        }

        message.text = req.body.message;

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
      )
      .customSanitizer((value) => profanityFilter.clean(value)),
  ];

  return [...validationChain, ...middlewareChain];
})();

export {
  messageFormGET,
  messageCreatePOST,
  messageDeletePOST,
  messageEditGET,
  messageEditPOST,
};
