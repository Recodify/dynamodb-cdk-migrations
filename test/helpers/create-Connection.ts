
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export function CreateDynamoDbClient(region: string, endpoint: string = 'http://localhost:8000'): DynamoDBClient {
    const clientConfig: any = { region: region, endpoint: endpoint };
    return new DynamoDBClient(clientConfig);
}