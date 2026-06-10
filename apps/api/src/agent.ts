import "dotenv/config";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { env } from "./env";
import { corsairForTenant } from "./server/corsair";


async function main() {
  const provider = new OpenAIAgentsProvider();
  const tenantCorsair = corsairForTenant(env.CORSAIR_TENANT_ID);
  const tools = provider.build({ corsair: tenantCorsair, tool });

  const agent = new Agent({
    name: "corsair-agent",
    model: "gpt-4o-mini",
    instructions:
      "You have access to Corsair tools. Use list_operations to discover " +
      "available APIs, get_schema to understand arguments, and run_script " +
      "to execute them.",
    tools,
  });

  const result = await run(
    agent,
    "can you show me the content of first email",
  );
  console.log(result.finalOutput);
}

main().catch(console.error);
