import "dotenv/config";
import { defineConfig } from "@prisma/config";
import { env } from "process";

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL,
  },
});