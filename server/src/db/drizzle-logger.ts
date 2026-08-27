import type { Logger } from "drizzle-orm";
import { format } from "sql-formatter";
import { logger } from "../utils/index.js";

class DrizzleLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    const sql = format(query, {
      language: "postgresql",
      keywordCase: "upper",
      tabWidth: 2,
      logicalOperatorNewline: "before",
      expressionWidth: 100,
    });

    logger.debug(
      ["Database query:", sql, `params: ${JSON.stringify(params)}`].join("\n"),
    );
  }
}

export const drizzleLogger = new DrizzleLogger();
