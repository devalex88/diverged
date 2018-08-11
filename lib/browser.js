'use strict';

var img1 = new Image();
img1.onload = isReady;
img1.src = "http://127.0.0.1:3000/fixtures/lpc/chwu_ref.png"; // insert image url here

var img2 = new Image();
img2.onload = isReady;
img2.src = "http://127.0.0.1:3000/fixtures/lpc/chwu_test.png"; // insert image url here

var hasRun = false;

function isReady() {
    if (
        img1.complete && 
        img2.complete && 
        !hasRun
    ) {
        hasRun = true;
        main();
    }
}

function main() {
    console.time("total_time");

    const h = img2.height;
    const w = img2.width;

    const img1Ctx = imageToCanvasContext(img1);
    const img2Ctx = imageToCanvasContext(img2);

    const pixelmatchResultImgData = getEmptyImgData(h, w);
    pixelmatch(
        getImgDataDataFromContext(img1Ctx),
        getImgDataDataFromContext(img2Ctx),
        pixelmatchResultImgData.data,
        w,
        h, 
        { threshold: .3, includeAA: true }
    );

    console.time("pixelmatchResult");
    const pixelmatchResult = imageToCanvasContext(null, w, h);
    pixelmatchResult.putImageData(pixelmatchResultImgData, 0, 0);
    console.timeEnd("pixelmatchResult");

    console.time("different");
    const differentImgData = different(getImgDataDataFromContext(img1Ctx), getImgDataDataFromContext(img2Ctx), h, w);
    console.timeEnd("different");

    // meyersImgData.data = differentImgData;
    console.time("imgDataToMeyersImgData");
    let clampedImgData = getEmptyImgData(h, w)
    for (var i = differentImgData.length - 1; i >= 0; i--) {
        clampedImgData.data[i] = differentImgData[i];
    }
    var meyersDiffResult = imageToCanvasContext(null, w, h);
    meyersDiffResult.putImageData(clampedImgData, 0, 0);
    console.timeEnd("imgDataToMeyersImgData");
    console.log('meyersDiffResult>>>', clampedImgData);

    console.timeEnd("total_time");

    document.getElementById('refImage').src = img1Ctx.canvas.toDataURL("image/png");
    document.getElementById('testImage').src = img2Ctx.canvas.toDataURL("image/png");
    document.getElementById('pixelmatch').src = pixelmatchResult.canvas.toDataURL("image/png");
    document.getElementById('meyersResult').src = meyersDiffResult.canvas.toDataURL("image/png");

}




/**
 * ========= HELPERS ========
 */

function getImgDataDataFromContext(context) {
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height).data;
}

function getEmptyImgData(h, w) {
    var o = imageToCanvasContext(null, h, w);
    return o.createImageData(w, h);
}

// function getEmptyImgContext(h, w) {
//     var o = imageToCanvasContext(null, h, w);
//     o.createImageData(w, h);
//     return o;
// }

function imageToCanvasContext(_img, w, h) {
    let img = _img;
    if (!_img) {
        img = { width: w, height: h };
    }
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    if (_img) {
        context.drawImage(img, 0, 0);
    }
    return context;
}