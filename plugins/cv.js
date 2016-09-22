var _ = require('underscore');
var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::engine");
// var Faced = require('./lib/faced');
var Faced = require('faced');
var faced = new Faced();
var cv  = require('opencv');
var Canvas = require('canvas');
var Image = Canvas.Image;
var canvas, ctx;

exports.faceSwap = function (source, newFace, cb){
    // TODO 验证jpg,png,jpeg等后缀名 null
    if(typeof source !== "object" || typeof newFace !== "object") {
        logger.error("<faceSwap(source, newFace, cb)> parameters need image file stream");
        return cb(new Error('parameters error'), source);
    }
    
    faced.detect(source, function(faces, draw, file){

        if (!faces || faces.length === 0) {
            // 参数正确但是没有检测到脸
            return cb(null, source)
        }
        var img = new Image;
        img.src = source;
        var emoji = new Image;
        emoji.src = newFace;
        canvas =  new Canvas(draw.width(), draw.height());
        ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        _.each(faces, function (face) {
            ctx.save(); // 每次调用前保存状态 这个好像是node-canvas的bug

            // 获取头的旋转
            if(face.getEyeLeft() && face.getEyeRight() && face.getMouth()) {
                
                var leftEye = {
                    x: face.getEyeLeft().getX(),
                    y: face.getEyeLeft().getY()
                }
                var rightEye = {
                    x: face.getEyeRight().getX(),
                    y: face.getEyeRight().getY()
                }

                var deg = Math.atan((rightEye.y - leftEye.y)/(rightEye.x - leftEye.x))
                ctx.translate(face.x+face.width/2, face.y+face.height/2)
                ctx.rotate(deg * Math.PI/180);
                ctx.translate(-face.x-face.width/2, -face.y-face.height/2)
            }

            ctx.drawImage(emoji, face.x, face.y, face.width, face.width);
            ctx.restore();
        });

        return cb(null, canvas.toBuffer());
        // debug
        // var fs = require('fs')
        // var c = canvas.toBuffer();
        // fs.writeFile('test.jpg', c, function(err) {
        //     if(err){
        //         console.log(err);
        //     }else{
        //         console.log("保存成功！");
        //     }
        // });
    })
}

// VERB("http", "_strip_", strip);
