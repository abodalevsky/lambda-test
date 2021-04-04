const cdk = require('@aws-cdk/core');
const s3 = require('@aws-cdk/aws-s3');
const sqs = require('@aws-cdk/aws-sqs');
const lambda = require('@aws-cdk/aws-lambda-nodejs')
const dynamodb = require('@aws-cdk/aws-dynamodb');
const eventSource = require('@aws-cdk/aws-lambda-event-sources');
const api = require('@aws-cdk/aws-apigateway');

class TodoOrgStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const s3Bucket = new s3.Bucket(this, "ab-serverless-bucket", {
      versioned: false,
      bucketName: 'ab-serverless-test-04042001-1843',
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const toDoQueue = new sqs.Queue(this, 'ToDoQ', {
      queueName: 'todo-q'
    });

    const toDoTable = new dynamodb.Table(this, 'ToDoTable', {
      tableName: 'todo-t',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    this.createS3ToSqsHandler(this, s3Bucket, toDoQueue);
    this.createSqsToDynamoDbHandler(this, toDoQueue, toDoTable);

    const gateway = new api.RestApi(this, 'ToDoRest', {
      restApiName: 'todo-rest-api'
    });

    this.createRestApiHandler(this, gateway, toDoTable);
  }

  createS3ToSqsHandler(scope, bucket, sqs) {
    const l = new lambda.NodejsFunction(scope, 's3-sqs-lambda', {
      functionName: 's3-sqs-lambda',
      entry: 'src/s3-sqs-handler.js',
      handler: 'transformFile',
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'es2020'
      },
      environment: {
        QUEUE_URL: sqs.queueUrl
      }
    });

    l.addEventSource(new eventSource.S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ suffix: '.csv' }]
    }));

    sqs.grantSendMessages(l);

    bucket.grantRead(l);
  };

  createSqsToDynamoDbHandler(scope, sqs, table) {
    const l = new lambda.NodejsFunction(scope, 'sqs-dynamodb-lambda', {
      functionName: 'sqs-dynamodb-lambda',
      entry: 'src/sqs-table-handler.js',
      handler: 'consumeMessage',
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'es2020'
      },
      environment: {
        DYNAMODB_TABLE: table.tableName
      }
    });

    l.addEventSource(new eventSource.SqsEventSource(sqs));

    table.grantWriteData(l);
  };

  createRestApiHandler(scope, gateway, table) {
    const items = gateway.root.addResource('todo');
    const item = items.addResource('{id}');

    const createLambda = (functionName, handler) =>
      new lambda.NodejsFunction(scope, functionName, {
        functionName,
        entry: 'src/rest-api-handler.js',
        handler,
        bundling: {
          minify: true,
          sourceMap: false,
          target: 'es2020'
        },
        environment: {
          DYNAMODB_TABLE: table.tableName
        }
      });

    const add = createLambda('todo-add-lambda', 'add');
    table.grantWriteData(add);
    items.addMethod('POST', new api.LambdaIntegration(add));

    const list = createLambda('todo-list-lambda', 'list');
    table.grantReadData(list);
    items.addMethod('GET', new api.LambdaIntegration(list));

    const update = createLambda('todo-update-lambda', 'update');
    table.grantWriteData(update);
    item.addMethod('PUT', new api.LambdaIntegration(update));

    const del = createLambda('todo-delete-lambda', 'delete');
    table.grantWriteData(del);
    item.addMethod('DELETE', new api.LambdaIntegration(del));

    const get = createLambda('todo-get-lambda', 'get');
    table.grantReadData(get);
    item.addMethod('GET', new api.LambdaIntegration(get));
  };
}

module.exports = { TodoOrgStack }
