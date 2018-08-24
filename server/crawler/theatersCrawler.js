//无头浏览器(获取热门回复中的相关信息)
const puppeteer = require("puppeteer");

module.exports = async url => {
    //1. 打开浏览器
    const browser = await puppeteer.launch({
        //设置在后台运行
        args: ['--no-sandbox']
    });
    //2. 打开页面
    const page = await browser.newPage();
    //3. 跳转到指定网址
    //waitUntil: 'networkidle0' 设置等待网络空闲时再访问
    await page.goto(url, {waitUntil: 'networkidle0'});
    // const p1 = new Promise((resolve,reject) => {
    //     setTimeout(function (){
    //         resolve()
    //     },1000)
    // });
    //
    // await p1();

    //4. 对页面进行操作
    const result = await page.evaluate( () => {
        //1. 获取页面中的上映时间
        const releaseDate = $("[property='v:initialReleaseDate']").text();
        //2. 获取电影的片长
        const runtime = $("[property='v:runtime']").text();
        //3. 获取电影的简介
        const summary = $("[property='v:summary']").text().replace(/\s+/g,"");
        return {
            releaseDate,
            runtime,
            summary
        }
    });


    //关闭浏览器
    await browser.close();
    console.log(result);
    return result;
};