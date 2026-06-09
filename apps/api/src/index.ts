import { createServer } from "node:http";
import { env } from "./env.js";
import { app } from "./server.js";

async function init() {
  try {
    const server = createServer(app);
    server.listen(env.PORT, () => {
      console.log(`Server is running at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Something went wrong", error);
    process.exit(1);
  }
}

init();
