import * as grpc from 'grpc';

import {HelloRequest, HelloResponse} from 'vac/proto/greeter_pb';
import {GreeterService, IGreeterServer} from 'vac/proto/greeter_grpc_pb';

class GreeterHandler implements IGreeterServer {
  sayHello(call: grpc.ServerUnaryCall<HelloRequest>,
      callback: grpc.sendUnaryData<HelloResponse>): void {
    const reply: HelloResponse = new HelloResponse();
    reply.setMessage(`Hello, ${call.request.getName()}`);
    callback(null, reply);
  }
}

export const service = GreeterService;
export const handler = new GreeterHandler();

const PORT = 5051;

export function startServer(): void {
  const server = new grpc.Server();

  // Register all the handlers here.
  server.addService(service, handler);

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err: Error|null, port: number) => {
      if (err != null) {
        return console.error(err);
      }
      console.log(`gRPC listening on ${PORT}`);
    },
  );

  server.start();
}

startServer();
