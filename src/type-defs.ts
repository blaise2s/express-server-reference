import { gql } from 'apollo-server-express';

export default gql`
  type Pong {
    msg: String!
  }

  type User {
    email: String!
    firstName: String!
    lastName: String!
  }

  type Access {
    accessToken: String!
    refreshToken: String!
  }

  type ErrorResponse {
    code: Int!
    msg: String
  }

  union LoginResponse = Access | ErrorResponse

  type Query {
    ping: Pong
    login(email: String!, password: String!): LoginResponse
  }

  type Mutation {
    signup(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): User
  }
`;
