'use strict'

var gImgs = [
    { id: 1, url: 'img/meme-imgs (various aspect ratios)/2.jpg', keywords: ['caractor', 'nature'] },
    { id: 2, url: 'img/meme-imgs (various aspect ratios)/003.jpg', keywords: ['famous'] },
    { id: 3, url: 'img/meme-imgs (various aspect ratios)/004.jpg', keywords: ['cute', 'animal'] },
    { id: 4, url: 'img/meme-imgs (various aspect ratios)/5.jpg', keywords: ['victory', 'cute'] },
    { id: 5, url: 'img/meme-imgs (various aspect ratios)/005.jpg', keywords: ['cute', 'animal', 'sleep'] },
    { id: 6, url: 'img/meme-imgs (various aspect ratios)/006.jpg', keywords: ['sleep', 'animal'] },
    { id: 7, url: 'img/meme-imgs (various aspect ratios)/8.jpg', keywords: ['movie'] },
    { id: 8, url: 'img/meme-imgs (various aspect ratios)/9.jpg', keywords: ['cute', 'funny'] },
    { id: 9, url: 'img/meme-imgs (various aspect ratios)/12.jpg', keywords: ['famous'] },
    { id: 10, url: 'img/meme-imgs (various aspect ratios)/19.jpg', keywords: ['yelling'] },
    { id: 11, url: 'img/meme-imgs (various aspect ratios)/putin.jpg', keywords: ['famous'] },
    { id: 12, url: 'img/meme-imgs (various aspect ratios)/leo.jpg', keywords: ['famous', 'movie'] },
];

var gKeywordRates = {}

var gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    lines: []
}

function init() {
    if (loadFromStorage('gMeme')) {
        gMeme = loadFromStorage('gMeme')
    }
    if (loadFromStorage('gKeywordRates')) {
        gKeywordRates = loadFromStorage('gKeywordRates')
    } else getMapImgKeywords()

}

function renderGallery(imgs) {
    const elGridContainer = document.querySelector('.grid-container');
    var strHTML = '';
    imgs.forEach(img => {
        strHTML += `<img class="item ${img.id}" onclick="toMemeEditor(this.className)" src="${img.url}">`
    })
    elGridContainer.innerHTML = strHTML;
}

function getMapImgKeywords() {
    gImgs.forEach(img => {
        img.keywords.forEach(keyword => {
            gKeywordRates[keyword] = 0;
        })
    })
}

function filterGalleryByKeyword(filterKeyword) {
    var filterGallery = [];
    if (!filterKeyword) {
        filterGallery = gImgs
    } else {
        gImgs.forEach(img => {
            if (img.keywords.find(keyword => keyword.includes(filterKeyword))) {
                filterGallery.push(img);
            }
        })
    }
    return filterGallery;
}

function addImg(url, keywords) {
    gImgs.push({
        id: gImgs.length + 1,
        url,
        keywords,
        upload: true,
    })
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

function setBgImg(imgId) {
    const currImg = getImgById(+imgId)
    drawImg(currImg.url)
}

function drawImg(imgUrl) {
    var img = new Image()
    img.src = `./${imgUrl}`;
    img.onload = () => {
        gCanvas.height = (img.height * gCanvas.width) / img.width;
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height)
    }
    saveToStorage('gMeme', gMeme)
}

function drawText(selectedLineIdx, x = 200, y = 100) {
    const text = gMeme.lines[selectedLineIdx].text;
    const size = gMeme.lines[selectedLineIdx].size
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
    const elMyGallery = document.querySelector('.my-gallery')
    elMyGallery.style.display = 'none';
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
    const elMyGallery = document.querySelector('.my-gallery')
    elMyGallery.style.display = 'none';

}

function toMyGallery(elLink) {
    const elPrevLink = document.querySelector('.active');
    if (elPrevLink) elPrevLink.classList.remove('active')
    elLink.classList.add('active');
    const elEditor = document.querySelector('.meme-editor')
    elEditor.style.display = 'none';
    const elGallery = document.querySelector('.gallery')
    elGallery.style.display = 'none';
    const elMyGallery = document.querySelector('.my-gallery')
    elMyGallery.style.display = 'block';
    renderMyGallery()
}


function hi(imgUrl) {
    var img = new Image()
    img.src = `./${imgUrl}`;
    gCtx.drawImage(img, 0, 0)
    renderCanvas()
}

// function uploadMyGallertBg()
//     gCanvas.height = (img.height * gCanvas.width) / img.width;
//     gCtx.drawImage(img, 0, 0);
//     renderCanvas()

// }