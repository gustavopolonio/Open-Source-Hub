import { env } from './env';
import express from 'express';
import cookieParser from 'cookie-parser';
import { usersRoutes } from './routes/usersRoutes';

const app = express();
app.use(cookieParser());

app.use('/', usersRoutes);

app.listen(env.PORT, () => {
  console.log(`App listening on port: ${env.PORT}`);
});
