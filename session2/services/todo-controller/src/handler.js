import dynamoDb, { createItem } from '../../../libs/dynamodb-lib';
import { resp } from './response';

export async function add(event) {
  const element = JSON.parse(event.body);

  const Item = createItem(element);

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item
  };

  console.log('Ready to insert');
  try {
    await dynamoDb.put(params);
  } catch (err) {
    console.error(err);
    return resp(500, 'add failed', event);
  }

  return resp(200, `id:${Item.id}`);
};

export async function update(event) {
  const data = JSON.parse(event.body);
  const id = event.pathParameters.id;

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
  };

  try {
    await dynamoDb.update(params);
    return resp(200, `id:${id}`);
  } catch (err) {
    console.error(err);
    return resp(500, 'update failed', event);
  }
};

export async function remove(event) {
  const id = event.pathParameters.id;
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id
    }
  };

  try {
    await dynamoDb.delete(params);
  } catch (err) {
    return resp(404, `id:${id}`);
  }
  return resp(200, 'ok');
};

export async function get(event) {
  const id = event.pathParameters.id;
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id
    }
  };

  try {
    const data = await dynamoDb.get(params);
    if (!data || !data.Item) {
      return resp(404, `id:${id}`);
    }

    return resp(200, `${JSON.stringify(data.Item)}`);
  } catch (err) {
    console.error(err);
    return resp(404, `id:${id}`);
  }
};

export async function list(event) {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Limit: 100
  };

  try {
    const data = await dynamoDb.scan(params);
    if (!data || !data.Items) {
      return resp(404, 'no data');
    }
    console.log(`returned: ${data.Count} items`);
    return resp(200, `${JSON.stringify(data.Items)}`);
  } catch (err) {
    console.error(err);
    return resp(500, 'list failed', event);
  }
};