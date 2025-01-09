require('dotenv').config();
const { CognitoIdentityProviderClient, InitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } = require('@aws-sdk/client-cognito-identity');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const region = process.env.AWS_REGION;
if (!region) {
    throw new Error('AWS_REGION must be defined in environment variables');
}

// Initialize Cognito client without credentials
const cognitoClient = new CognitoIdentityProviderClient({
    region: region
});

// Initialize Cognito Identity client without credentials
const identityClient = new CognitoIdentityClient({
    region: region
});

async function authenticateUser() {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
            USERNAME: process.env.COGNITO_USERNAME,
            PASSWORD: process.env.COGNITO_PASSWORD
        }
    };

    try {
        const command = new InitiateAuthCommand(params);
        const response = await cognitoClient.send(command);
        return response.AuthenticationResult.IdToken;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

async function getTemporaryCredentials(idToken) {
    try {
        // Get Identity ID
        const getIdParams = {
            IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
            Logins: {
                [`cognito-idp.${region}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`]: idToken
            }
        };
        
        const getIdCommand = new GetIdCommand(getIdParams);
        const { IdentityId } = await identityClient.send(getIdCommand);

        // Get Credentials
        const getCredentialsParams = {
            IdentityId,
            Logins: {
                [`cognito-idp.${region}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`]: idToken
            }
        };

        const getCredentialsCommand = new GetCredentialsForIdentityCommand(getCredentialsParams);
        const credentials = await identityClient.send(getCredentialsCommand);
        
        return credentials.Credentials;
    } catch (error) {
        console.error('Error getting temporary credentials:', error);
        throw error;
    }
}

async function listS3Objects(credentials) {
    // Initialize S3 client with temporary credentials
    const s3Client = new S3Client({
        region: region,
        credentials: {
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretKey,
            sessionToken: credentials.SessionToken
        }
    });

    const params = {
        Bucket: process.env.S3_BUCKET_NAME
    };

    try {
        const command = new ListObjectsV2Command(params);
        const response = await s3Client.send(command);
        return response.Contents;
    } catch (error) {
        console.error('Error listing objects:', error);
        throw error;
    }
}

async function main() {
    try {
        // Authenticate user and get ID token
        const idToken = await authenticateUser();
        console.log('Successfully authenticated user');

        // Get temporary AWS credentials
        const credentials = await getTemporaryCredentials(idToken);
        console.log('Successfully obtained temporary credentials');

        // List S3 objects using temporary credentials
        const objects = await listS3Objects(credentials);
        console.log('Objects in bucket:');
        objects.forEach(obj => {
            console.log(`- ${obj.Key} (Size: ${obj.Size} bytes)`);
        });
    } catch (error) {
        console.error('Application error:', error);
    }
}

main();
