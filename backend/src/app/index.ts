import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import JWTService from "./services/jwtservice";
import TokenService from "./services/tokenservice";
import { User } from "./user";

export async function initServer(PORT: number) {
  const server = new ApolloServer({
   introspection: true,
    typeDefs: `
      ${User.Types}
      type Query {
        ${User.queries}
      }
      type Mutation {
        ${User.mutations}
      }
    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
      Mutation: {
        ...User.resolvers.mutations,
      },
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || "";
      const token = TokenService.getInstance().extractTokenFromHeader(authHeader);
      const user = token ? await JWTService.getInstance().decode(token) : null;

      return {
        user,
        JWTService: JWTService.getInstance(),
        TokenService: TokenService.getInstance(),
      };
    },
  });

  console.log(`🚀 Server ready at ${url}`);
}
