import * as arctic from "arctic";
import { env } from "./env.js";

export const google = new arctic.Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);
