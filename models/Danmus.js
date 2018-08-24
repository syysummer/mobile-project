//专门存储播放器弹幕信息的集合
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DanmusSchema = new Schema({
    player: String,    //弹幕的id
    author: String,  //用户
    time:Number,     //弹幕的发送时间
    text:String,  //弹幕的内容
    color:String,     //弹幕的字体颜色
    type:String,     //弹幕的初始出现位置
    permission: {        //权限
        type: Number,
        default: 0
    }
});
const Danmus = mongoose.model("Danmus",DanmusSchema);

module.exports = Danmus;