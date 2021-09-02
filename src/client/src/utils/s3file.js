
module.exports.file2api = function(fileIndex, files, datas) {
  if(fileIndex && files && datas) {
    const fileObject = files[fileIndex];
    if(fileObject) {
      datas[fileIndex] = {
        'lastModified': fileObject['lastModified'],
        'lastModifiedDate': fileObject['lastModifiedDate'],
        'name': fileObject['name'],
        'size': fileObject['size'],
        'type': fileObject['type']
      };
    }
  }
}

module.exports.api2file = function(fileIndex, files, datas) {
  if(fileIndex && files && datas) {
    const fileData = datas[fileIndex];
    if(fileData?.name) {
      files[fileIndex] = new File([], fileData['name'], {
        'lastModified': fileData['lastModified'],
        'lastModifiedDate': fileData['lastModifiedDate'],
        'type': fileData['type']
      });
    }
  }
}

module.exports.getFile = function(file) {
  console.log(file);
}

module.exports.putFile = function(file) {
  console.log(file);
}
