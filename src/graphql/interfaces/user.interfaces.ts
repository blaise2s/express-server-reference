import { Email } from './base.interfaces';

export interface User extends Email {
  firstName: string;
  lastName: string;
}
