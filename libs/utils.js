//引入xml2js
const {parseString} = require("xml2js");
const {readFile, writeFile} = require("fs");
const {resolve} = require("path");
module.exports = {
  //获取用户信息的方法
  getUserDataAsync(req){
      return new Promise(((resolve, reject) => {
          let data = "";
          req
              .on("data",userData => {
                  //将获取的流式传输过来的信息进行拼接
                  data += userData;
              })
              .on("end",() => {
                  //用户信息获取完毕之后调用resolve()
                  resolve(data);
              })
      }))
  },

  //解析xml数据,拿到js对象
  parseXmlData(xmlData){
    return new Promise(((resolve, reject) => {
        parseString(xmlData,{trim:true},(err,data)=>{
        if(!err){
            resolve(data);
        }else{
            reject("parseXmlData方法出错了~~"+err)
        }
        })
    }))
  },

  //格式化js对象
  formatData(jsData){
     const data = jsData.xml;
     const message = {};
     for(var key in data){
         var value = data[key];
         if(Array.isArray(value) && value.length > 0){
             message[key] = value[0];
         }
     }
     return message;
  },

  //异步写入文件的方法
   writeFileAsync(fileName,data){
      const filePath = resolve(__dirname,fileName);
       return new Promise(((resolve, reject) => {
           data = JSON.stringify(data);
           writeFile(filePath, data, (err) => {
               if (!err) {
                   resolve();
               } else {
                   reject(" writeFileAsync方法出错了:" + err);
               }
           })
       }))
   },

   //异步读取文件的方法
    readFileAsync (fileName) {
        const filePath = resolve(__dirname, fileName);
        return new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if (!err) {
                    data = data.toString();
                    data = JSON.parse(data);
                    resolve(data);
                } else {
                    reject('readFileAsync方法出了问题：' + err);
                }
            })
        })
    }
};