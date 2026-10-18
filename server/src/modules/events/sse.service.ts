import type { Response } from "express";

interface SseClient {
  userId: string;
  res: Response;
}

export class SseService {
  private clients: SseClient[] = [];

  addClient(userId: string, res: Response) {
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });
    res.write("\n");

    const client: SseClient = { userId, res };

    this.clients.push(client);

    res.on("close", () => {
      this.clients = this.clients.filter((c) => c !== client);
    });
  }

  emitToUser(userId: string, event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      if (client.userId === userId) {
        client.res.write(payload);
      }
    }
  }
}
