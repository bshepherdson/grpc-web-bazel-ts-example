import {HelloRequest, HelloResponse} from 'tpt/proto/greeter_web_pb';
import {GreeterClient} from 'tpt/proto/greeter_web_grpc_web_pb';
import Vue from 'vue';

// Note that this is a CORS request, talking to the proxy server rather than the
// web server. This probably isn't the best production configuration, where you
// probably want a central reverse proxy doing your load-balancing, and routing
// requests to the web server or gRPC server as appropriate.
const client = new GreeterClient('http://192.168.86.8:5080/api');


const app = new Vue({
  el: '#app',
  data: {
    name: 'Vue',
    result: '',
  },
  methods: {
    send: function() {
      const req = new HelloRequest();
      req.setName(this.name);
      client.sayHello(req, {}, (err, resp) => {
        if (err) {
          console.error('gRPC error', err);
        } else {
          this.result = resp.getMessage();
        }
      });
    },
  },
});

