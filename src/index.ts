// infra/utils/deploy-utils.ts
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

import type {
  CreateTableCommandInput,
  AttributeDefinition as SdkAttrDef,
  KeySchemaElement,
  GlobalSecondaryIndex as SdkGsi,
  LocalSecondaryIndex as SdkLsi,
  ProvisionedThroughput as SdkThroughput,
  StreamSpecification as SdkStreamSpec,
} from "@aws-sdk/client-dynamodb";

export function createTableInputFromTemplate(
  stack: cdk.Stack,
  table: dynamodb.Table
): CreateTableCommandInput {
  // Synthesize the stack first to resolve all tokens
  const app = stack.node.scope as cdk.App;
  app.synth();

  // Fully resolved template in memory
  const tpl = Template.fromStack(stack).toJSON() as any;

  // Get this table’s logical ID
  const cfn = table.node.defaultChild as dynamodb.CfnTable;
  const logicalId = stack.getLogicalId(cfn);

  const res = tpl.Resources?.[logicalId];
  if (!res || res.Type !== "AWS::DynamoDB::Table") {
    throw new Error(`Resource ${logicalId} not found or not a DynamoDB Table`);
  }
  const p = res.Properties ?? {};

  const input: CreateTableCommandInput = {
    TableName: p.TableName,
    AttributeDefinitions: (p.AttributeDefinitions ?? []) as SdkAttrDef[],
    KeySchema: (p.KeySchema ?? []) as KeySchemaElement[],
    BillingMode: p.BillingMode,
    ProvisionedThroughput: p.ProvisionedThroughput as SdkThroughput | undefined,
    LocalSecondaryIndexes: p.LocalSecondaryIndexes as SdkLsi[] | undefined,
    GlobalSecondaryIndexes: p.GlobalSecondaryIndexes as SdkGsi[] | undefined,
    StreamSpecification: p.StreamSpecification
      ? ({ StreamEnabled: true, StreamViewType: p.StreamSpecification.StreamViewType } as SdkStreamSpec)
      : undefined,
  };
  return input;
}

