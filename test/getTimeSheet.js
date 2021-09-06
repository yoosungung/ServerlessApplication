require("dotenv").config();
const tableName = process.env.APP_TABLE;
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

const startDay = "2021-08-01";
const halfDay = "2021-08-15";
const endDay = "2021-08-31";
const first_total = getDateValue(startDay, halfDay);
const last_total = getDateValue(halfDay, endDay);

function getDateValue (firstDay, lastDay) {
  const firstDate = new Date(firstDay).valueOf();
  const lastDate = new Date(lastDay).valueOf();
  return lastDate - firstDate;
}

//exports.
getTimeSheetHandler = async (event, context) => {
  try {
    console.log('strat...');
    const empList = await docClient.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "INFO_GRP = :this_infoGrp",
      FilterExpression: "#this_Group = :this_Group",
      ExpressionAttributeNames: {
        "#this_Group": "group"
      },
      ExpressionAttributeValues: { 
        ":this_infoGrp" : "employee",
        ":this_Group" : "솔루션랩"
      }
    }));
    for(const emp of empList.Items) {
      let works = { title: emp.title, rank: emp.rank, first_pay: 0.0, first_free: 0.0, last_pay: 0.0, last_free: 0.0 };
      const res = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "INFO_GRP = :this_infoGrp",
        FilterExpression: "INFO_TYPE = :this_infoType AND startday <= :this_startDay AND endday >= :this_endDay",
        ExpressionAttributeValues: { 
          ":this_infoGrp": emp["INFO_ID"],
          ":this_infoType" : "workhistory",
          ":this_startDay" : startDay,
          ":this_endDay": endDay
        }
      }));
      for(const wk of res.Items) {
        const rate = Number(wk["rate"]) / 200.0;
        const firt_val = getDateValue((wk["startday"]<startDay?startDay:wk["startday"]), (wk["endday"]<halfDay?wk["endday"]:halfDay));
        if(firt_val > 0) {
          if(["하자조치(유상)","MA(유상)","투입(유상)","지원(유상)"].includes(wk["workcondition"])) {
            works.first_pay += (firt_val / first_total) * rate;
          } else if(["하자조치(무상)","투입(무상)","지원(무상)"].includes(wk["workcondition"])) {
            works.first_free += (firt_val / first_total) * rate;
          }
        }
        const last_val = getDateValue((wk["startday"]<halfDay?halfDay:wk["startday"]), (wk["endday"]<endDay?wk["endday"]:endDay));        
        if(last_val > 0) {
          if(["하자조치(유상)","MA(유상)","투입(유상)","지원(유상)"].includes(wk["workcondition"])) {
            works.last_pay += (last_val / last_total) * rate;
          } else if(["하자조치(무상)","투입(무상)","지원(무상)"].includes(wk["workcondition"])) {
            works.last_free += (last_val / last_total) * rate;
          }
        }
      }
      console.log(works);
    }
  } catch (error) {
    console.error(error);
  } finally {
    console.log('...end');
  }
}

getTimeSheetHandler();
