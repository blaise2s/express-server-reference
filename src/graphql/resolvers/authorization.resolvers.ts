import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt, { JwtPayload, TokenExpiredError, VerifyErrors } from 'jsonwebtoken';
import {
  Authorization,
  Login,
  Secrets,
  Signup,
} from '../interfaces/authorizaiton.interfaces';
import { ErrorResponse } from '../interfaces/response.interfaces';
import { User } from '../interfaces/user.interfaces';

const users: Signup[] = [];
const validRefreshTokens: Map<string, string> = new Map();

const encryptEmail = (value: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
};

const generateToken = (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  payload: any,
  secret: string,
  expiresIn?: string
): string => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

// /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
// const generateAccessToken = (payload: any, expiresIn?: string): string => {
//   /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
//   return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
//     expiresIn: expiresIn || process.env.ACCESS_TOKEN_EXPIRE_TIME,
//   });
// };

// /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
// const generateRefreshToken = (payload: any, expiresIn?: string): string => {
//   /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
//   return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
//     expiresIn: expiresIn || process.env.REFRESH_TOKEN_EXPIRE_TIME,
//   });
// };

const verifyToken = (
  token: string,
  secret: string
): VerifyErrors | JwtPayload | undefined => {
  let response: VerifyErrors | JwtPayload | undefined;
  jwt.verify(token, secret, (error, result) => {
    if (error) {
      response = error;
      return;
    }

    response = result;
  });
  return response;
};

const incorrectEmailPasswordErrorResponse: ErrorResponse = {
  code: 401,
  msg: 'Incorrect email or password',
};

const unauthorizedErrorResponse: ErrorResponse = {
  code: 401,
  msg: 'Unauthorized',
};

const isUserPayload = (
  payload: VerifyErrors | JwtPayload | undefined
): payload is User => {
  return (payload as User).email !== undefined;
};

const verifySecrets = (): Secrets | null => {
  if (
    !process.env.ACCESS_TOKEN_SECRET ||
    !process.env.REFRESH_TOKEN_SECRET ||
    !process.env.EMAIL_ENCRYPTION_SECRET
  ) {
    return null;
  }
  return {
    access: process.env.ACCESS_TOKEN_SECRET,
    refresh: process.env.REFRESH_TOKEN_SECRET,
    email: process.env.EMAIL_ENCRYPTION_SECRET,
  };
};

export default {
  Query: {
    login: async (
      parent: unknown,
      args: Login,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      context: unknown,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      info: unknown
    ): Promise<Authorization | ErrorResponse> => {
      const secrets = verifySecrets();
      if (!secrets) {
        return { code: 500 };
      }

      const encryptedEmail = encryptEmail(args.email, secrets.email);
      const user = users.find(usr => usr.email === encryptedEmail);
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

      const accessToken = generateToken(
        userPayload,
        secrets.access,
        process.env.ACCESS_TOKEN_EXPIRE_TIME || '10m'
      );
      const refreshToken = generateToken(
        userPayload,
        secrets.refresh,
        process.env.REFRESH_TOKEN_EXPIRE_TIME || '60m'
      );

      validRefreshTokens.set(refreshToken, encryptedEmail);

      return {
        accessToken,
        refreshToken,
      };
    },
    protected: async (
      parent: unknown,
      args: Authorization,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      context: unknown,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      info: unknown
    ) => {
      const secrets = verifySecrets();
      if (!secrets) {
        return { code: 500 };
      }

      const tokenResult = verifyToken(args.accessToken, secrets.access);
      if (isUserPayload(tokenResult)) {
        return { msg: 'Verified AT' };
      }

      if (!(tokenResult instanceof TokenExpiredError)) {
        return unauthorizedErrorResponse;
      }

      const refreshResult = verifyToken(args.refreshToken, secrets.refresh);
      if (isUserPayload(refreshResult)) {
        return { msg: 'Verified RT' };
      }

      return unauthorizedErrorResponse;
    },
  },

  LoginResponse: {
    __resolveType(obj: ErrorResponse | Authorization) {
      if ((obj as ErrorResponse).code) {
        return 'ErrorResponse';
      }

      if ((obj as Authorization).accessToken) {
        return 'Access';
      }

      return null;
    },
  },

  Mutation: {
    signup: async (
      parent: unknown,
      args: Signup,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      context: unknown,
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      info: unknown
    ): Promise<User | ErrorResponse> => {
      const secrets = verifySecrets();
      if (!secrets) {
        return { code: 500 };
      }

      users.push({
        ...args,
        email: encryptEmail(args.email, secrets.email),
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
