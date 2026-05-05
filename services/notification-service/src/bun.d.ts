declare const Bun: {
  serve(options: {
    port: number;
    fetch(req: Request): Promise<Response> | Response;
  }): { port: number };
};