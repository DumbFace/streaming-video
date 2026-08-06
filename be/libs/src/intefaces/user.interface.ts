export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  isActive: 0 | 1;
  googleId?: string;
}
