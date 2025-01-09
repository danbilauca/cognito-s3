# Cognito S3 Object Lister

A Node.js application that demonstrates secure access to AWS S3 using AWS Cognito authentication and temporary credentials.

## Description

This application authenticates users through AWS Cognito User Pool, obtains temporary AWS credentials through Cognito Identity Pool, and uses these credentials to list objects in an S3 bucket. It implements the recommended security practice of using temporary credentials for AWS service access.

## Prerequisites

- Node.js installed on your system
- AWS account with configured:
  - Cognito User Pool
  - Cognito Identity Pool
  - S3 Bucket
  - Appropriate IAM roles and permissions

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```bash
AWS_REGION=<your-aws-region>
COGNITO_CLIENT_ID=<your-cognito-client-id>
COGNITO_USER_POOL_ID=<your-user-pool-id>
COGNITO_IDENTITY_POOL_ID=<your-identity-pool-id>
COGNITO_USERNAME=<your-username>
COGNITO_PASSWORD=<your-password>
S3_BUCKET_NAME=<your-s3-bucket-name>
```

## Dependencies

- @aws-sdk/client-cognito-identity: ^3.723.0
- @aws-sdk/client-cognito-identity-provider: ^3.723.0
- @aws-sdk/client-s3: ^3.723.0
- dotenv: ^16.4.7

## Usage

Run the application:
```bash
node index.js
```

The application will:
1. Authenticate the user with Cognito User Pool
2. Obtain temporary AWS credentials through Cognito Identity Pool
3. List objects in the specified S3 bucket using the temporary credentials

## Features

- Secure user authentication using AWS Cognito
- Implementation of temporary credentials for AWS service access
- S3 bucket object listing with size information
- Error handling for authentication and S3 operations

## Security

This application follows AWS security best practices by:
- Using environment variables for sensitive information
- Implementing temporary credentials instead of long-term access keys
- Utilizing Cognito Identity Pool for AWS service access
- Following the principle of least privilege

## Error Handling

The application includes error handling for:
- Authentication failures
- Credential retrieval issues
- S3 operation errors

## License

ISC
