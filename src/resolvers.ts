import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface Email {
  email: string;
}

export interface Password {
  password: string;
}

export interface Login extends Email, Password {}

export interface User extends Email {
  firstName: string;
  lastName: string;
}

export interface Signup extends User, Password {}

export interface Access {
  accessToken: string;
  refreshToken: string;
}

const users: Signup[] = [];

export default {
  Query: {
    ping: () => ({ msg: 'pong' }),
    login: async (
      root: unknown,
      args: Login,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      context: unknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      info: unknown
    ): Promise<Access | string> => {
      if (
        !process.env.ACCESS_TOKEN_SECRET ||
        !process.env.REFRESH_TOKEN_SECRET
      ) {
        return 'No secrets available on the server';
      }

      const user = users.find(usr => usr.email === args.email);
      if (!user) {
        return 'Incorrect email or password';
      }

      if (!bcrypt.compare(args.password, args.password)) {
        return 'Incorrect email or password';
      }

      const userPayload: User = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      const accessToken = jwt.sign(
        userPayload,
        process.env.ACCESS_TOKEN_SECRET
      );

      const refreshToken = jwt.sign(
        userPayload,
        process.env.REFRESH_TOKEN_SECRET
      );

      return {
        accessToken,
        refreshToken,
      };
    },
  },

  Mutation: {
    signup: async (
      root: unknown,
      args: Signup,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      context: unknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      info: unknown
    ): Promise<User> => {
      users.push({
        ...args,
        password: await bcrypt.hash(args.password, 10),
      });

      return {
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
      };
    },
  },
};
