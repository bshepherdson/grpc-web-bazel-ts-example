import * as url from 'url';
import express from 'express';
import {createProxyMiddleware} from 'http-proxy-middleware';
//import {apiMiddleware} from './api/index';

export const PORT = 5080;

const app: express.Application = express();

//app.use('/api', ...apiMiddleware);

// Proxy to the TS devserver
app.use(createProxyMiddleware('http://localhost:5081'));
//app.use(express.static('web'));

app.listen(PORT, () => {
  console.log(`Test app ready on port ${PORT}.`);
});

