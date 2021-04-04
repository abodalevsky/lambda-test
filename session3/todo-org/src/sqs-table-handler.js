'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

module.exports.consumeMessage = async (event) => {
    console.log("processSqsMessage lambda event: ", event);

    await Promise.all(
        event.Records.map(async (event) => {
            const element = JSON.parse(event.body);
            console.log(JSON.stringify(element, null, 2));

            const Item = createItem(element);
            const params = {
                TableName: process.env.DYNAMODB_TABLE,
                Item
            };

            try {
                await dynamoDb.put(params).promise();
            } catch (err) {
                console.error(err);
            }
            console.log(`sent id: ${Item.id}`);
        })
    );
};

const createItem = item => {
    return {
        id: uuid.v1(),
        ...item,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    };
};