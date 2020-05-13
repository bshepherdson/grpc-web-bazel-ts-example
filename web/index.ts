//import * as jspb from 'google-protobuf';
//import * as grpc from 'grpc';
import {HelloRequest, HelloResponse} from 'tpt/proto/greeter_web_pb';
import {GreeterClient} from 'tpt/proto/greeter_web_grpc_web_pb';

const client = new GreeterClient('http://localhost:5082');

const request = new HelloRequest();
request.setName('Braden');

client.sayHello(request, {}, (err, resp) => {
  if (err) {
    console.error('gRPC error', err);
  } else {
    console.log(resp.getMessage());
  }
});
