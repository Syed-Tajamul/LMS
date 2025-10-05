import { Elysia } from "elysia";
import { LeaveType } from "./controllers/leave_type.controller";
import openapi from "@elysiajs/openapi";
import { User } from "./controllers/auth.controller";

const app = new Elysia().get("/", () => "Hello Elysia")
  .use(openapi())
  .use(LeaveType)
  .use(User)
  .listen(3000);