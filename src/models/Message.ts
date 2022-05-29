import { Schema, model, Types } from 'mongoose';
import { DateTime } from 'luxon';
export interface IMessage {
  text: string;
  user: Types.ObjectId;
  date: Date;
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
});

messageSchema.virtual('dateFormatted').get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(
    DateTime.DATETIME_MED,
  );
});

export default model('Message', messageSchema);
