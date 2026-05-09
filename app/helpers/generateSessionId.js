import { v4 as uuidv4 } from "uuid";
import { log } from "./logger.js";

export function generateSessionId() {
  const id = uuidv4();

  log("info", "generateSessionId", "Generated UUID →", id);

  return id;
}