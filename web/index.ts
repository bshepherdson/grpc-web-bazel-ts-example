import {HelloRequest, HelloResponse} from 'tpt/proto/greeter_web_pb';
import {GreeterClient} from 'tpt/proto/greeter_web_grpc_web_pb';

// Note that this is a CORS request, talking to the proxy server rather than the
// web server. This probably isn't the best production configuration, where you
// probably want a central reverse proxy doing your load-balancing, and routing
// requests to the web server or gRPC server as appropriate.
const client = new GreeterClient('http://localhost:5080/api');

const request = new HelloRequest();
request.setName('World!');

client.sayHello(request, {}, (err, resp) => {
  if (err) {
    console.error('gRPC error', err);
  } else {
    console.log(resp.getMessage());
  }
});
