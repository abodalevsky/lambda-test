import dynamoDb, { createItem } from '../../../libs/dynamodb-lib';

export async function consume(event) {
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
                await dynamoDb.put(params);
            } catch (err) {
                console.error(err);
            }
            console.log(`sent id: ${Item.id}`);
        })
    );
};