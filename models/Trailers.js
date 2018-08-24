const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const trailersSchema = new Schema({
    title: String,
    rating: Number,
    genres: [String],
    casts: [String],
    directors: [String],
    images: String,
    alt: String,
    doubanId: {
        type: String,
        unique: true
    },
    //通过爬虫爬取到的数据releaseDate,runtime,summary
    releaseDate: String,
    runtime: String,
    summary: String,
    cover:String,
    video:String,
    //七牛图片的key值
    posterKey: String,
    coverKey: String,
    videoKey: String,
    createTime: {
        type: Date,
        default: Date.now()
    }
});
const Trailers = mongoose.model("Trailers",trailersSchema);

module.exports = Trailers;