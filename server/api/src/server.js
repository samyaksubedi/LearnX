import { envVariables } from './Configs/env.config.js';
import { app } from './app.js';

// import { connectRedis } from './Configs/redis.config.js';
import { logger } from './Configs/logger.config.js';
import { testPostgresConnection } from './db/client.db.js';
import { testMailTransporter } from './configs/mail.config.js';
import { testStorageConnection } from './configs/storage.config.js';
// import { testCloudinaryConnection } from './configs/cloudinary.config.js'; // Ignore this cause we aren't using cloudinary : )

const PORT = envVariables.PORT || 3000;

async function startServer() {
  await testPostgresConnection();
  // await testCloudinaryConnection(); // We are using B2 bucket as storage now so ignore cloudinary
  await testStorageConnection();
  // await connectRedis();
  testMailTransporter();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API endpoints available at ${envVariables.SERVER_URL}/api`);
  });
}

startServer();
