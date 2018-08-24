//引入结合模块
const Trailers = require("../../models/Trailers");
//引入爬取数据的模块
const trailersCrawler = require("../crawler/trailersCrawler");

//引入request-promise-native
const rp = require("request-promise-native");

//定义要访问的数据的url
const url = "https://api.douban.com/v2/movie/coming_soon";

module.exports = async () =>{
     //放送请求到到豆瓣中请求电影资源
    const {subjects} = await rp({method:"GET",json:true,url});
    //subjects是一个数组,需要将其中的内容遍历出来之后一次添加至集合中
    for(let i = 0;i < subjects.length;i++){
        let subject = subjects[i];
        //更具subject的alt爬取相应的数据
        const result = await trailersCrawler(subject.alt);
        if (!result) continue;
        //由于subject中的casts和directors是一个数组(包含信息较多),而我们只需要其中的name值
        //需要对其进行遍历,取出其name值
        let casts = [];//演员
        subject.casts.forEach(item => {
            casts.push(item.name)
        });
        let directors = [];//导演
        subject.directors.forEach(item => {
            directors.push(item.name)
        });
        //将获取到的数据添加到集合中
        Trailers.create({
            title: subject.title,
            rating: subject.rating.average,
            genres: subject.genres,
            casts,
            directors,
            images:subject.images.medium,
            alt:subject.alt,
            doubanId:subject.id,
            //通过爬虫爬取到的数据releaseDate,runtime,summary
            releaseDate: result.releaseDate,
            runtime: result.runtime,
            summary:result.summary,
            cover:result.cover,
            video:result.video
        })
    }
};