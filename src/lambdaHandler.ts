import serverless from 'serverless-http';
import app from './app';

export const handler = serverless(app);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
