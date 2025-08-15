"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = initServer;
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const jwtservice_1 = __importDefault(require("./services/jwtservice"));
const tokenservice_1 = __importDefault(require("./services/tokenservice"));
const user_1 = require("./user");
async function initServer(PORT) {
    const server = new server_1.ApolloServer({
        introspection: true,
        typeDefs: `
      ${user_1.User.Types}
      type Query {
        ${user_1.User.queries}
      }
      type Mutation {
        ${user_1.User.mutations}
      }
    `,
        resolvers: {
            Query: {
                ...user_1.User.resolvers.queries,
            },
            Mutation: {
                ...user_1.User.resolvers.mutations,
            },
        },
    });
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        listen: { port: PORT },
        context: async ({ req }) => {
            const authHeader = req.headers.authorization || "";
            const token = tokenservice_1.default.getInstance().extractTokenFromHeader(authHeader);
            const user = token ? await jwtservice_1.default.getInstance().decode(token) : null;
            return {
                user,
                JWTService: jwtservice_1.default.getInstance(),
                TokenService: tokenservice_1.default.getInstance(),
            };
        },
    });
    console.log(`🚀 Server ready at ${url}`);
}
//# sourceMappingURL=index.js.map