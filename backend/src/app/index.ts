import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from "@as-integrations/express4";
import type { Express } from "express";
import JWTService from "./services/jwtservice";
import TokenService from "./services/tokenservice";
export async function initServer(): Promise<Express>{
  const app=express();
  app.use(cors());
  app.use(bodyParser.json());
  const server=new ApolloServer({
   typeDefs:`
   type Query{
     
   }
   type Mutation{
     
   }
    `,
    resolvers:{
      Query:{
       
       },
       Mutation:{
        
       },
       
    },
  });
  await server.start();
  app.use("/graphql", expressMiddleware(server, {
    context: async ({ req }) => {
      return {
        user: req.headers.authorization ? await JWTService.getInstance().decode(
         TokenService.getInstance().extractTokenFromHeader(req.headers.authorization) || '') : null,
      };
    }
  }) as unknown as express.RequestHandler);
  return app;
}