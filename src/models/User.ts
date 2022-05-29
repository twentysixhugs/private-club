import { Schema, model, Types } from 'mongoose';

export interface IUser {
  username: string;
  password: string;
  membership: 'none' | 'member' | 'admin';
  avatar: '1' | '2' | '3' | '4' | '5';
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  membership: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
});

export default model('User', userSchema);
