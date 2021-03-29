import s3 from '../../../libs/s3-lib';
import sqs from '../../../libs/sqs-lib';

import contentParser from './parser';

// AWS.config.region = process.env.REGION;

// const BATCH_SIZE = 25;

export async function transformFile (event) {
  console.log(`SQS queue URL: ${process.env.QUEUE_URL}`);

  await Promise.all(
    event.Records.map(async file => {
      try {
        const fileContent = await s3.getObject({
          Bucket: file.s3.bucket.name,
          Key: file.s3.object.key
        });

        const items = contentParser.parse(fileContent.Body.toString('utf-8'));
        console.log(`Received ${items.length} items`);
        await send(items);
      } catch (err) {
        console.error(err);
      };
    })
  );
};


/**
 * The function sends items one by one asyncronously via SQS
 * @param {Array} items strings to be send over SQS
 */
const send = async items => {
  await Promise.all(
    items.map(async item => {
      if (!item) return;
      const params = {
        MessageBody: `${item}`,
        QueueUrl: process.env.QUEUE_URL
      };

      try {
        await sqs.sendMessage(params);
      } catch (err) {
        console.error(`SQS: ${err}`);
      }
    })
  );
};
