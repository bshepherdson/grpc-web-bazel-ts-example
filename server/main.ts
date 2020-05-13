import * as url from 'url';
import express from 'express';
import {createProxyMiddleware} from 'http-proxy-middleware';

export const PORT = 5080;
export const TS_DEVSERVER_PORT = 5081;
export const API_PROXY_PORT = 5082;

const app: express.Application = express();

// Proxy /api to the API proxy server
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${API_PROXY_PORT}`,
  changeOrigin: true,
  pathRewrite: {'^/api': ''}, // Strips the /api off the path.
}));

// Proxy everything else to the TS devserver
app.use(createProxyMiddleware(`http://localhost:${TS_DEVSERVER_PORT}`));

app.listen(PORT, () => {
  console.log(`Test app ready on port ${PORT}.`);
});

