// import lekko from "@lekko/node-server-sdk";
// replace with the above once latest node sdk is published
import lekko from "../node-server-sdk/lib/index.js";
import express from "express";
import { program } from "commander";

async function getLekkoClient(local, apikey) {
  if (local) {
    return lekko.initGitInMemoryClient({
      repositoryOwner: "lekkodev",
      repositoryName: "example",
      path: "../example",
    });
  } else {
    return lekko.initBackendInMemoryClient({
      apiKey: apikey,
      repositoryOwner: "lekkodev",
      repositoryName: "example",
      updateIntervalMs: 3 * 1000,
    });
  }
}

program
  .option("--port [port]", "port to serve http", 3333)
  .option("--local", "use local config repo")
  .option("--apikey [apikey]", "Lekko API key");
program.parse();
const options = program.opts();

const lekkoClient = await getLekkoClient(options.local, options.apikey);

const app = express();
app.get("/hello", async (req, res) => {
  console.log("Got /hello request");
  const contextKey = req.query["context-key"];
  const context = new lekko.ClientContext();
  if (contextKey) {
    context.setString("context-key", contextKey);
  }
  try {
    const suffix = await lekkoClient.getStringFeature(
      "default",
      "hello",
      context
    );
    res.send(`Hello ${suffix}`);
  } catch (e) {
    console.error(e.stack);
    res.status(500).send("Failed to read from Lekko");
  }
});
app.listen(options.port, () => {
  console.log(`Example app listening on port ${options.port}`);
});
