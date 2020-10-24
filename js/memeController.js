'use strict'

var gMyGallery = [];

var gCanvas;
var gCtx;


function onInit() {
    gCanvas = document.querySelector('#my-canvas');
    gCtx = gCanvas.getContext('2d');
    init()
    renderKeyworsMap()
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
        strHTML += `<li style="font-size: 2${gKeywordRates[keyword]}px"> ${keyword} </li>`
    }
    elUl.innerHTML = strHTML;
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
    gMeme.lines[gMeme.selectedLineIdx - 1].x = 100
    renderCanvas()
}

function onTextCenter() {
    gMeme.lines[gMeme.selectedLineIdx - 1].x = 200
    renderCanvas()
}

function onTextRight() {
    gMeme.lines[gMeme.selectedLineIdx - 1].x = 300
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
    // const align = document.querySelector('.box-editor select[id=text-align]').value
    // gMeme.lines[gMeme.selectedLineIdx]['align'] = align;
    const font = document.querySelector('.box-editor select[id=text-font]').value
    gMeme.lines[gMeme.selectedLineIdx]['font'] = font;
    drawText(gMeme.selectedLineIdx)
    gMeme.selectedLineIdx++;
    // renderCanvas()
    saveToStorage('gMeme', gMeme)
        // renderCanvas()
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
var gNotFocus = false;

function onMoveText(e) {
    e.preventDefault();
    if (e.buttons === 0) return
    console.log('move');
    var offsetX = e.offsetX
    var offsetY = e.offsetY
    if (e.type === 'touchmove') {
        var bcr = e.target.getBoundingClientRect();
        offsetX = e.targetTouches[0].clientX - bcr.x;
        offsetY = e.targetTouches[0].clientY - bcr.y;
        console.log('offsetX', offsetX, 'offsetY', offsetX);
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
    gMyGallery.forEach(img => {
        strHTML += `<img src="${img}">`
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