const db = require("../db");
const Theaters = require("../models/Theaters");
const Trailers = require("../models/Trailers");
const saveTheaters = require("./save/saveTheaters");
const saveTrailers = require("./save/saveTrailers");
//引入七牛云
const upLoadToQiniu = require("./qiniu");
(async () => {
   await db;
   // await Theaters.remove();
   await Trailers.remove();
   // await saveTheaters();
   // await upLoadToQiniu("images",Theaters);

    await saveTrailers();
    await upLoadToQiniu("images",Trailers);
    await upLoadToQiniu("cover",Trailers);
    await upLoadToQiniu("video",Trailers);
})();