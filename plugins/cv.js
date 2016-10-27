var log4js = require('log4js');
var logger = log4js.getLogger("morphkit::engine");
var Faced = require('../thirdparty/faced');
var faced = new Faced();
var cv = require('opencv');
var Canvas = require('canvas');
var Image = Canvas.Image;
var canvas, ctx;

function _faceSwap(source, newFace, cb) {

    if (typeof source !== "object" || typeof newFace !== "object") {
        logger.error("<faceSwap(source, newFace, cb)> parameters need image file stream");
        return cb(new Error('parameters error'), source);
    }

    faced.detect(source, function (faces, draw, file) {
        try {
            if (!faces || faces.length === 0) {
                // 参数正确但是没有检测到脸
                return cb(null, source)
            }
            var img = new Image;
            img.src = source;
            var emoji = new Image;
            emoji.src = newFace;
            canvas = new Canvas(draw.width(), draw.height());
            ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);

            for (var i = 0; i < faces.length; i++) {
                var face = faces[i];
                ctx.save(); // 每次调用前保存状态 这个好像是node-canvas的bug

                // 获取头的旋转
                // if (face.getEyeLeft() && face.getEyeRight() && face.getMouth()) {

                    // var leftEye = {
                    //     x: face.getEyeLeft().getX(),
                    //     y: face.getEyeLeft().getY()
                    // }
                    // var rightEye = {
                    //     x: face.getEyeRight().getX(),
                    //     y: face.getEyeRight().getY()
                    // }

                    // var deg = Math.atan((rightEye.y - leftEye.y) / (rightEye.x - leftEye.x))
                    ctx.translate(face.x + face.width / 2, face.y + face.height / 2)
                    // ctx.rotate(deg * Math.PI / 180);
                    ctx.translate(-face.x - face.width / 2, -face.y - face.height / 2)
                // }

                ctx.drawImage(emoji, face.x, face.y, face.width, face.width);
                ctx.restore();
            };

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
        } catch (e) {
            return cb(e);
        }
    })

}


function _finline_() {
    var args = this[0];
    return `
        //contenttype(/(image|jpeg|png|gif)/i)
        loadContent(/(image|jpeg|png|gif)/i, true)
        ._faceSwap_()
    `;
}


//plugin
//replace this file :)
var emojiFile = [ require('fs').readFileSync('/Users/doge/Desktop/dummyFaces/e8.png'),
   require('fs').readFileSync('/Users/doge/Desktop/dummyFaces/e9.png') ]
function faceSwap(env, ctx, next) {
    if (ctx.ended) {
        return next(); //skip
    }
    ctx.events.on('upstream', (_, cb) => {
        //content ready :)
        // console.log(ctx.upstream.res_write_buffer)
        if (ctx.upstream.res_write_buffer) {
            //content good 
            ctx.upstream.res_write_buffer = new Buffer(ctx.upstream.res_write_buffer);
            _faceSwap(
                ctx.upstream.res_write_buffer,
                emojiFile[parseInt(Math.floor(emojiFile.length * Math.random()))],
                function (err, res) {
                    if (err) {
                        return cb(err);
                    } else {
                        ctx.upstream.res_write_buffer = res; //replaced :)
                        return cb();
                    }
                });
        } else {
            return cb();
        }
    });
    next();
}

//register plugin
VERB("http", "_faceSwap_", faceSwap);
INLINE("http", "faceSwap", _finline_);