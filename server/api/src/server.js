import { envVariables } from './configs/env.config.js';
import { app } from './app.js';
import { logger } from './configs/logger.config.js';
import { testPostgresConnection } from './db/client.db.js';
import { testMailTransporter } from './configs/mail.config.js';
import { testStorageConnection } from './configs/storage.config.js';
import { testRedisConnection } from './configs/redis.config.js';
// import { testCloudinaryConnection } from './configs/cloudinary.config.js'; // Ignore this cause we aren't using cloudinary : )

const PORT = envVariables.PORT || 3000;

async function startServer() {
  await testPostgresConnection(); // exit process if conn failed
  await testRedisConnection(); //exit conn if conn failed
  // await testCloudinaryConnection(); // We are using B2 bucket as storage now so ignore cloudinary
  await testStorageConnection();
  testMailTransporter();
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API endpoints available at ${envVariables.SERVER_URL}/api`);
  });
}

startServer();
