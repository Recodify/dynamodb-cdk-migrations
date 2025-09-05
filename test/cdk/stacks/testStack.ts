
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createDynamoDBTable } from '../resources/testTabeDefinition';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class TestStack extends cdk.Stack {
    public table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: any) {
        super(scope, id, props);

        this.table = createDynamoDBTable(this, props.tableName);
    }
}

export function createTestStack(tableName: string) {
    const app = new cdk.App();
    const props = createEmptyProps(tableName);
    const stack = new TestStack(app, "teststack", props);
    return stack;
}

export function createEmptyProps(tableName: string, region: string = 'local') {
    return {
        tableName: tableName,
        // Give it literals to avoid Tokens creeping in
        env: { account: '000000000000', region: region },
    }
}

export function createEmptyCdkStack(tableName: string, region: string = 'scpoe'): cdk.Stack {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'LocalDdbStack', createEmptyProps(tableName, region));
    return stack;
}