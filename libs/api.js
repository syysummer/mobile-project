//定义接口的模块
const prefix = "https://api.weixin.qq.com/cgi-bin/";
module.exports = {
   accessToken:prefix+"token?grant_type=client_credential",
   ticket: prefix+ "ticket/getticket?type=jsapi&",
   temporary:{
       upLoadMaterial:prefix+"media/upload?",
       downLoadMaterial:prefix+"media/get?"
   },
    permanent:{
       updateNews:prefix + "material/add_news?",//更新图文消息
       updateImage:prefix + "media/uploadimg?",//更新图片消息
       updateOthers:prefix + "material/add_material?",//更新其他图文消息(需要传参数type)
       get:prefix + "material/get_material?",//获取素材图片
       delete:prefix + "del_material?", //删除素材图片
       update:prefix + "material/update_news?",//更新修改图文素材
       getCount:prefix + "material/get_materialcount?",//获取图文总数
       getList:prefix + "material/batchget_material?"//获取图文列表
    },
    menu:{
       create:prefix+"menu/create?",
       delete:prefix+"menu/delete?",
       get:prefix+"menu/get?",
       myCreate:prefix + "menu/addconditional?",
       myDelete:prefix+"menu/delconditional?",
       myTest:prefix+"menu/trymatch?"
    },
    tag:{
       createTags:prefix+"tags/create?",
       getTags:prefix+"tags/get?",
       updateTag:prefix+"tags/update?",
       deleteTag:prefix+"tags/delete?",
       getTagUsers:prefix+"user/tag/get?"
    },
    user:{//用户的批量管理
        batchUsersTag:prefix+"tags/members/batchtagging?",
        unBatchUsersTag:prefix+'tags/members/batchuntagging?',
        getUserTags:prefix+"tags/getidlist?",
        get:prefix+"user/get?" //获取所有用户列表(单独选项中)
    },
    sendAll:{
      tag:prefix + "message/mass/sendall?",
      user:prefix+"message/mass/send?"
    }
};