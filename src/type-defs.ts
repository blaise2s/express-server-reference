import { gql } from 'apollo-server-express';

export default gql`
  type Pong {
    msg: String!
  }

  type Query {
    ping: Pong!
  }
`;
