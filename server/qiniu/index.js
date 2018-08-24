const upLoad = require("./upload");
//引入nanoid库生成随机字符串
const nanoid = require("nanoid");
module.exports = async(type,model) => {
    let opt1 = {};
    let opt2 = {};
    let opt3 = {};
    let keyType = "";
    let typeName = ".jpg";
    if(type === "images"){
     keyType = "posterKey";
    }else if(type === "cover"){
        keyType = "coverKey";
    }else if(type === "video"){
        keyType = "videoKey";
        typeName = ".mp4"
    }
    //从数据库中读取到媒体资源的路径相关信息
    const resources = await model.find({
        $or:[opt1,opt2,opt3]
    });
    //将从数据库中读取的数据进行遍历后,上传到七牛云中
    for(let i = 0;i < resources.length;i++){
        let resource = resources[i];
        let resUrl = resource[type];
        let key = nanoid() + typeName;
        //上传到七牛云
        await upLoad(resUrl,key);
        //为了确保七牛云的资源与数据库一一对应,需要将key存入到数据库中
        resource[keyType] = key;
        await resource.save(err =>{
            if(!err){
              console.log("插入成功");
              console.log(key);
            }
        })
    }
};

