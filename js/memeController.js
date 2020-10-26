'use strict'

var gMyGallery = [];

var gCanvas;
var gCtx;


function onInit() {
    gCanvas = document.querySelector('#my-canvas');
    gCtx = gCanvas.getContext('2d');
    init()
    renderKeyworsMap()
    renderGallery(gImgs)
    renderCanvas()
}

function onFilterGalleryByKeyword() {
    const filterKeyword = document.querySelector('.search-by-keyword input[name=text]').value;
    const filterGallery = filterGalleryByKeyword(filterKeyword)
    renderKeyworsMap(filterKeyword)
    renderGallery(filterGallery);
}

function renderKeyworsMap(filterKeyword = null) {
    for (const keyword in gKeywordRates) {
        if (keyword === filterKeyword) {
            gKeywordRates[keyword] += 1;
            saveToStorage('gKeywordRates', gKeywordRates)
        }
    }
    const elUl = document.querySelector('.keywords ul');
    var strHTML = '';
    for (const keyword in gKeywordRates) {
        const fontSize = gKeywordRates[keyword] * 1.5 + 14;
        strHTML += `<li style="font-size: ${fontSize}px"> ${keyword} </li>`
    }
    elUl.innerHTML = strHTML;
}

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


// function renderKeyworsMap() {
//     const elUl = document.querySelector('.keywords ul');
//     var strHTML = '';
//     for (const keyword in gKeywordCounts) {
//         strHTML += `<li style="font-size: 2${gKeywordCounts[keyword]}px"> ${keyword} </li>`
//     }
//     elUl.innerHTML = strHTML;
// }

function onSizeUp() {
    var size = +gMeme.lines[gMeme.selectedLineIdx - 1].size
    size += 10
    gMeme.lines[gMeme.selectedLineIdx - 1].size = `${size}`
    renderCanvas()
    saveToStorage('gMeme', gMeme)
}

function onSizeDown() {
    var size = +gMeme.lines[gMeme.selectedLineIdx - 1].size
    size -= 10
    gMeme.lines[gMeme.selectedLineIdx - 1].size = `${size}`
    renderCanvas()
    saveToStorage('gMeme', gMeme)
}

function onRemoveLine() {
    console.log(gMeme.selectedLineIdx - 1);
    removeLine(gMeme.selectedLineIdx - 1);
    if (gMeme.selectedLineIdx === 0) return
    gMeme.selectedLineIdx--;
    renderCanvas();
}

function onMoveUp() {
    console.log(gMeme.selectedLineIdx - 1);
    gMeme.lines[gMeme.selectedLineIdx - 1].y -= 10;
    renderCanvas()
}

function onMoveDown() {
    gMeme.lines[gMeme.selectedLineIdx - 1].y += 10;
    renderCanvas()
}

function onMoveLeft() {
    gMeme.lines[gMeme.selectedLineIdx - 1].x -= 10;
    renderCanvas()
}

function onMoveRight() {
    gMeme.lines[gMeme.selectedLineIdx - 1].x += 10;
    renderCanvas()
}

function onTextLeft() {
    gMeme.lines[gMeme.selectedLineIdx - 1].x = 0
    renderCanvas()
}

function onTextCenter() {
    gMeme.lines[gMeme.selectedLineIdx - 1].x = gCanvas.getBoundingClientRect().width / 2 - gCtx.measureText(getCurrLine().text).width / 2;
    renderCanvas()
}

function onTextRight() {
    gMeme.lines[gMeme.selectedLineIdx - 1].x = gCanvas.getBoundingClientRect().width - gCtx.measureText(getCurrLine().text).width;
    renderCanvas()
}

function onDownloadCanvas(elLink) {
    const data = gCanvas.toDataURL()
    elLink.href = data
    elLink.download = 'Meme.jpg'
}

function onSelectLine() {
    if (gMeme.selectedLineIdx === gMeme.lines.length) gMeme.selectedLineIdx = 0;
    var selectedIdx = gMeme.selectedLineIdx - 1
    console.log('selectedIdx', selectedIdx);
    const nextLine = gMeme.lines[selectedIdx + 1]
    console.log('nextLine', nextLine);
    gMeme.lines.forEach((line, idx) => {
        var lineHeight = +line.size * 1.286;
        var lineWidth = gCtx.measureText(line.text).width;
        if (nextLine.x + 1 > line.x && nextLine.x + 1 < line.x + lineWidth && nextLine.y + 1 > line.y && nextLine.y + 1 < line.y + lineHeight) {
            renderCanvas()
            gMeme.selectedLineIdx = idx + 1
            console.log('selectedLineIdx', gMeme.selectedLineIdx);
            setTimeout(function() {
                buildRectOnText(line.size, line.text, line.x, line.y);
                return line;
            }, 100)
        }
    })
}

function onUpdateText() {
    const elText = document.querySelector(' input[name=text-line]')
    getCurrLine().text = elText.value;
    const elFont = document.querySelector(' #text-font')
    getCurrLine().font = elFont.value
    renderCanvas()
}

function onDrawText() {
    gMeme.selectedLineIdx = gMeme.lines.length
    gMeme.lines[gMeme.selectedLineIdx] = {};
    const text = document.querySelector('.box-editor input[name=text-line]').value;
    gMeme.lines[gMeme.selectedLineIdx]['text'] = text;
    const size = document.querySelector('.box-editor input[name=text-size]').value;
    gMeme.lines[gMeme.selectedLineIdx]['size'] = size;
    const strokeColor = document.querySelector('.box-editor input[name=text-strokeColor]').value;
    gMeme.lines[gMeme.selectedLineIdx]['strokeColor'] = strokeColor;
    const fillColor = document.querySelector('.box-editor input[name=text-fillColor]').value;
    gMeme.lines[gMeme.selectedLineIdx]['fillColor'] = fillColor;
    const font = document.querySelector('.box-editor select[id=text-font]').value
    gMeme.lines[gMeme.selectedLineIdx]['font'] = font;
    drawText(gMeme.selectedLineIdx)
    gMeme.selectedLineIdx++;
    saveToStorage('gMeme', gMeme)
}

function onCanvasTouched(ev) {
    const ratioX = 702 / gCanvas.getBoundingClientRect().width;
    const ratioY = 467 / gCanvas.getBoundingClientRect().height;
    console.log('ratioX', ratioX);
    console.log('ratioY', ratioY);
    var bcr = ev.target.getBoundingClientRect();
    var offsetX = ev.targetTouches[0].clientX - bcr.x;
    offsetX *= ratioX
    var offsetY = ev.targetTouches[0].clientY - bcr.y;
    offsetY *= ratioY
    console.log('offsetX', offsetX);
    console.log('offsetY', offsetY);
    gMeme.lines.forEach((line, idx) => {
        var lineHeight = +line.size * 1.286;
        var lineWidth = gCtx.measureText(line.text).width;
        console.log(offsetX > line.x);
        console.log(offsetX < line.x + lineWidth);
        console.log(offsetY > line.y);
        console.log(offsetY < line.y + lineHeight);
        if (offsetX > line.x && offsetX < line.x + lineWidth && offsetY > line.y && offsetY < line.y + lineHeight) {
            renderCanvas()
            gMeme.selectedLineIdx = idx + 1
            setTimeout(function() {
                buildRectOnText(line.size, line.text, line.x, line.y);
            }, 200)
        }
    })
}

function onCanvasClicked(ev) {
    var { offsetX, offsetY } = ev;
    console.log('offsetX', offsetX);
    console.log('offsetY', offsetY);
    if (ev.type === 'touchstart') {
        const ratioX = gCanvas.getBoundingClientRect().width / 702;
        const ratioY = gCanvas.getBoundingClientRect().height / 467;
        console.log('check');
        var bcr = ev.target.getBoundingClientRect();
        offsetX = ev.targetTouches[0].clientX - bcr.x;
        offsetX *= ratioX
        offsetY = ev.targetTouches[0].clientY - bcr.y;
        offsetY *= ratioY
    }
    gMeme.lines.forEach((line, idx) => {
        var lineHeight = +line.size * 1.286;
        var lineWidth = gCtx.measureText(line.text).width;
        console.log(offsetX > line.x && offsetX < line.x + lineWidth && offsetY > line.y && offsetY < line.y + lineHeight);
        if (offsetX > line.x && offsetX < line.x + lineWidth && offsetY > line.y && offsetY < line.y + lineHeight) {
            renderCanvas()
            gMeme.selectedLineIdx = idx + 1
            setTimeout(function() {
                buildRectOnText(line.size, line.text, line.x, line.y);
                // return line;
            }, 200)
        }
    })
}

function onMoveText(e) {
    e.preventDefault();
    if (e.buttons === 0) return
    var offsetX = e.offsetX
    var offsetY = e.offsetY
    if (e.type === 'touchmove') {
        var bcr = e.target.getBoundingClientRect();
        offsetX = e.targetTouches[0].clientX - bcr.x;
        offsetY = e.targetTouches[0].clientY - bcr.y;
        const ratioX = 702 / gCanvas.getBoundingClientRect().width;
        const ratioY = 467 / gCanvas.getBoundingClientRect().height;
        offsetX *= ratioX
        offsetY *= ratioY
    }
    const line = gMeme.lines.find((line) => {
        var lineHeight = +line.size * 1.286;
        var lineWidth = gCtx.measureText(line.text).width;
        return (offsetX > line.x && offsetX < line.x + lineWidth && offsetY > line.y && offsetY < line.y + lineHeight)
    })
    if (line) return
    drawText(gMeme.selectedLineIdx - 1, offsetX, offsetY);
    renderCanvas();
}

function onSaveToMemeGallery(ev) {
    ev.preventDefault();
    console.log(gCanvas.toDataURL("image/jpeg"));
    gMyGallery.push(gCanvas.toDataURL("image/jpeg"))
    saveToStorage('gMyGallery', gMyGallery)
}

function renderMyGallery() {
    gMyGallery = loadFromStorage('gMyGallery')
    if (!gMyGallery) return
    var strHTML = '';
    gMyGallery.forEach((img, idx) => {
        strHTML += `<img onclick="hi(this.src)" src="${img}">`
    })
    const elMyGallery = document.querySelector('.grid-container-my-gallery')
    elMyGallery.innerHTML = strHTML;
}

function toggleMenu() {
    var elNavBar = document.querySelector('.nav-bar');
    if (elNavBar.className === 'nav-bar') {
        elNavBar.className += " responsive";
    } else {
        elNavBar.className = "nav-bar";
    }
}


// function onTextMove(e) {
//     e.preventDefault();
//     if (e.buttons === 0) return
//     console.log(e);
//     var offsetX = e.offsetX
//     var offsetY = e.offsetY
//     if (e.type === 'touchmove') {
//         var bcr = e.target.getBoundingClientRect();
//         offsetX = e.targetTouches[0].clientX - bcr.x;
//         offsetY = e.targetTouches[0].clientY - bcr.y;
//     }
//     setInterval(drawText(0, offsetX, offsetY), 1000)
// }