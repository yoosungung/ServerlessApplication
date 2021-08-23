const cdk = require('@aws-cdk/core');

const s3 = require('@aws-cdk/aws-s3');
const s3deploy = require('@aws-cdk/aws-s3-deployment');
const path = require('path');
const iam = require('@aws-cdk/aws-iam');

const authorizers = require('@aws-cdk/aws-apigatewayv2-authorizers');
const apigateway = require('@aws-cdk/aws-apigatewayv2');
const integrations = require('@aws-cdk/aws-apigatewayv2-integrations');
const log = require('@aws-cdk/aws-logs');

const dynamodb = require('@aws-cdk/aws-dynamodb');

const lambda = require('@aws-cdk/aws-lambda');

class AppOnAwsStack extends cdk.Stack {
  /**
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const appUrl = 'test.eric-yoo.com';

    // web site ( s3 bucket )
    const websiteBucket = new s3.Bucket(this, 'websiteBucket', {
      bucketName: appUrl,
      versioned: false,
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html"
    });

    new s3deploy.BucketDeployment(this, 'websiteDeploy', {
      sources: [s3deploy.Source.asset('./src/client/dist')],
      destinationBucket: websiteBucket
    });

    // dynamodb
    const apiTable = new dynamodb.Table(this, 'apiTable', {
      partitionKey: { name: 'INFO_GRP', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'INFO_ID', type: dynamodb.AttributeType.STRING },
      BillingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    // role ( lambda, dynamodb )
    const funcRole = new iam.Role(this, 'apiFuncRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    funcRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"));
    funcRole.addToPolicy(
      new iam.PolicyStatement({
        resources: [apiTable.tableArn],
        actions: ['dynamodb:*'],
        effect: iam.Effect.ALLOW
      })
    );
    funcRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['kms:*'],
        effect: iam.Effect.ALLOW
      })
    );

    // lambda
    const SignInFunction = new lambda.Function(this, 'SignInFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/server')),
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      handler: 'sign.InHandler',
      environment: {
        APP_TABLE: apiTable.tableName,
        JWT_SECURE_KEY: 'json_web_token_scure_key_is_abdacadabra_!!',
        SMTP_CONFIG: '{"service":"smtp","host":"smtp.app.com","port":465,"secure":false,"auth":{"user": "user","pass":"pass"}}'
      },
      role: funcRole
    });
    const SignInIntegration = new integrations.LambdaProxyIntegration({ handler: SignInFunction });
    const AuthnCheckFunction = new lambda.Function(this, 'AuthnCheckFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/server')),
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      handler: 'sign.CheckHandler',
      environment: {
        APP_TABLE: apiTable.tableName,
        JWT_SECURE_KEY: 'json_web_token_scure_key_is_abdacadabra_!!',
      },
      role: funcRole
    });
    const GetListFunction = new lambda.Function(this, 'GetListFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/server')),
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      handler: 'items.GetListHandler',
      environment: {
        APP_TABLE: apiTable.tableName
      },
      role: funcRole
    });
    const GetListIntegration = new integrations.LambdaProxyIntegration({ handler: GetListFunction });
    const AnyInfoParentIdFunction = new lambda.Function(this, 'AnyInfoParentIdFunction', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/server')),
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      handler: 'items.AnyInfoParentIdHandler',
      environment: {
        APP_TABLE: apiTable.tableName
      },
      role: funcRole
    });
    const AnyInfoParentIdIntegration = new integrations.LambdaProxyIntegration({ handler: AnyInfoParentIdFunction });
    
    // api gateway ( http )
    const authnCheck = new authorizers.HttpLambdaAuthorizer({
      authorizerName: 'authnCheck',
      handler: AuthnCheckFunction,
      identitySource: ['$request.header.authorization'],
      responseTypes: [authorizers.HttpLambdaResponseType.IAM],
      resultsCacheTtl: cdk.Duration.seconds(60)
    });

    const httpApi = new apigateway.HttpApi(this, 'httpApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowMethods: ['*'],
        allowOrigins: [`http://${appUrl}`, 'http://localhost:8080'],
        exposeHeaders: ['authorization'],
        allowCredentials: false,
        maxAge: cdk.Duration.minutes(10)
      },
      defaultAuthorizer: authnCheck
    });

    httpApi.addRoutes({
      path: '/api/sign/in',
      methods: [ apigateway.HttpMethod.POST ],
      integration: SignInIntegration,
      authorizer: new apigateway.HttpNoneAuthorizer()
    });
    httpApi.addRoutes({
      path: '/api/list/{name}',
      methods: [ apigateway.HttpMethod.GET ],
      integration: GetListIntegration
    });
    httpApi.addRoutes({
      path: '/api/code/{name}',
      methods: [ apigateway.HttpMethod.GET ],
      integration: GetListIntegration
    });
    httpApi.addRoutes({
      path: '/api/info/{parent}',
      methods: [ apigateway.HttpMethod.GET ],
      integration: GetListIntegration
    });
    httpApi.addRoutes({
      path: '/api/info/{name}',
      methods: [ apigateway.HttpMethod.POST ],
      integration: AnyInfoParentIdIntegration
    });
    httpApi.addRoutes({
      path: '/api/info/{parent}/{id}',
      methods: [
        apigateway.HttpMethod.GET,
        apigateway.HttpMethod.POST,
        apigateway.HttpMethod.PUT,
        apigateway.HttpMethod.DELETE
      ],
      integration: AnyInfoParentIdIntegration
    });
    const logGroup = new log.LogGroup(this, 'httpapi-log')
    const stage = httpApi.defaultStage?.node.defaultChild;
    stage.accessLogSettings = {
      destinationArn: logGroup.logGroupArn,
      format: `$context.identity.sourceIp - [$context.requestTime - $context.requestId] "$context.routeKey $context.protocol" $context.status $context.error.message $context.authorizer.error $context.integration.error`
    }

  }
}

module.exports = { AppOnAwsStack }
