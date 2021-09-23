require("dotenv").config();
const tableName = process.env.APP_TABLE;
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

const bucketName = process.env.USER_BUCKET || 'default-user-files';
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({ region: process.env.AWS_REGION });

const csvfile = "results.csv";
const csv = require("csv-parse");

//exports.
restoreTableHandler = async (event, context) => {
  try {
    console.log('strat...');
    const file = await s3.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: csvfile
    }));
    const parser = file.Body.pipe(csv({
      columns: true,
      delimiter: ',',
      trim: true,
      skip_empty_lines: true,
    }));

    let item;
    for await (const record of parser) {
      item = {};
      for (const [key, value] of Object.entries(record)) {
        if(value != "") {
          item[key] = value;
        }        
      }
      const res = await docClient.send(new PutCommand({ 
        "TableName" : tableName,
        "Item": item
      }));
    }
  } catch (error) {
    console.error(error);
  } finally {
    console.log('...end');
  }
}

restoreTableHandler();
