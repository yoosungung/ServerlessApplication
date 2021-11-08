npm run build
if [ -d "./dist" ]
then
  aws --profile eric.yoo227 s3 cp s3://sample.eric-yoo.com/app.config.json ./dist
  aws --profile eric.yoo227 s3 rm s3://sample.eric-yoo.com/ --recursive
  rm -r ./dist/js/*.js.map
  aws --profile eric.yoo227 s3 cp ./dist s3://sample.eric-yoo.com/ --recursive
fi