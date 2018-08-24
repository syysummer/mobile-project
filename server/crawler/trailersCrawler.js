//无头浏览器(获取预告片相关信息)
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
    //4. 对页面进行操作
    let result = await page.evaluate( () => {
        //1. 获取页面中的上映时间
        const releaseDate = $("[property='v:initialReleaseDate']").text();
        //2. 获取电影的片长
        const runtime = $("[property='v:runtime']").text();
        //3. 获取电影的简介
        const summary = $("[property='v:summary']").text().replace(/\s+/g,"");
        let $video = $("[class='related-pic-video']");
        if($video.length){
            //4. 获取预告片封面
            const cover = $video.css("background-image").split("(")[1].split(")")[0].replace('"',"");
            console.log(cover);
            const link = $video.attr("href");
            console.log(link);
            return {
                releaseDate,
                runtime,
                summary,
                cover,
                link
            }
        }
    });
    if(result){
        //5. 获取视频素材
        //3. 跳转到指定网址
        //waitUntil: 'networkidle0' 设置等待网络空闲时再访问
        await page.goto(result.link, {waitUntil: 'networkidle0'});
        //删除result中的link属性
        delete result.link;
        //4. 对页面进行操作
        result.video = await page.evaluate( () => {
            return $("[class='vjs-tech']>source").attr("src");
        });
    }
    //关闭浏览器
    await browser.close();
    console.log(result);
    return result;
};