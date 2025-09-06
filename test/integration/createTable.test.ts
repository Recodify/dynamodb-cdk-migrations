import 'mocha';
import { expect } from 'chai';
import { createTableInputFromTemplate } from '../../src';
import { createDynamoDBTable } from '../cdk/resources/testTabeDefinition';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { CreateDynamoDbClient } from '../dynamodb/create-Connection';
import { createEmptyCdkStack, createTestStack } from '../cdk/stacks/testStack';
import * as randomstring from 'randomstring';

describe('create Table from CDK', () => {
    it('should create table with floating stack', async () => {

        const testTableName = randomstring.generate(10);
        const mockStack = createEmptyCdkStack(testTableName);
        const tableDef = createDynamoDBTable(mockStack, randomstring.generate(10));
        const table = createTableInputFromTemplate(mockStack, tableDef);

        const client = CreateDynamoDbClient('local');
        const createTableCommand = new CreateTableCommand(table);
        const result = await client.send(createTableCommand);

        expect(result.TableDescription).to.exist;
        expect(result.TableDescription?.TableName).to.equal(table.TableName);
        expect(result.TableDescription?.TableStatus).to.equal('ACTIVE');
        expect(result.TableDescription?.KeySchema).to.deep.equal(table.KeySchema);
        expect(result.TableDescription?.AttributeDefinitions).to.deep.equal(table.AttributeDefinitions);
    });

    it('should create table with test stack', async () => {

        const testTableName = randomstring.generate(10);
        const stack = createTestStack(testTableName);
        const table = createTableInputFromTemplate(stack, stack.table);
        const client = CreateDynamoDbClient('local');

        const createTableCommand = new CreateTableCommand(table);
        const result = await client.send(createTableCommand);

        expect(result.TableDescription).to.exist;
        expect(result.TableDescription?.TableName).to.equal(table.TableName);
        expect(result.TableDescription?.TableStatus).to.equal('ACTIVE');
        expect(result.TableDescription?.KeySchema).to.deep.equal(table.KeySchema);
        expect(result.TableDescription?.AttributeDefinitions).to.deep.equal(table.AttributeDefinitions);
    });
});
