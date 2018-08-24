const express = require("express");
const reply = require("./reply");
const app = express();
const router = require("./router");

app.set("views","views");
app.set("view engine","ejs");

app.use(router);

app.use(reply());

app.listen(3000,err => {
    if(!err){
    console.log("服务器启动成功了~~")
    }
});