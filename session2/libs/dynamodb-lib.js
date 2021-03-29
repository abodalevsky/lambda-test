import { v1 } from 'uuid';
import AWS from "./aws-sdk";

const client = new AWS.DynamoDB.DocumentClient();

export const createItem = item => {
    return {
        id: v1(),
        ...item,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
    };
};

export default {
    get: (params) => client.get(params).promise(),
    put: (params) => client.put(params).promise(),
    scan: (params) => client.scan(params).promise(),
    update: (params) => client.update(params).promise(),
    delete: (params) => client.delete(params).promise(),
};