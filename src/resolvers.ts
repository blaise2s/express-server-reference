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

export interface ErrorResponse {
  code: number;
  msg?: string;
}

export interface Access {
  accessToken: string;
  refreshToken: string;
}

const users: Signup[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateAccessToken = (payload: any) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateRefreshToken = (payload: any) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!);
};

const incorrectEmailPasswordErrorResponse: ErrorResponse = {
  code: 401,
  msg: 'Incorrect email or password',
};

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
    ): Promise<Access | ErrorResponse> => {
      if (
        !process.env.ACCESS_TOKEN_SECRET ||
        !process.env.REFRESH_TOKEN_SECRET
      ) {
        return { code: 500 };
      }

      const user = users.find(usr => usr.email === args.email);
      if (!user) {
        return incorrectEmailPasswordErrorResponse;
      }

      if (!(await bcrypt.compare(args.password, user.password))) {
        return incorrectEmailPasswordErrorResponse;
      }

      const userPayload: User = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      return {
        accessToken: generateAccessToken(userPayload),
        refreshToken: generateRefreshToken(userPayload),
      };
    },
  },

  LoginResponse: {
    // eslint-disable-next-line no-underscore-dangle
    __resolveType(obj: ErrorResponse | Access) {
      if ((obj as ErrorResponse).code) {
        return 'ErrorResponse';
      }

      if ((obj as Access).accessToken) {
        return 'Access';
      }

      return null;
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
