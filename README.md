# App On Aws
Serverless application on aws but not use severless framework. Instend aws cdk deploy resource that http api gateway and node lambda api, dynamodb persistent, s3 file. Additinal s3 web publish client.

## project

### app-server
1. Http Api gateway
  - `/api/sign/in` POST: lambda sign.js SignInHandler
  - Authorization : lamdba sign.js CheckHandler
  - `/api/list/{name}` GET: lambda items.js GetListHandler
  - `/api/code/{name}` GET: lambda items.js GetListHandler
  - `/api/info/{parent}` GET: lambda items.js GetListHandler
  - `/api/info/{name}` GET: lambda items.js AnyInfoParentIdHandler
  - `/api/info/{parent}/{id}` GET/POST/PUT/DELET: lambda items.js AnyInfoParentIdHandler
2. dynamedb
  - use one table model
  - `INFO_ID`: hash key  
    `INFO_NAME`: sort key  
    `INFO_TYPE`: data type  
    `INFO_BY`: edit user  
    `INFO_AT`: edit date
  - master list row is INFO_ID = type name, INFO_NAME = generate random key  
    child list rows is INFO_ID = parent INFO_NAME, INFO_ANME = generate random key  
3. S3 file
  - working ...
4. Step Function
  - planning ...

### app-client
1. web app architect
  - vue framework and vuetify widget
  - axios api client module
  - page is Home, List, Detail and Signin  
    componet is jEdit, jInfo, jSelect
2. vue router
  - `/List/{name}` is read app.config.json, find {name} type define. dynamic grid header and read data from api.
  - `/Detail/{name}/{id}` is read app.config.json, find {name} type define and child / reference type. set dynamic detail page and read data from api.

### app-sample
1. `app.config.json`  
   if you write application. it's mean that you write new app.config.json.

### application deploy
 * `npm run test`         perform the jest unit tests
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template
