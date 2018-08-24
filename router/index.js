const express = require("express");
const Wechat = require('../wechat/wechat');
const {url} = require('../config');
const Theaters = require("../models/Theaters");
const Trailers = require("../models/Trailers");
const Danmus = require("../models/Danmus");
const reply = require('../reply');
const Router = express.Router;
const sha1 = require('sha1');
const router = new Router();

const wechatApi = new Wechat();

router.get("/search",async (req,res) => {
    // 签名生成规则如下：参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 。
    // 使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。
    // 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序），
    // 这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，不进行URL转义。
    //获取ticket
    const {ticket} = await wechatApi.fetchTicket();
    //得到随机字符串
    const noncestr = Math.random().toString().split(".")[1];
    const timestamp = Date.now();
    const params = [
        "jsapi_ticket="+ticket,
        "noncestr="+noncestr,
        "timestamp="+timestamp,
        "url="+url+"/search"
    ];
    // console.log(params);
    // [ 'jsapi_ticket=HoagFKDcsGMVCIY2vOjf9m9_qwvuA5rALAIk-qOnOWOS8sdTyS2amixq-2YhAw0J4p3oCrcRMVIECeONX9m3QA',
    //     'noncestr=5457452379576004',
    //     'timestamp=1530287987125',
    //     'url=http://f5e195cd.ngrok.io/search' ]

    const str = params.sort().join("&");
    const signature = sha1(str);
    console.log(signature);
    res.render("search",{
        signature,
        noncestr,
        timestamp,
    })
});

router.get("/details/:id",async (req,res) => {
    const {id} = req.params;
    let data = await Theaters.findOne({doubanId:id});
    res.render("details",{data})
});

router.get("/movie",async (req,res) =>{
    //去数据库中查找数据
    const movies = await Trailers.find({});
    //将数据渲染到页面
    res.render("movies",{movies,url})

});

//处理用户发送弹幕的路由
router.post("/v2",async (req,res) => {
   //1. 获取用户发送的消息
    let result0 = "";
   //2. 确保数据都接收完成,并将json格式的数据转换成对象
    req
     .on("data",data =>{
         result0 += data.toString();
     })
     .on("end",async (err) =>{
       if(!err){
           console.log(result0);
           let result = JSON.parse(result0);
           //3. 保存到数据库中
            const d1 = await Danmus.create({
               player: result.player,    //弹幕的id
               author: result.author,  //用户
               time:result.time,     //弹幕的发送时间
               text:result.text,  //弹幕的内容
               color:result.color,     //弹幕的字体颜色
               type:result.type,     //弹幕的初始出现位置
           });
       }
         res.json({"message":"ok"});
    });
});

//当视频播放时,根据播放器Id值,从数据库中查找弹幕数据返回给指定播放器
router.get("/v2",(req,res)=>{
 //获取播放器的id
 const {id} = req.query;
 //从数据库中查找该播放器的弹幕消息
 const danMus = Danmus.find({player:id});
 let danMu = [];
    // {
    //     "code": 0,
    //     "version": 2,
    //     "danmaku": [
    //     [
    //         3.3964,
    //         0,
    //         "#fff",
    //         "DIYgod",
    //         "11111"
    //     ]
    // ]
    // }
 for(let i = 0;i < danMus.length;i++){
     danMu.push([danMus[i].time,danMus[i].permission,danMus[i].color,danMus[i].author,danMus[i].text]);
 }
 res.send({
    code: 0,
    version: 2,
    danMu
 })
});

module.exports = router;

