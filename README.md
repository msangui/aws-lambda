# AWS Serverless Lab

![diagram](https://i.ibb.co/QKY5zSq/Screen-Shot-2019-05-28-at-11-55-20-AM.png)

## Tasks
1. Enable CloudWatch logs.
Go to the CloudWatch service and do the "Get Started".
2. Create a SNS Topic and a SNS E-mail Subscription. Approve the subscription in your personal e-mail.
3. Create a DynamoDB table. Primary key: *timestamp*
4. Create S3 Bucket. Non-public.
5. Create SQS Queue.
6. Create Lambda Execution Role with the following attached policies:
  * AmazonSQSFullAccess
  * AmazonS3FullAccess
  * CloudWatchFullAccess
  * AmazonDynamoDBFullAccess
  * AWSLambdaSQSQueueExecutionRole
  * AmazonSNSFullAccess
7. Create the Lambda functions:
  * parse-transactions: triggered by S3 PUT event.
  * check-transactions-limits: triggered by SQS
8. Try it out


   
