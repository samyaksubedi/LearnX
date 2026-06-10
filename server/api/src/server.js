import { envVariables } from './Configs/env.config.js';
import { app } from './app.js';

// import { connectRedis } from './Configs/redis.config.js';
import { logger } from './Configs/logger.config.js';
import { testPostgresConnection } from './db/client.db.js';
import { testMailTransporter } from './configs/mail.config.js';
import { testCloudinaryConnection } from './configs/cloudinary.config.js';

const PORT = envVariables.PORT || 3000;

async function startServer() {
  await testPostgresConnection();
  await testCloudinaryConnection(); // Un-comment only while testing : - on each ping() triggers rate limit : )
  // await connectRedis();
  testMailTransporter();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API endpoints available at ${envVariables.SERVER_URL}/api`);
  });
}

startServer();
