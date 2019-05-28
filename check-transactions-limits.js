const AWS = require("aws-sdk");
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

const deleteSQSMessage = (QueueUrl, ReceiptHandle) => new Promise((resolve, reject) => {
    sqs.deleteMessage({
        QueueUrl,
        ReceiptHandle
    }, (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
});

const publishSNSMessage = (TopicArn, Message) => new Promise((resolve, reject) => {
    sns.publish({
        TopicArn,
        Message
    }, (err, data) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
});

exports.handler = async (event, context) => {
    const body = JSON.parse(event.Records[0].body);
    const total = body.total;
    const handler = event.Records[0].receiptHandle;
    const limit = parseInt(process.env.TRANSACTION_TOTAL_LIMIT, 10)

    // store receiived message
    await deleteSQSMessage(process.env.SQS_QUEUE_URL, handler);

    // if surpasses the limit then notify
    if (total > limit)  {
        await publishSNSMessage(process.env.SNS_TOPIC_ARN, 'Limited exceeded');
    }

    return;
};
