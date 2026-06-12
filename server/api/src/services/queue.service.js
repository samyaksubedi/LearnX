//  Global queue manages (service) :  emailQueue , processMediaQueue ....

// Custom queue to connect nodeJS with python : )
import { redisClient } from '../configs/redis.config.js';

const QUEUE_NAME = 'learnx:conversation-processing';

const enqueueConversationJob = async (payload) => {
  // playload can be  :
  // {
  //   conversationId,
  //   filePath,
  // }
  // or
  // {
  //   conversationId,
  //   youtubeUrl,
  // }
  {
  }
  try {
    await redisClient.rpush(QUEUE_NAME, JSON.stringify(payload));
  } catch (error) {
    throw error;
  }
};

export { enqueueConversationJob };
