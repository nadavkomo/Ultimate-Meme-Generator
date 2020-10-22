'use strict'

var gImgs = [
    { id: 1, url: 'img/meme-imgs (various aspect ratios)/2.jpg', keywords: ['funny'] },
    { id: 2, url: 'img/meme-imgs (various aspect ratios)/003.jpg', keywords: ['animal'] },
    { id: 3, url: 'img/meme-imgs (various aspect ratios)/004.jpg', keywords: ['cute', 'animal'] },
    { id: 4, url: 'img/meme-imgs (various aspect ratios)/5.jpg', keywords: ['cute', 'animal'] },
];

function addImg(url, keywords) {
    gImgs.push({
        id: gImgs.length + 1,
        url,
        keywords,
        upload: true,
    })
}


var gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    lines: []
}

function init() {
    if (loadFromStorage('gMeme')) {
        gMeme = loadFromStorage('gMeme')
    }
    renderCanvas()
}

function removeLine(idxLine) {
    gMeme.lines.splice(idxLine, 1)
}

function getImgById(imgId) {
    return gImgs.find(img => img.id === imgId)
}

function getCurrLine() {
    return gMeme.lines[gMeme.selectedLineIdx - 1]
}

function clearCanvas() {
    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height)
}

function canvasClicked(ev) {
    const { offsetX, offsetY } = ev;
    const clickedLine = gMeme.lines.forEach((line, idx) => {
        var lineHeight = +line.size * 1.286;
        var lineWidth = gCtx.measureText(line.text).width;
        if (offsetX > line.x && offsetX < line.x + lineWidth && offsetY > line.y && offsetY < line.y + lineHeight) {
            renderCanvas()
            gMeme.selectedLineIdx = idx + 1
            console.log(gMeme);
            setTimeout(function() {
                buildRectOnText(line.size, line.text, line.x, line.y);
                return line;
            }, 100)
        }
    })

}

// const currLine = getCurrLine()
// if (line = currLine) {
//     buildRectOnText(currLine.size, currLine.text, currLine.x, currLine.y)
// }

function renderCanvas() {
    clearCanvas()
    if (gImgs[gMeme.selectedImgId - 1].upload) {
        gCtx.drawImage(gImgs[gMeme.selectedImgId - 1].url, 0, 0);
    } else {
        setBgImg(gMeme.selectedImgId)
    }
    setTimeout(function() {
        gMeme.lines.forEach((line, idx) => {
            drawText(idx, line.x, line.y)
        })
    }, 100)
}


function setBgImg(imgId) {
    const currImg = getImgById(+imgId)
    drawImg(currImg.url)
}

function drawImg(imgUrl) {
    var img = new Image()
    img.src = `./${imgUrl}`;
    img.onload = () => {
        // console.log(gCanvas);
        gCanvas.height = (img.height * gCanvas.width) / img.width;
        // console.log(gCanvas);
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
    }
    saveToStorage('gMeme', gMeme)
}

function drawText(selectedLineIdx, x = 250, y = 100) {
    const text = gMeme.lines[selectedLineIdx].text;
    const size = gMeme.lines[selectedLineIdx].size
        // const align = gMeme.lines[selectedLineIdx].align;
    const strokeColor = gMeme.lines[selectedLineIdx].strokeColor;
    const fillColor = gMeme.lines[selectedLineIdx].fillColor;
    const font = gMeme.lines[selectedLineIdx].font
    gMeme.lines[selectedLineIdx].x = x;
    gMeme.lines[selectedLineIdx].y = y;
    gCtx.strokeStyle = strokeColor
    gCtx.fillStyle = fillColor
    gCtx.lineWidth = '2'
    gCtx.font = `${size}px ${font}`
    gCtx.textAlign = 'left'
    gCtx.textBaseline = 'top';
    gCtx.fillText(text, x, y)
    gCtx.strokeText(text, x, y)
}

function buildRectOnText(fontSize, text, x, y) {
    var lineHeight = fontSize * 1.286;
    var textWidth = gCtx.measureText(text).width;
    gCtx.strokeRect(x, y, textWidth, lineHeight);
}

function onImgInput(ev) {
    loadImageFromInput(ev, uploadCanvasBg)
}

function uploadCanvasBg(img) {
    gCtx.drawImage(img, 0, 0);
    addImg(img)
    gMeme.selectedImgId = gImgs.length
    renderCanvas()
}

function loadImageFromInput(ev, onImageReady) {
    document.querySelector('.share-container').innerHTML = ''
    var reader = new FileReader();

    reader.onload = function(event) {
        var img = new Image();
        img.onload = onImageReady.bind(null, img)
        img.src = event.target.result;
    }
    reader.readAsDataURL(ev.target.files[0]);
}

function downloadImg(elLink) {
    var imgContent = gCanvas.toDataURL('image/jpeg');
    elLink.href = imgContent
}










function toMemeEditor(className) {
    const elPrevLink = document.querySelector('.active');
    elPrevLink.classList.remove('active')
    const elEditor = document.querySelector('.meme-editor')
    elEditor.style.display = 'flex';
    const elGallery = document.querySelector('.gallery')
    elGallery.style.display = 'none';
    const elAbout = document.querySelector('.about')
    elAbout.style.display = 'none';
    // renderCanvas(className.split(' ')[1])
    gMeme.selectedImgId = className.split(' ')[1]
    setBgImg(className.split(' ')[1])
    renderCanvas()
}

function toGallery(elLink) {
    const elPrevLink = document.querySelector('.active');
    if (elPrevLink) elPrevLink.classList.remove('active')
    elLink.classList.add('active');
    const elGallery = document.querySelector('.gallery')
    elGallery.style.display = 'block';
    const elEditor = document.querySelector('.meme-editor')
    elEditor.style.display = 'none';
    const elAbout = document.querySelector('.about')
    elAbout.style.display = 'none';

}

function toAbout(elLink) {
    const elPrevLink = document.querySelector('.active');
    if (elPrevLink) elPrevLink.classList.remove('active')
    elLink.classList.add('active');
    const elEditor = document.querySelector('.meme-editor')
    elEditor.style.display = 'none';
    const elGallery = document.querySelector('.gallery')
    elGallery.style.display = 'none';
    const elAbout = document.querySelector('.about')
    elAbout.style.display = 'block';
}