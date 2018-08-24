const {appID, appsecret} = require("../config");
const rp = require("request-promise-native");
const request = require("request");
//引入文件读取模块
const {createReadStream, createWriteStream} = require("fs");
const api = require("../libs/api");
//引入菜单
const menu = require("./menu");

const utils = require("../libs/utils");

//使用类来创建获取AccessToken的方法
class Wechat {
    //获取access_token
    //定义获取getAccessToken的方法
    getAccessToken() {
        const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`;
        return new Promise(((resolve, reject) => {
            rp({method: "GET", json: true, url})
                .then((res) => {
                    //res是微信返回回来的数据
                    res.expires_in = Date.now() + (res.expires_in - 300) * 1000;
                    console.log("getAccessToken方法成功了");
                    resolve(res);
                })
                .catch((err) => {
                    reject("getAccessToken方法出错了:" + err);
                })
        }))
    }

    //定义保存saveAccessToken的方法
    saveAccessToken(data) {
        return utils.writeFileAsync("accessToken.txt", data)
    }

    //设置readAccessToken文件
    readAccessToken() {
        return utils.readFileAsync("accessToken.txt")
    }

    //设置验证isValueAccessToken的方法
    isValidAccessToken(data) {
        if (!data || !data.access_token || !data.expires_in) return false;
        return data.expires_in > Date.now();
    }

    //设置fetchAccessToken方法
    fetchAccessToken() {
        //优化步骤,避免重复读取文件
        if (this.expires_in && this.access_token && this.isValidAccessToken(this)) {
            //说明this上有access_token,并且没有过期
            return Promise.resolve({access_token: this.access_token, expires_in: this.expires_in})
        }
        return this.readAccessToken()
            .then(async (res) => {
                //判断读取到的数据是否已经过期
                if (this.isValidAccessToken(res)) {
                    //没有过期则使用数据
                    return Promise.resolve(res);
                } else {
                    //已经过期了,需要重新请求
                    const data = await this.getAccessToken();
                    //同时保存重新请求回来的AccessToken
                    await this.saveAccessToken(data);
                    return Promise.resolve(data);
                }
            })
            .catch(async err => {
                //AccessToken获取失败了需要重新请求
                const data = await this.getAccessToken();
                //同时保存重新请求回来的AccessToken
                await this.saveAccessToken(data);
                return Promise.resolve(data);
            })
            .then((res) => {
                this.access_token = res.access_token;
                this.expires_in = res.expires_in;
                return Promise.resolve(res);
            })
    }

    //获取ticket
    //定义获取getTicket的方法
    getTicket() {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.ticket}access_token=${res.access_token}`;
                    rp({method: "GET", json: true, url})
                        .then((res) => {
                            //res是微信返回来的数据
                            console.log("getTicket方法成功了");
                            resolve({
                                ticket: res.ticket,
                                expires_in: Date.now() + (res.expires_in - 300) * 1000
                            });
                        })
                        .catch((err) => {
                            reject("getTicket方法出错了:" + err);
                        })
                })
        })
    }

    //定义保存saveTicket的方法
    saveTicket(data) {
        return utils.writeFileAsync("Ticket.txt", data)
    }

    //设置readTicket文件
    readTicket() {
        return utils.readFileAsync("Ticket.txt")
    }

    //设置验证isValueTicket的方法
    isValidTicket(data) {
        if (!data || !data.access_token || !data.expires_in) return false;
        return data.expires_in > Date.now();
    }

    //设置fetchTicket方法
    fetchTicket() {
        //优化步骤,避免重复读取文件
        if (this.expires_in && this.ticket && this.isValidTicket(this)) {
            //说明this上有ticket,并且没有过期
            return Promise.resolve({ticket: this.ticket, expires_in: this.expires_in})
        }
        return this.readTicket()
            .then(async (res) => {
                //判断读取到的数据是否已经过期
                if (this.isValidTicket(res)) {
                    //没有过期则使用数据
                    return Promise.resolve(res);
                } else {
                    //已经过期了,需要重新请求
                    const data = await this.getTicket();
                    //同时保存重新请求回来的Ticket
                    await this.saveTicket(data);
                    return Promise.resolve(data);
                }
            })
            .catch(async err => {
                //Ticket获取失败了需要重新请求
                const data = await this.getTicket();
                //同时保存重新请求回来的Ticket
                await this.saveTicket(data);
                return Promise.resolve(data);
            })
            .then((res) => {
                this.ticket = res.ticket;
                this.expires_in = res.expires_in;
                return Promise.resolve(res);
            })
    }

    //上传临时素材
    upLoadTemporaryMaterial(type, filePath) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.temporary.upLoadMaterial}access_token=${res.access_token}&type=${type}`;
                    const formData = {
                        media: createReadStream(filePath)
                    };
                    rp({method: "POST", json: true, url, formData})
                        .then(res => {
                            resolve(res);
                        })
                        .catch(err => {
                            reject("upLoadTemporaryMaterial方法出错了~" + err)
                        })
                })
        });
    }

    //获取临时素材
    getTemporaryMaterial(mediaId, filePath, isVideo) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.temporary.downLoadMaterial}access_token=${res.access_token}&media_id=${mediaId}`;
                    if (isVideo) {
                        rp({method: "GET", json: true, url})
                            .then(res => resolve(res))
                            .catch(err => reject("getTemporaryMaterial方法出错了~~" + err))
                    } else {
                        request
                            .get(url)
                            .pipe(createWriteStream(filePath))
                            .once("close", () => {
                                resolve()
                            })
                    }
                })
                .catch(err => {
                    reject("getTemporaryMaterial方法出错了~~" + err)
                })
        })
    }

    //上传永久素材
    upLoadPermanentMaterial(type, material, description) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    let url = "";
                    let options = {
                        method: "POST",
                        json: true
                    };
                    if (type === "news") {
                        url = `${api.permanent.updateNews}access_token=${res.access_token}`;
                        options.body = material;
                    } else if (type === "pic") {
                        url = `${api.permanent.updateImage}access_token=${res.access_token}`;
                        options.formData = {
                            media: createReadStream(material)
                        }
                    } else {
                        url = `${api.permanent.updateOthers}access_token=${res.access_token}&type=${type}`;
                        options.formData = {
                            media: createReadStream(material)
                        };
                        if (type === "video") {
                            options.body = description;
                        }
                    }
                    options.url = url;
                    rp(options)
                        .then(res => resolve(res))
                        .catch(err => reject("upLoadPermanentMaterial方法出错了~~" + err))
                })
                .catch(err => {
                    reject(err);
                })
        })
    }

    //获取永久素材
    getPermanentMaterial(type, mediaId, filePath) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.permanent.get}access_token=${res.access_token}`;
                    const body = {
                        media_id: mediaId
                    };
                    if (type === "news" || "video") {
                        rp({method: "POST", json: true, url, body})
                            .then(res => {
                                resolve(res)
                            })
                            .catch(err => {
                                reject("getPermanentMaterial方法出错了~~")
                            })
                    } else {
                        request({method: "POST", json: true, url, body})
                            .pipe(createWriteStream(filePath))
                            .once("close", () => {
                                resolve();
                            })
                    }
                })
                .catch(err => {
                    reject(err)
                })
        })

    }

    //删除永久素材
    deletePermanentMaterial(mediaId) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.permanent.delete}access_token=${res.access_token}`;
                    const body = {
                        media_id: mediaId
                    };
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("deletePermanentMaterial方法出错了" + err))
                })
                .catch(err => {
                    reject("deletePermanentMaterial方法出错了" + err)
                })
        })
    }

    //更新修改永久素材
    updatePermanentMaterial(body) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.permanent.update}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("updatePermanentMaterial方法出错了"))
                })
                .catch(err => {
                    reject("updatePermanentMaterial方法出错了")
                })
        })
    }

    //获取图文信息的数量
    getPermanentCount() {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.permanent.getCount}access_token=${res.access_token}`;
                    rp({method: "GET", json: true, url})
                        .then(res => resolve(res))
                        .catch(err => reject("getPermanentCount方法出错了" + err))
                })
                .catch(err => {
                    reject("getPermanentCount方法出错了" + err)
                })
        })
    }

    //获取素材列表
    getPermanentList(body) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.permanent.getList}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("getPermanentList方法出错了" + err))
                })
                .catch(err => {
                    reject("getPermanentList方法出错了" + err)
                })
        })
    }

    //创建菜单
    createMenu(body) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.menu.create}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("createMenu方法出错了~~" + err))

                })
                .catch(err => {
                    reject("createMenu方法出错了~~" + err);
                })
        })

    }

    //删除菜单
    deleteMenu() {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.menu.delete}access_token=${res.access_token}`;
                    rp({method: "GET", json: true, url})
                        .then(res => resolve(res))
                        .catch(err => reject("deleteMenu方法出错了~~" + err))
                })
                .catch(err => {
                    reject("deleteMenu方法出错了~~" + err);
                })
        }))
    }

    //查询菜单
    getMenu() {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.menu.get}access_token=${res.access_token}`;
                    rp({method: "GET", json: true, url})
                        .then(res => resolve(res))
                        .catch(err => reject("getMenu方法出错了~~" + err))
                })
                .catch(err => {
                    reject("getMenu方法出错了~~" + err);
                })
        }))
    }

    //个性化菜创建
    createMyMenu(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.menu.myCreate}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("createMyMenu方法出错了~~" + err))
                })
                .catch(err => {
                    reject("createMyMenu方法出错了~~" + err);
                })
        }))
    }

    //个性化删除
    deleteMyMenu(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.menu.myDelete}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("deleteMyMenu方法出错了~~" + err))
                })
                .catch(err => {
                    reject("deleteMyMenu方法出错了~~" + err);
                })
        }))
    }

    //个性化菜单pipei
    testMyMenu(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.menu.myTest}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("testMyMenu方法出错了~~" + err))
                })
                .catch(err => {
                    reject("testMyMenu方法出错了~~" + err);
                })
        }))
    }

    //创建标签
    createTags(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.tag.createTags}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("createTags方法出错了~~" + err))
                })
                .catch(err => {
                    reject("createTags方法出错了~~" + err);
                })
        }))
    }

    //获取已经创建的标签
    getTags() {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.tag.getTags}access_token=${res.access_token}`;
                    rp({method: "GET", json: true, url})
                        .then(res => resolve(res))
                        .catch(err => reject("getTags方法出错了~~" + err))
                })
                .catch(err => {
                    reject("getTags方法出错了~~" + err);
                })
        }))
    }

    //更新已经创建的标签
    updateTags(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.tag.updateTag}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("updateTags方法出错了~~" + err))
                })
                .catch(err => {
                    reject("updateTags方法出错了~~" + err);
                })
        }))
    }

    //删除已经创建的标签
    deleteTags(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.tag.deleteTag}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("deleteTags方法出错了~~" + err))
                })
                .catch(err => {
                    reject("deleteTags方法出错了~~" + err);
                })
        }))
    }

    //获取标签下的粉丝列表
    getTagUsers(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.tag.getTagUsers}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("getTagUsers方法出错了~~" + err))
                })
                .catch(err => {
                    reject("getTagUsers方法出错了~~" + err);
                })
        }))
    }

    //批量为用户打标签
    batchUsersTag(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.user.batchUsersTag}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("batchUsersTag方法出错了~~" + err))
                })
                .catch(err => {
                    reject("batchUsersTag方法出错了~~" + err);
                })
        }))
    }

    //批量为用户取消标签
    unBatchUsersTag(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.user.unBatchUsersTag}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("batchUsersTag方法出错了~~" + err))
                })
                .catch(err => {
                    reject("batchUsersTag方法出错了~~" + err);
                })
        }))
    }

    //获取用户的标签列表
    getUserTags(body) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.user.getUserTags}access_token=${res.access_token}`;
                    rp({method: "POST", json: true, url, body})
                        .then(res => resolve(res))
                        .catch(err => reject("getUserTags方法出错了~~" + err))
                })
                .catch(err => {
                    reject("getUserTags方法出错了~~" + err);
                })
        }))
    }

    //获取所有用户
    getUsers(next_openid) {
        return new Promise(((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    let url = `${api.user.get}access_token=${res.access_token}`;
                    if (next_openid) {
                        url += "&next_openid=" + next_openid
                    }
                    rp({method: "GET", json: true, url})
                        .then(res => resolve(res))
                        .catch(err => reject("getUsers方法出错了~~" + err))
                })
                .catch(err => {
                    reject("getUsers方法出错了~~" + err);
                })
        }))
    }

    //根据标签群发
    sendAllByTag(type, tag_id, content, is_to_all = false, send_ignore_reprint = 0) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.sendAll.tag}access_token=${res.access_token}`;
                    const body = {
                        "filter": {
                            "is_to_all": false,
                            "tag_id": 2
                        }
                    };
                    if (type === "text") {
                        body[type] = {
                            content: content
                        }
                    } else if (type === "mpnews") {
                        body[type] = {
                            media_id: content
                        };
                        body.send_ignore_reprint = send_ignore_reprint;

                    } else {
                        body[type] = {
                            media_id: content
                        }
                    }
                    body.msgtype = type;
                    // console.log(body);
                    // { filter: { is_to_all: false, tag_id: 2 },
                    //     text: { content: '我是通过标签群发过来的消息' },
                    //     msgtype: 'text' }
                    rp({method: "POST", json: true, url, body})
                        .then(res => {
                            resolve(res)
                        })
                        .catch(err => {
                            reject("sendAllByTag方法出错了~~" + err)
                        })
                })
                .catch(err => {
                    reject("sendAllByTag方法出错了~~" + err)
                })
        })
    }

    //根据openID群发消息
    sendAllByUser(type, openid_list, content, send_ignore_reprint = 0, title, description) {
        return new Promise((resolve, reject) => {
            this.fetchAccessToken()
                .then(res => {
                    const url = `${api.sendAll.user}access_token=${res.access_token}`;
                    const body = {
                        touser: openid_list
                    };
                    if (type === "text") {
                        body.text = {
                            content
                        }
                    } else if (type === "mpnews") {
                        body[type] = {
                            media_id: content
                        };
                        body.send_ignore_reprint = send_ignore_reprint;
                    } else if (type === "mpvideo") {
                        body[type] = {
                            media_id: content,
                            title: title,
                            description: description
                        };
                        body.send_ignore_reprint = send_ignore_reprint;
                    } else {
                        body[type] = {
                            media_id: content
                        }
                    }
                    body.msgtype = type;
                    rp({method: "POST", json: true, url, body})
                        .then(res => {
                            resolve(res)
                        })
                        .catch(err => {
                            reject("sendAllByUser方法出错了~~" + err)
                        })
                })
                .catch(err => {
                    reject("sendAllByUser方法出错了~~" + err)
                })
        })
    }

}

//检测是否获取到了请求的数据
// new AccessToken().getAccessToken();
(async () => {
    const chatInstance = new Wechat();
    let data =  await chatInstance.deleteMenu();
    console.log(data);
    data = await chatInstance.createMenu(menu);
    console.log(data);
    data = await  chatInstance.getMenu();
    console.log(data); //{ menu: { button: [ [Object], [Object], [Object] ] } }

    const data1 = await chatInstance.fetchAccessToken();

    const data2 = await chatInstance.fetchTicket();


})();
module.exports = Wechat;