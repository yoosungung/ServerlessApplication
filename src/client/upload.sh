npm run build
if [ -d "./dist" ]
then
  aws s3 cp s3://test.eric-yoo.com/app.config.json ./dist
  aws s3 rm s3://test.eric-yoo.com/ --recursive
  aws s3 cp ./dist s3://test.eric-yoo.com/ --recursive
fi