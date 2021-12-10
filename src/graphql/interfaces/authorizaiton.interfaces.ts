import { Email, Password } from './base.interfaces';
import { User } from './user.interfaces';

export interface Login extends Email, Password {}

export interface Signup extends User, Password {}

export interface Refresh {
  refreshToken: string;
}

export interface Authorization extends Refresh {
  accessToken: string;
}

export interface Secrets {
  access: string;
  refresh: string;
  email: string;
}
