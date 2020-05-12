import * as jspb from 'google-protobuf';
//import * as grpc from 'grpc';
import {HelloRequest, HelloResponse} from '../proto/greeter_web_pb';
import {GreeterClient} from '../proto/greeter_web_grpc_web_pb';

const client = new GreeterClient('http://localhost:8000/api');

const request = new HelloRequest();
request.setName('Braden');

client.sayHello(request, {}, (err, resp) => {
  console.log(resp.getMessage());
});
