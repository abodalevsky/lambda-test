# lambda-sessions

## Session 1

### API to DynamoDB
Folder `session1\todo-controller` 

API:
URL must be updated.
#### Add
```bash
curl --location --request POST 'https://atpopdqjzd.execute-api.us-east-1.amazonaws.com/dev/todo' \
--header 'Content-Type: application/json' \
--data-raw '{
    "done": false,
    "message": "First item"
}'
```
Response will contain ID

#### Update
ID should be valid
```bash
curl --location --request PUT 'https://atpopdqjzd.execute-api.us-east-1.amazonaws.com/dev/todo/5de69a20-8b15-11eb-a810-fba5f92b56b3' \
--header 'Content-Type: application/json' \
--data-raw '{
    "done": false,
    "message": "Second item"
}'
```
#### Delete
ID should be valid
```bash
curl --location --request DELETE 'https://atpopdqjzd.execute-api.us-east-1.amazonaws.com/dev/todo/c99d5ec0-8b15-11eb-ae9b-e732c30755c5'
```

#### Get
ID should be valid
```bash
curl --location --request GET 'https://atpopdqjzd.execute-api.us-east-1.amazonaws.com/dev/todo/5de69a20-8b15-11eb-a810-fba5f92b56b3'
```

#### Get All
```bash
curl --location --request GET 'https://atpopdqjzd.execute-api.us-east-1.amazonaws.com/dev/todo'
```

### S3 to SQS
Folder `csv-parser` - source of handler

Folder `csv-files` - example of csv fileto processing.

BucketName: ab-serverless-test-23032001-1201

CSV file should be valid. It is assumed that first line is a caption and ignored.

## Session 2
1. Go to each folders in resources and run 
```bash
sls deploy
```
2. Go to each folder in services and run
```bash
sls deploy
```
3. upload csv file from session 1
4. check that items where added
```bash
curl --location --request GET 'https://atpopdqjzd.execute-api.us-east-1.amazonaws.com/dev/todo'
```
