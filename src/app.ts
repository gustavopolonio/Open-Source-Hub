import { env } from './env';
import express from 'express';
import { usersRoutes } from './routes/usersRoutes';

const app = express();

app.use('/', usersRoutes);

app.listen(env.PORT, () => {
  console.log(`App listening on port: ${env.PORT}`);
});
