import { Application } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import {oakCors} from "https://deno.land/x/cors@v1.2.2/oakCors.ts"

import * as routes from "./routes/mod.ts";

const app = new Application();
app.use(oakCors())
Object.values(routes).forEach((route) => {
  app.use(route.routes());
  app.use(route.allowedMethods());
});

await app.listen({ port: 8080 });