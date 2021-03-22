'use strict';

const uuid = require('uuid')
const AWS = require('aws-sdk')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.add = async (event, context, callback) => {
  const item = JSON.parse(event.body)
  const id = uuid.v1()

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id,
      ...item,
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime()
    }
  }

  console.log('Ready to insert')
  try {
    await dynamoDb.put(params).promise()
  } catch (err) {
    console.error(err);
    return resp(500, 'add failed', event)
  }

  return resp(200, `id:${id}`)
};

module.exports.update = async (event, context, callback) => {
  const data = JSON.parse(event.body)
  const id = event.pathParameters.id

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id
    },
    ExpressionAttributeValues: {
      ":done": data.done,
      ":message": data.message,
      ":updatedAt": new Date().getTime()
    },
    UpdateExpression: "SET done=:done, message=:message, updatedAt=:updatedAt",
    ReturnValues: "UPDATED_NEW"
  }

  try {
    await dynamoDb.update(params).promise()
    return resp(200, `id:${id}`)
  } catch (err) {
    console.error(err);
    return resp(500, 'update failed', event)
  }
};

module.exports.delete = async (event, context, callback) => {
  const id = event.pathParameters.id
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id
    }
  }

  try {
    await dynamoDb.delete(params).promise()
  } catch (err) {
    return Response(404, `id:${id}`)
  }
  return resp(200, 'ok')
};

module.exports.get = async (event, context, callback) => {
  const id = event.pathParameters.id
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id
    }
  }

  try {
    const data = await dynamoDb.get(params).promise()
    if (!data || !data.Item) {
      return resp(404, `id:${id}`)
    }

    return resp(200, `${JSON.stringify(data.Item)}`)
  } catch (err) {
    return resp(404, `id:${id}`)
  }
};

module.exports.list = async (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Limit: 100
  }

  try {
    const data = await dynamoDb.scan(params).promise()
    if (!data || !data.Items) {
      return resp(404, 'no data')
    }
    console.log(`returned: ${data.Count} items`)
    return resp(200, `${JSON.stringify(data.Items)}`)
  } catch (err) {
    console.error(err);
    return resp(500, 'list failed', event)
  }

};


const resp = (code, message, input) => {
  return {
    statusCode: code,
    body: JSON.stringify(
      {
        message,
        input,
      },
      null,
      2
    )
  }
}
