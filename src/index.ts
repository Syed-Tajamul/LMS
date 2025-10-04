import { Elysia } from "elysia";
import { LeaveType } from "./controllers/leave_type.controller";
import openapi from "@elysiajs/openapi";

const app = new Elysia().get("/", () => "Hello Elysia")
  .use(openapi())
  .use(LeaveType)
  .listen(3000);