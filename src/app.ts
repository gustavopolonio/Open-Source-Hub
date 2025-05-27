import { env } from './env';
import express from 'express';

const app = express();

app.listen(env.PORT, () => {
  console.log(`App listening on port: ${env.PORT}`);
});
