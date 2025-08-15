import { initServer } from "./app";
import * as dotenv from "dotenv"
dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT,10) : 8000;
async function init(){
  await initServer(PORT);
}
init();