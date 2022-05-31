import { HydratedDocument } from 'mongoose';
import { IUser } from '../models/User';
import { MiddlewareFn } from 'src/types';
import Message, { IMessage } from '../models/Message';

const indexGET: MiddlewareFn = async (req, res, next) => {
  try {
    const messages = await Message.find({
      introductory: false,
      $or: [
        { sitOnTop: false },
        { sitOnTop: null },
        { sitOnTop: undefined },
      ],
    })
      .populate('user')
      .sort({ date: 'desc' });

    const isAdmin =
      (req.user as HydratedDocument<IUser>)?.membership === 'admin';

    const isMember =
      (req.user as HydratedDocument<IUser>)?.membership === 'member' ||
      isAdmin;

    let introductoryMessages: Array<HydratedDocument<IMessage>> = [];

    if (!req.user) {
      introductoryMessages = await Message.find({
        introductory: true,
      })
        .populate('user')
        .sort({ date: 'desc' });
    }

    const messagesOnTop = await Message.find({
      sitOnTop: true,
    })
      .populate('user')
      .sort({ date: 'desc' });

    const messagesToSend = [
      ...introductoryMessages, // Show introductory messages first
      ...messagesOnTop, // Should always sit on top, but after the introductory ones
      ...messages, // Show everything else
    ];

    return res.render('index', {
      title: 'Private club',
      isMember,
      isAdmin,
      messages: messagesToSend,
    });
  } catch (err) {
    return next(err);
  }
};

export { indexGET };
