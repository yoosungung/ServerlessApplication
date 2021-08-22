const tableName = process.env.APP_TABLE;

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

exports.GetListHandler = async (event, context) => {
  //console.info('event:', JSON.stringify(event, null, 2));
  //console.info('context:', JSON.stringify(context, null, 2));

  let name = "";
  if (event.routeKey === "GET /api/list/{name}") {
    name = event.pathParameters.name;
  } else if (event.routeKey === "GET /api/code/{name}") {
    name = event.pathParameters.name;
  } else if (event.routeKey === "GET /api/info/{parent}") {
    name = event.pathParameters.parent;
  } else {
    throw new Error(`Lambda wrong invoke, you tried: ${event.routeKey} ${event.requestContext.http.pathParameters}`);
  }

  let params = {
    "TableName" : tableName, 
    "KeyConditionExpression": "INFO_GRP = :v_info_group",
    "ExpressionAttributeValues": { ":v_info_group": name }
  };

  if(event.routeKey === "GET /api/code/{name}") {
    if (event.queryStringParameters) {
      params["ProjectionExpression"] = `${event.queryStringParameters.value || "INFO_ID"}, ${event.queryStringParameters.text} || "title"`;
    } else {
      params["ProjectionExpression"] = "INFO_ID, title";
    }
  } else {
    if(event.queryStringParameters) {
      if (event.queryStringParameters.visible && event.requestContext.authorizer && event.requestContext.authorizer.lambda) {
        if (event.queryStringParameters.visible === "owner") {
          params["FilterExpression"] = "INFO_BY = :v_info_by";
          params.ExpressionAttributeValues[":v_info_by"] = `${event.requestContext.authorizer.lambda.group || '솔류션랩'}:${event.requestContext.authorizer.lambda.INFO_ID}`;
        } else if (event.queryStringParameters["visible"] === "group" ) {
          params["FilterExpression"] = "begins_with(INFO_BY, :v_info_by)";
          params.ExpressionAttributeValues[":v_info_by"] = event.requestContext.authorizer.lambda.group;
        }
      }
    }
  }

  console.info('query:', params);
  const data = await docClient.send(new QueryCommand(params));
  console.info('data:', data);
  const res = data.Items;

  const response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "isBase64Encoded": false,
    "body": JSON.stringify(res)
  };
  if(event.requestContext.authorizer && event.requestContext.authorizer.lambda && event.requestContext.authorizer.lambda.jwtoken) {
    response.headers['Authorization'] = event.requestContext.authorizer.lambda.jwtoken;
  }

  // All log statements are written to CloudWatch
  //console.info(`response from: ${event.requestContext.http.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

exports.AnyInfoParentIdHandler = async (event, context) => {
  //console.info('event:', JSON.stringify(event, null, 2));
  //console.info('context:', JSON.stringify(context, null, 2));

  const editAt = Date.now();
  let editBy = "Nogroup:Noname";
  if(event.requestContext.authorizer && event.requestContext.authorizer.lambda) {
    let grp = undefined;
    if(event.body) {
      grp = JSON.parse(event.body).group;
    }
    editBy = `${event.requestContext.authorizer.lambda.group || grp || "Nogroup"}:${event.requestContext.authorizer.lambda.INFO_ID || "Noname"}`;
  }

  let res = undefined;
  if (event.routeKey === "GET /api/info/{parent}/{id}") {
    const parent_id = event.pathParameters.parent;
    const id = event.pathParameters.id;

    let params = { "TableName" : tableName, Key: { "INFO_GRP": parent_id, "INFO_ID": id }};

    console.info('get:', params);
    const data = await docClient.send(new GetCommand(params));
    console.info('data:', data);
    res = data.Item;
  } else if (event.routeKey === "POST /api/info/{parent}/{id}") {
    const parent_id = event.pathParameters.parent;
    const id = event.pathParameters.id;

    let params = { 
      "TableName" : tableName,
      "Item": Object.assign(JSON.parse(event.body), { "INFO_GRP": parent_id, "INFO_ID": id, "INFO_BY": editBy, "INFO_AT": editAt })
    };

    console.info('put:', params);
    const data = await docClient.send(new PutCommand(params));
    console.info('data:', data);
    res = data;
  } else if (event.routeKey === "PUT /api/info/{parent}/{id}") {
    const parent_id = event.pathParameters.parent;
    const id = event.pathParameters.id;

    const setinfo = Object.assign(JSON.parse(event.body), { "INFO_BY": editBy, "INFO_AT": editAt });

    let updateExpression = "";
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};
    for (const key in setinfo) {
      if (!["INFO_GRP", "INFO_ID"].includes(key)) {
        if(updateExpression.length > 0) {
          updateExpression = updateExpression.concat(", #n_", key, " = :v_", key);
        } else {
          updateExpression = updateExpression.concat("SET #n_", key, " = :v_", key);
        }
        expressionAttributeNames["#n_" + key] = key;
        expressionAttributeValues[":v_" + key] = setinfo[key];
      }
    }

    let params = { 
      "TableName" : tableName, 
      "Key": { "INFO_GRP": parent_id, "INFO_ID": id },
      "UpdateExpression": updateExpression,
      "ExpressionAttributeNames": expressionAttributeNames,
      "ExpressionAttributeValues": expressionAttributeValues
    };

    console.info('update:', params);
    const data = await docClient.send(new UpdateCommand(params));
    console.info('data:', data);
    res = data;
  } else if (event.routeKey === "DELETE /api/info/{parent}/{id}") {
    const parent_id = event.pathParameters.parent;
    const id = event.pathParameters.id;

    let params = { 
      "TableName" : tableName, 
      "Key": { "INFO_GRP": parent_id, "INFO_ID": id }
    };

    console.info('delete:', params);
    const data = await docClient.send(new DeleteCommand(params));
    console.info('data:', data);
    res = data;
  } else if(event.routeKey === "POST /api/info/{name}") {
    const name = event.pathParameters.name;

    const { default: ShortUniqueId } = require('short-unique-id');
    const uid = new ShortUniqueId();
    const id = uid.stamp(32);

    let params = { 
      "TableName" : tableName, 
      "Item": Object.assign({ "INFO_TYPE": name }, JSON.parse(event.body), { "INFO_GRP": name, "INFO_ID": id, "INFO_BY": editBy, "INFO_AT": editAt })
    };

    console.info('put:', params);
    const data = await docClient.send(new PutCommand(params));
    console.info('data:', data);
    res = data.Item;
  } else {
    throw new Error(`Lambda wrong invoke, you tried: ${event.routeKey} ${event.requestContext.http.pathParameters}`);
  } 
  
  const response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "isBase64Encoded": false,
    "body": JSON.stringify(res)
  };
  if(event.requestContext.authorizer && event.requestContext.authorizer.lambda && event.requestContext.authorizer.lambda.jwtoken) {
    response.headers['Authorization'] = event.requestContext.authorizer.lambda.jwtoken;
  }

  // All log statements are written to CloudWatch
  //console.info(`response from: ${event.requestContext.http.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
