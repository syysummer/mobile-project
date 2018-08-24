//创建模块专门处理根据用户的相应信息回复相应信息
//引入template模块
const template = require("./template");
const {url} = require("../config");
const rp = require("request-promise-native");
const Theaters = require("../models/Theaters");
const db = require("../db");
module.exports = async message => {
    await db;
    //判断用户发过来的信息
    let content = "";
    let options = {
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName,
        createTime: Date.now(),
        msgType: "text"
    };
    // { ToUserName: 'gh_6a8e11646c83',
    //     FromUserName: 'o4Ts40nLlJ5pG-xXMZVRqQqqkf9g',
    //     CreateTime: '1530012789',
    //     MsgType: 'text',
    //     Content: '222',
    //     MsgId: '6571354891701019799' }
    if (message.MsgType === "text") {
        if (message.Content === "首页") {
            content = [{
                title: '菜鸟影院预告片首页',
                description: '这里有最新的电影',
                picUrl: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=3919369988,3818251822&fm=27&gp=0.jpg',
                url:  url + '/movie'
            }];
            options.msgType = 'news';
        }else if(message.Content === "热门"){
            //1. 获取到数据库中的电影的数据
            const data = await Theaters.find({});
            content = [];
            for(let i = 0;i < data.length - 1;i++){
                var item = data[i];
                content.push({
                    title: item.title,
                    description: item.rating,
                    picUrl:item.images,
                    url: url + "/details/" + item.doubanId
                })
            }
            options.msgType = "news";
        }else if (message.Content === "图文消息") {
            //回复图文消息
            content = [{
                title: 'Nodejs开发',
                description: '微信公众号开发',
                picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
                url: 'http://nodejs.cn/'
            }, {
                title: 'web前端',
                description: '这里有最新、最强的技术',
                picUrl: 'https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1981851186,10620031&fm=58&s=6183FE1ECDA569015C69A554030010F3&bpow=121&bpoh=75',
                url: 'http://www.atguigu.com/'
            }];
            options.msgType = 'news';
        }else {
            //1. 获取到最新的热门电影的数据,借助豆瓣API实现
            const url = 'https://api.douban.com/v2/movie/search';
            const {subjects} = await rp({method: 'GET', json: true, url, qs: {count: 8, q: message.Content}});
            console.log(subjects);
            content = [];
            for(let i = 0;i < subjects.length;i++){
                let subject = subjects[i];
                content.push({
                    title: subject.title,
                    description: subject.rating.average,
                    picUrl:subject.images.small,
                    url:subject.alt
                })
            }
            options.msgType = "news";
        }
    } else if (message.MsgType === "voice"){
        //1. 获取到最新的热门电影的数据,借助豆瓣API实现
        const url = 'https://api.douban.com/v2/movie/search';
        const {subjects} = await rp({method: 'GET', json: true, url, qs: {count: 8, q: message.Recognition}});
        console.log(subjects);
        content = [];
        for(let i = 0;i < subjects.length;i++){
            let subject = subjects[i];
            content.push({
                title: subject.title,
                description: subject.rating.average,
                picUrl:subject.images.small,
                url:subject.alt
            })
        }
        options.msgType = "news";
    }else if (message.MsgType === "event") {
        if (message.Event === "subscribe") {
            content = '欢迎您关注菜鸟影院公众号~ \n' +
                '回复 首页 查看菜鸟影院首页~ \n' +
                '回复 热门 查看热门电影信息~ \n' +
                '回复 文字消息 搜索电影信息~ \n' +
                '回复 语音消息 搜索电影信息~ \n' +
                '也可以点击链接跳转<a href="' + url + '/search">语音识别电影</a>';
            if (message.EventKey) {
                content = "欢迎扫描二维码订阅"
            }
        } else if (message.Event === "CLICK") {
            content = '您可以按以下提示进行操作： \n' +
                '回复 首页 查看菜鸟影院首页~ \n' +
                '回复 热门 查看热门电影信息~ \n' +
                '回复 文字消息 搜索电影信息~ \n' +
                '回复 语音消息 搜索电影信息~ \n' +
                '也可以点击链接跳转<a href="' + url + '/search">语音识别电影</a>';
        } else if (message.Event === "unsubscribe") {
            content = "你就要这样无情的抛弃我吗?呜呜~~~"
        }
    }
    options.content = content;
    // console.log(content);
    return template(options)
};

//http://mp.weixin.qq.com/s?__biz=MzUyNjkwMDcwNQ==&mid=100000010&idx=1&sn=a0028cca925fd8d098db603c833482d7&chksm=7a068d844d710492811d4d7efe6f3c84c23e8650a6cbdd90a42072fd476a98c28903536bd3b8#rd