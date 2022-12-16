import { buildSchema } from 'graphql'

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const schema = buildSchema(`
    type Query {
        name(firstname: String!, lastname: String!): String
    }
`)

const typeDefs = `#graphql
  input UserInput {
    email: String!
    name: String!
  }

  type User {
    id: Int!
    name: String!
    email: String!
  }

  type Mutation {
    createUser(input: UserInput): User
    updateUser(id: Int!, input: UserInput): User
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    # books: [Book]
    name(firstname: String!, lastname: String!): String
    getUser(id: String): User
    getUsers: [User]
  }
`;

type User = {
  id: number
  name: string
  email: string
}

type UserInput = Pick<User, "email" | "name">

const users = [
  { id: 1, name: "John Doe", email: "johndoe@gmail.com" },
  { id: 2, name: "Jane Doe", email: "janedoe@gmail.com" },
  { id: 3, name: "Mike Doe", email: "mikedoe@gmail.com" },
]

const resolvers = {
  Query: {
    name: (v, b) => {
      console.log('---', v, b)
      return `My name is ${b.firstname} ${b.lastname}`
      // return `My name is`
    },
    getUser: (_, args: { id: number}): User | undefined => {
      return users.find(u => u.id === args.id)
    },
    getUsers: (): User[] => users,
  },
  Mutation: {
    createUser: (_, args): User => {
      const user = {
        id: users.length + 1,
        ...args.input
      }
      users.push(user)
      return user
    },
    updateUser: (_, args: { id: number, input: User }): User => {
      const index = users.findIndex(u => u.id === args.id)
      const targetUser = users[index]

      if (targetUser) {
        users[index] = args.input
      }
      
      return users[index]
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
(async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  
  console.log(`🚀  Server ready at: ${url}`);
})()
