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

  type Query {
    ping: Pong!
    login(email: String!, password: String!): Access!
  }

  type Mutation {
    signup(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): User!
  }
`;
