const bucketName = process.env.USER_BUCKET || 'default-user-files';

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const s3config = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  },
  region: process.env.AWS_REGION,
};
const s3 = new S3Client(s3config);

exports.GetS3FileHandler = async (event, context) => {
  //console.info('event:', JSON.stringify(event, null, 2));
  //console.info('context:', JSON.stringify(context, null, 2));

  const params = {Bucket: bucketName};
  let command = undefined;
  if (event.routeKey === "GET /api/files/{key+}") {
    params['Prefix'] = event.pathParameters.key;
    command = new ListObjectsCommand(params);
  } else if (event.routeKey === "GET /api/file/{key+}") {
    params['Key'] = event.pathParameters.key;
    command = new GetObjectCommand(params);
  } else if (event.routeKey === "PUT /api/file/{key+}") {
    params['Key'] = event.pathParameters.key;
    command = new PutObjectCommand(params);
  } else {
    throw new Error(`Lambda wrong invoke, you tried: ${event.routeKey} ${event.requestContext.http.pathParameters}`);
  }

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "isBase64Encoded": false,
    "body": JSON.stringify({key: event.pathParameters.key, url: signedUrl, method: event.requestContext.http.method})
  };
  if(event.requestContext?.authorizer?.lambda?.jwtoken) {
    response.headers['Authorization'] = event.requestContext.authorizer.lambda.jwtoken;
  }

  // All log statements are written to CloudWatch
  //console.info(`response from: ${event.requestContext.http.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
