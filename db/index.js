const mongoose = require("mongoose");
module.exports = new Promise((resolve, reject) => {
    //连接数据库
    mongoose.connect("mongodb://localhost:27017/movies");
   //监听数据库是否连接成功
    mongoose.connection.once("open",(err) =>{
        if(!err){
            console.log("数据库连接成功了~~");
            resolve();
        }else{
            console.log("数据库连接失败了~~"+err)
        }
    })
});