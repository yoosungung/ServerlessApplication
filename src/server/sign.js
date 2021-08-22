const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECURE_KEY;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '10m';

const nodemailer = require('nodemailer');
const mailConfig = JSON.parse(process.env.SMTP_CONFIG || '{}');

const tableName = process.env.APP_TABLE || 'default-app-table';
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

const bucketName = process.env.USER_BUCKET || 'default-user-files';

exports.InHandler = async (event, context) => {
  //console.info('event:', event);
  //console.info('context:', context);

  const data = JSON.parse(event.body);
  let reponse = {
    "statusCode": 500,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": ""
    },
    "isBase64Encoded": false,
    "body": "{\"message\": \"Internal error !\"}"
  };
  
  try {
    const smtpAuth = Object.assign(mailConfig);
    smtpAuth.auth.user = data.id;
    smtpAuth.auth.pass = data.password;

    const conntion = nodemailer.createTransport(smtpAuth);
    const res = await conntion.verify();
    if (res) {
      const res = await docClient.send(new GetCommand({
        "TableName" : tableName, 
        "Key" : {
          "INFO_GRP": "employee", 
          "INFO_ID": data.id 
        }
      }));
      const token = await jwt.sign(
                      res.Item || { "INFO_ID" :  data.id },
                      jwtSecretKey,
                      { expiresIn: jwtExpiresIn }
                    );
      reponse.statusCode = 200;
      reponse.headers.Authorization = token;
      reponse.body = JSON.stringify({"signin": "ok", "Authorization": token});
    } else {
      console.info('smtp return: ', conntion);
      reponse.statusCode = 535;
      reponse.body = "{\"message\": \"Access denied. Please check your id, password\"}";
    }
    //console.info('reponse: ', reponse);
    return reponse;

  } catch (error) {
    console.error('error: ', error);
    return reponse;
  }
};

exports.CheckHandler = async (event, context) => {
  //console.info('event:', event);
  //console.info('context:', context);

  const tokenList = event.identitySource;

  let statLambda = {
    "Action": "execute-api:Invoke",
    "Effect": "Deny",
    "Resource": `arn:aws:execute-api:ap-northeast-2:${event.requestContext.accountId}:${event.requestContext.apiId}/v1/*/api/*`
  }

  let res = {
    "principalId": "user:app-on-aws-authn",
    "policyDocument": {
      "Version": "2012-10-17",
      "Statement": [ statLambda ]
    },
    "context": {}
  };

  for(let token of tokenList) {
    try {
      const decoded = await jwt.verify(token, jwtSecretKey);
      statLambda.Effect = "Allow";
      res.principalId = `${decoded.INFO_ID}::app-on-aws-authn`;

      delete decoded.exp;
      delete decoded.iat;
      res.context = decoded;
      const refreshToken = await jwt.sign(decoded, jwtSecretKey, { expiresIn: jwtExpiresIn });
      res.context['jwtoken'] = refreshToken;
    } catch(err) {
      console.info('verify error:', err);
    }
  }

  //console.info('res:', JSON.stringify(res));
  return res;
};
