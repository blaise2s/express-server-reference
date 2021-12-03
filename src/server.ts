import express from 'express';

const server = express();

const port = process.env.PORT || 3000;
server.listen({ port }, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server started on port ${port}`);
});
