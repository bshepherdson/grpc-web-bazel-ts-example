import express from 'express';
import {apiMiddleware} from './api/index';

export const PORT = 5080;

const app: express.Application = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api', ...apiMiddleware);

app.listen(PORT, () => {
  console.log(`Test app ready on port ${PORT}.`);
});

