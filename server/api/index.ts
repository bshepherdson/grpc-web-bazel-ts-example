import * as grpc from 'grpc';
import express from 'express';
import {GreeterClient, GreeterService} from 'tpt/proto/greeter_grpc_pb';
import {grpcProxy} from './proxy';

const greeterClient = new GreeterClient('localhost:5051',
    grpc.credentials.createInsecure());

export const apiMiddleware: express.RequestHandler[] = [
  grpcProxy(GreeterService, greeterClient),
];

