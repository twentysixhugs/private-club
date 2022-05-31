import { Schema, model, Types } from 'mongoose';
import { DateTime } from 'luxon';
export interface IMessage {
  text: string;
  user: Types.ObjectId;
  date: Date;
  introductory?: boolean;
  sitOnTop: boolean;
}

const messageSchema = new Schema<IMessage>({
  text: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  introductory: {
    type: Boolean,
    required: false,
  },
  sitOnTop: {
    type: Boolean,
    required: false,
  },
});

messageSchema.virtual('dateFormatted').get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(
    DateTime.DATETIME_MED,
  );
});

export default model('Message', messageSchema);
