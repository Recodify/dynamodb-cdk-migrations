import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export function createDynamoDBTable(stack: cdk.Stack, tableName: string): dynamodb.Table {
  const table = new dynamodb.Table(stack, 'TestStack', {
    tableName: tableName,
    partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
  });

  // GSI1 - User → Lists
  table.addGlobalSecondaryIndex({
    indexName: 'GSI1',
    partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
  });

  // GSI2 - User → Events (optional for MVP)
  table.addGlobalSecondaryIndex({
    indexName: 'GSI2',
    partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
  });

  return table;
}