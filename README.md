# DynamoDb-Local CDK Migrations

![main](./images/recodify.png)

CDK to DynamoDB-local bridge. Deploy your CDK defined tables locally, with zero drift.

> ⚠️ **Early MVP/POC**: This project is in very early development and serves as a proof of concept. APIs may change significantly and features are limited. Use at your own risk in production environments.

## Overview

This project provides utilities to bridge AWS CDK DynamoDB table definitions with local DynamoDB instances. It allows you to deploy and test your CDK-defined DynamoDB tables locally without any configuration drift from your production infrastructure.

## Features

- ✅ **Zero Drift**: Ensures local tables match your CDK definitions exactly
- 🔧 **CDK Integration**: Works directly with your existing CDK table definitions
- 🧪 **Testing Support**: Built-in test utilities for integration testing
- 📝 **Type Safe**: Full TypeScript support with AWS SDK v3

## Prerequisites

- Node.js (v16 or later)
- DynamoDB Local running (for testing)
- AWS CDK v2

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```typescript
import { createTableInputFromTemplate } from './src/index';
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';

// Create your CDK stack and table definition
const stack = new cdk.Stack();
const table = new dynamodb.Table(stack, 'MyTable', {
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
});

// Convert CDK definition to DynamoDB SDK format
const tableInput = createTableInputFromTemplate(stack, table);

// Create table in local DynamoDB
const client = new DynamoDBClient({ endpoint: 'http://localhost:8000' });
const command = new CreateTableCommand(tableInput);
await client.send(command);
```

### Real-World Usage with CDK App

```typescript
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { createTableInputFromTemplate } from './src/index';

// Define your CDK stack class
class UserManagementStack extends cdk.Stack {
  public readonly userTable: dynamodb.Table;
  public readonly sessionTable: dynamodb.Table;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Users table with GSI
    this.userTable = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // Add GSI for email lookup
    this.userTable.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Session table with TTL
    this.sessionTable = new dynamodb.Table(this, 'Sessions', {
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'expiresAt',
    });
  }
}

// Initialize and deploy to local DynamoDB
async function deployToLocal() {
  // Create CDK app and stack
  const app = new cdk.App();
  const stack = new UserManagementStack(app, 'UserManagementStack');

  // Initialize DynamoDB client for local development
  const client = new DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'local',
    credentials: {
      accessKeyId: 'fake',
      secretAccessKey: 'fake'
    }
  });

  try {
    // Deploy user table
    const userTableInput = createTableInputFromTemplate(stack, stack.userTable);
    await client.send(new CreateTableCommand(userTableInput));
    console.log('✅ Users table created successfully');

    // Deploy session table
    const sessionTableInput = createTableInputFromTemplate(stack, stack.sessionTable);
    await client.send(new CreateTableCommand(sessionTableInput));
    console.log('✅ Sessions table created successfully');

    console.log('🚀 Local DynamoDB tables deployed successfully!');
  } catch (error) {
    console.error('❌ Failed to deploy tables:', error);
  }
}

// Run deployment
deployToLocal();
```

### Project Structure

```
src/
└── index.ts                  # Core utility functions
test/
├── cdk/
│   ├── resources/
│   │   └── testTabeDefinition.ts  # Test table definitions
│   └── stacks/
│       └── testStack.ts       # Test CDK stacks
├── dynamodb/
│   └── create-Connection.ts   # DynamoDB client helpers
└── integration/
    └── createTable.test.ts    # Integration tests
images/
└── recodify.png              # Project logo
package.json
tsconfig.json
```

## Testing

### Run Integration Tests

```bash
npm run test:integration
```

The integration tests verify that:
- Tables are created successfully from CDK definitions
- Table configurations match the CDK specifications exactly
- Key schemas and attribute definitions are preserved
- Table status is properly set to ACTIVE

### Test Requirements

- DynamoDB Local must be running on the default port (8000)
- Tests use Mocha with Chai assertions
- TypeScript compilation handled by ts-node

## API Reference

### `createTableInputFromTemplate(stack, table)`

Converts a CDK DynamoDB table definition to AWS SDK `CreateTableCommandInput`.

**Parameters:**
- `stack` (cdk.Stack): The CDK stack containing the table
- `table` (dynamodb.Table): The CDK table construct

**Returns:**
- `CreateTableCommandInput`: Ready-to-use input for AWS SDK CreateTableCommand

**Features:**
- Preserves all table properties (keys, indexes, throughput, streams)
- Handles both provisioned and on-demand billing modes
- Supports Global and Local Secondary Indexes
- Maintains stream specifications

## Development

### Dependencies

**Production:**
- `@aws-sdk/client-dynamodb`: AWS SDK v3 for DynamoDB operations
- `aws-cdk-lib`: AWS CDK v2 library
- `constructs`: CDK constructs library

**Development:**
- `mocha` + `chai`: Testing framework
- `typescript` + `ts-node`: TypeScript support
- `@types/*`: Type definitions

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for your changes
4. Ensure all tests pass (`npm run test:integration`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

ISC

## Support

For issues, questions, or contributions, please open an issue on the project repository.