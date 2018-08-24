const sha1 = require("sha1");
const config = require("../config");
const {getUserDataAsync,parseXmlData,formatData} = require("../libs/utils");
const reply = require("./reply");
module.exports = ()=>{
    //中间件函数
    return async (req,res,next) => {
        // console.log(req.query);
        // console.log(req.query);
        //用户发送过来的消息可以通过req.query来获取
        //    { signature: '18c3b73f91f8a935c18c43194c96187c298891cc', //微信的加密签名
        //     echostr: '17049403807248674527', //随机字符串
        //     timestamp: '1529980445', //时间戳
        //     nonce: '1657943129' } //随机数字
        const {signature, echostr, timestamp, nonce} = req.query;
        const {token} = config; //token是微信公众平台的用户标记.类似于用户名
        const arr = [timestamp,nonce,token]; //将这三个数字组成一个数组排序后进行sha1加密
        const sha1Str = sha1(arr.sort().join(""));

        //判断请求是否是get请求,验证服务器有效性
        if(req.method === "GET"){
            if(sha1Str === signature){
                res.send(echostr);
            }else{
                res.send("error");
            }
        }else if(req.method === "POST"){//如果是post请求,微信服务器将用户发过来的消息转发到开发者的服务器上
            if(sha1Str !== signature){
                res.send("error");
                return
            }
            //1.获取微信服务器发送过来的信息
            const xmlData = await getUserDataAsync(req);
            // console.log(xmlData);
            //2.将xml格式的数据解析成js对象
            const jsData = await parseXmlData(xmlData);
            // console.log(jsData);
            //3.格式化js对象
            const message = formatData(jsData);
            // console.log(message);

            //将回复给用户的消息转换成XML格式
            // let replyMessage = "<xml>" +
            //     "<ToUserName><![CDATA["+message.FromUserName+"]]></ToUserName>" +
            //     "<FromUserName><![CDATA["+message.ToUserName+"]]></FromUserName>" +
            //     "<CreateTime>"+ Date.now()+"</CreateTime>" +
            //     "<MsgType><![CDATA[text]]></MsgType>" +
            //     "<Content><![CDATA["+ content +"]]></Content>" +
            //     "</xml>";
            // let reMessage = '<xml>' +
            //     '<ToUserName><![CDATA[' + message.FromUserName + ']]></ToUserName>' +
            //     '<FromUserName><![CDATA[' + message.ToUserName + ']]></FromUserName>' +
            //     '<CreateTime>' + Date.now() + '</CreateTime>' +
            //     '<MsgType><![CDATA[text]]></MsgType>' +
            //     '<Content><![CDATA[' + content + ']]></Content>' +
            //     '</xml>';
            const replyMessage = await reply(message);
            console.log(replyMessage);
            res.send(replyMessage);
        }
    };
};