#!/bin/bash

# Stop and remove any existing container
echo "Stopping any existing dynamodb-local container..."
docker stop dynamodb-local 2>/dev/null || true
docker rm dynamodb-local 2>/dev/null || true

# Start DynamoDB Local
echo "Starting DynamoDB Local..."
docker run -d --name dynamodb-local -p 8000:8000 amazon/dynamodb-local

echo "Waiting for DynamoDB to start..."
sleep 5

# Create the stories table
echo "Creating stories table..."
aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name parable-stories \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=userId,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --no-cli-pager

# List tables to confirm creation
echo "Listing tables:"
aws dynamodb list-tables --endpoint-url http://localhost:8000 --no-cli-pager

echo "DynamoDB Local is running on http://localhost:8000"
echo "You can now update your .env.local file with:"
echo "AWS_REGION=local"
echo "AWS_ACCESS_KEY_ID=fakeMyKeyId"
echo "AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey"
echo "DYNAMODB_ENDPOINT=http://localhost:8000"
echo "DYNAMODB_STORIES_TABLE=parable-stories" 