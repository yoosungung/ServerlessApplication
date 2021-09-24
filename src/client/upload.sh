npm run build
if [ -d "./dist" ]
then
  aws s3 cp s3://pms.slab-obzen.com/app.config.json ./dist
  aws s3 rm s3://pms.slab-obzen.com/ --recursive
  aws s3 cp ./dist s3://pms.slab-obzen.com/ --recursive
fi