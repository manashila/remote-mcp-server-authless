
import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";

const TODO_DATA_URL =
  "https://todo-json-connector.manashila189.workers.dev/";

function createServer() {
  const server = new McpServer({
    name: "Google Sheets ToDo Connector",
    version: "1.0.0",
  });

  server.registerTool(
    "get_todo_data",
    {
      description:
        "Fetch the latest ToDo records from Google Sheets, including tasks, priorities, statuses and due dates.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const response = await fetch(TODO_DATA_URL, {
          headers: { Accept: "application/json" },
        });

        const responseText = await response.text();

        if (!response.ok) {
  throw new Error(
    "URL: " + response.url +
    " | HTTP: " + response.status +
    " | Response: " + responseText.slice(0, 500)
  );
}

        const data = JSON.parse(responseText);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };

      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Unable to retrieve ToDo data: " +
                String(error),
            },
          ],
        };
      }
    }
  );

  return server;
}

const handler = createMcpHandler(createServer);

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
