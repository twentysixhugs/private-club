import { Schema, model } from 'mongoose';

export interface IUser {
  username: string;
  usernameLowercased: string;
  password: string;
  membership: 'none' | 'member' | 'admin';
  avatar: '1' | '2' | '3' | '4' | '5';
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  usernameLowercased: {
    type: String,
    required: true,
  },
  password: {
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
