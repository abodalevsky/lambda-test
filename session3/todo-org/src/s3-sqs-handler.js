'use strict';

const AWS = require('aws-sdk')

const s3 = new AWS.S3()
const sqs = new AWS.SQS()


module.exports.transformFile = async (event) => {
  console.log(`SQS queue URL: ${process.env.QUEUE_URL}`)

  await Promise.all(
    event.Records.map(async file => {
      try {
        const fileContent = await s3.getObject({
          Bucket: file.s3.bucket.name,
          Key: file.s3.object.key
        }).promise()

        const items = parseContent(fileContent.Body.toString('utf-8'))
        console.log(`Received ${items.length} items`)
        await send(items);
      } catch (err) {
        console.error(err)
      }
    })
  )
};

/**
 * The function parses CSV file into array of items
 * first line is assumed as caption and ignored
 * @param {String} content of CSV file
 * @returns Array of String (items)
 */
const parseContent = content => {
  if (!content) {
    return []
  }

  const arr = content.split(/\r?\n/)
  arr.shift()
  return arr
    .map(i => toJson(i))
    .filter(i => i);
}

/**
 * makes from 1 line of content JSON object
 */
 const toJson = it => {
    const tokens = it.split(';');
    if (Array.isArray(tokens) && tokens.length > 1) {
        return `{"done": ${tokens[0].toLowerCase() === "true"}, "message": "${tokens[1]}"}`;
    } else {
        return null;
    }
};

/**
 * The function sends items one by one asyncronously via SQS
 * @param {Array} items strings to be send over SQS
 */
const send = async items => {
  await Promise.all(
    items.map(async item => {
      const params = {
        MessageBody: `${item}`,
        QueueUrl: process.env.QUEUE_URL
      }

      try {
        const res = await sqs.sendMessage(params).promise()
      } catch (err) {
        console.error(`SQS: ${err}`);
      }
    })
  )
}
