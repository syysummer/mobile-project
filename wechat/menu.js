const {url} = require("../config");
module.exports = {
    "button":[
        {
            "type":"view",
            "name":"影院首页🎬",
            "url": url + "/movie"
        },
        {
            "type":"view",
            "name":"语音识别🍀",
            "url": url + '/search'
        },
        {
            "name":"戳我嘛💋",
            "sub_button":[
                {
                    "type": "click",
                    "name": "帮助💪",
                    "key": "help"
                },
                {
                    "type": "view",
                    "name": "官网首页☀",
                    "url": "https://movie.douban.com"
                }
            ]
        }
    ]
};