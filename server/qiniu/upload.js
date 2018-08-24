//引入七牛库
const qiniu = require("qiniu");
//设定accessKey和secretKey
const accessKey = 'GzRKWEkn_wshmyEm9IBxu-IjszivqbLxugsO-kU7';
const secretKey = 'Gtm7fWOxS52kIuZfj3ciYVYdj-wBdaoE2Tqhx0xM';
//生成鉴权对象
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
//生成配置对象
const config = new qiniu.conf.Config();
//七牛空间的空间名称
const bucket = 'movies';
//生成实例对象
const bucketManager = new qiniu.rs.BucketManager(mac,config);
module.exports = (resUrl,key) => {
   return new Promise((resolve,reject)=>{
       bucketManager.fetch(resUrl, bucket, key, function(err, respBody, respInfo) {
           if (err) {
               reject("upload方法出错了~"+err)
               //throw err;
           } else {
               if (respInfo.statusCode === 200) {
                  resolve();
               }
           }
       });
   })
};


