const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const getS3Object = (bucket, key) => new Promise((resolve, reject) => {
  s3.getObject({
    Bucket: bucket,
    Key: key
  }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

const sendSQSMessage = (QueueUrl, MessageBody) => new Promise((resolve, reject) => {
  sqs.sendMessage({
    QueueUrl,
    MessageBody
  }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

const storeDynamoDBItem = (TableName, Item) => new Promise((resolve, reject) => {
  dynamodb.put({
    TableName,
    Item
  }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

exports.handler = async (event, context) => {
  // get recently uploaded file
  const bucket = event.Records[0].s3.bucket.name;
  const objectKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  const s3Results = await getS3Object(bucket, objectKey);

  // parse CSV
  const csvData = s3Results.Body.toString('utf-8');
  const csvHeaders = csvData.split('\r')[0].split(',')
  const csvBody = csvData.split('\r').slice(1).map(row => {
    let fields = row.split(',');
    var fieldsObject = {};
    fields.forEach((field, index) => {
      fieldsObject[csvHeaders[index]] = field;
    });

    return fieldsObject;
  });

  // sum up all the transactions
  const summary = csvBody.reduce((prev, curr) => {
    prev.total += parseInt(curr.Price, 10) || 0;
    return prev;
  }, {
    timestamp: Date.now().toString(),
    total: 0
  });

  // store in dynamo
  await storeDynamoDBItem(process.env.DYNAMODB_TABLE_NAME, summary);

  // add to queue
  await sendSQSMessage(process.env.SQS_QUEUE_URL, JSON.stringify(summary));

  return;
};
