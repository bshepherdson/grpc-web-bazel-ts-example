/**
 * @fileoverview Reverse proxy for calling gRPC services via Express Middleware.
 * This is inspired and implemented with reference to
 * https://github.com/3p3r/grpc-express which does not support class-based,
 * statically generated gRPC clients. It's also not TS, while this is.
 */

import * as grpc from 'grpc';
import * as jspb from 'google-protobuf';
import express from 'express';

export interface Config {
  proxyUnaryCalls: boolean;
  unaryCallsTimeout: number;
}

export const DEFAULT_CONFIG: Config = {
  proxyUnaryCalls: true,
  unaryCallsTimeout: 5000,
};

interface Message {
  new(x: object): Message;
  toObject(): object;
}

interface MethodDef {
  requestType: {new (): jspb.Message};
  (req: jspb.Message, cb: (err: Error|null, resp: jspb.Message|null) => void):
      void;
}

function upperCaseFirst(s: string): string {
  return s[0].toUpperCase() + s.substring(1);
}

function callSetter(msg: jspb.Message, key: string, value: any): void {
  const setter = 'set' + upperCaseFirst(key);
  if (setter in msg) {
    (msg as Record<string, any>)[setter](value);
  } else {
    throw new Error('Invalid parameter: ' + key);
  }
}

class Middleware {
  private readonly opts: Config;

  // These maps paths (eg. '/mypkg.MyService/myMethod') to method names on the
  // client object (eg. 'myMethod').
  private readonly unaryCalls = new Map<string, string>();

  constructor(
      private readonly service:
          grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
      private readonly client: grpc.Client,
      opts?: Config,
  ) {
    this.opts = {...DEFAULT_CONFIG, ...opts};

    if (this.opts.proxyUnaryCalls) {
      for (const [method, def] of Object.entries(service)) {
        if (!def.requestStream && !def.responseStream) {
          this.unaryCalls.set(def.path, method);
        }
      }
    }

    // TODO Handle server streaming requests, if that ever comes up.
  }

  proxy(req: express.Request, res: express.Response): boolean {
    if (this.unaryCalls.has(req.path)) {
      this.proxyUnaryCall(req, res);
      return true;
    }

    return false;
  }

  private proxyUnaryCall(req: express.Request, res: express.Response): void {
    let timedOut = false;
    let timer = setTimeout(() => {
      timedOut = true;
      res.status(504); // Gateway timeout
      res.end();
    }, this.opts.unaryCallsTimeout);

    (async () => {
      res.setHeader('Content-Type', 'application/json');
      const jsonRequest = await this.getBody(req).catch(err => {
        res.status(400).send(err);
      });

      if (!jsonRequest) return;
      const methodName = this.unaryCalls.get(req.path);
      if (!methodName) return;

      const def =
          (this.client as unknown as Record<string, MethodDef>)[methodName];
      const grpcRequest = new def.requestType();

      try {
        for (const key of Object.keys(jsonRequest)) {
          callSetter(grpcRequest, key, (jsonRequest as any)[key]);
        }
      } catch (e) {
        res.status(400).send(e.message);
        return;
      }

      def.call(this.client, grpcRequest, (err, resp) => {
        if (timedOut) return;

        if (err || !resp) res.status(502).send(err);
        else res.json(resp.toObject());
        clearTimeout(timer);
      });
    })();
  }

  private getBody(req: express.Request): Promise<object> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
}

export function grpcProxy(
    service: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>,
    client: grpc.Client,
    opts?: Config): express.RequestHandler {
  const middleware = new Middleware(service, client, opts);
  return (req: express.Request, res: express.Response, next: () => void) => {
    // If it returns true, it's handled. If not, we hand off with next().
    if (!middleware.proxy(req, res)) next();
  };
}

