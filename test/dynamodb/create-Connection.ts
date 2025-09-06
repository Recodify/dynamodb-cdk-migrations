
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

export function CreateDynamoDbClient(region: string, endpoint: string = 'http://localhost:8000'): DynamoDBClient {
    const clientConfig: DynamoDBClientConfig = {
        region: region,
        endpoint: endpoint,
        credentials: {
            accessKeyId: 'fake',
            secretAccessKey: 'fake'
        }
    };
    return new DynamoDBClient(clientConfig);
}