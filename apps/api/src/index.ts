import { createServer } from "node:http";
import { env } from "./env";
import { app } from "./server";
import { setupCorsairIntegrations } from "./server/corsair";

async function init() {
  try {
    await setupCorsairIntegrations();

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
