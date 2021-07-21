'use strict'

var gBoard;

var gLevel = {
    size: 4,
    mines: 2
}

var gGame = {
    isOn: true,
    showenCount: 0,
    flagMarkedCount: 0,
    secsPassed: 0,
    isFirstClick: true
}
var gStartTime = Date.now();
var gTimerInterval;

function init() {
    gGame.isFirstClick = true;
    stopTimer();
    document.querySelector('.stopwatch').innerHTML = '00:00:000';
    gGame.secsPassed = 0;
    gGame.isOn = true;
    gGame.flagMarkedCount = 0;
    gGame.showenCount = 0;
    document.querySelector('.gameStarter').innerHTML = '<img class="face" src="img/gameOn.png" alt="">';
    gBoard = buildBoard(gLevel.size)
    setMinesOnBoard(gLevel.mines)
    setMinesNegsCount();
    renderBoard(gBoard, '.container');
}

function startGame(i, j) {
    gGame.isFirstClick = false;

    setMinesOnBoard(gLevel.mines, i, j)
    setMinesNegsCount();
    console.table(gBoard);
    renderBoard(gBoard, '.container');
    console.table(gBoard);
}

function buildBoard(size) {
    var mat = []
    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShowen: false,
                isMine: false,
                isMarked: false
            }
            row.push(cell)
        }
        mat.push(row)
    }

    return mat
}

function setMinesOnBoard(mines, i = 0, j = 0) {
    for (var k = 0; k < mines; k++) {
        var iIdx = getRandomInt(0, gLevel.size);
        var jIdx = getRandomInt(0, gLevel.size);
        // while (iIdx === i && jIdx === j) {
        //     var iIdx = getRandomInt(0, gLevel.size);
        //     var jIdx = getRandomInt(0, gLevel.size);
        // }
        gBoard[iIdx][jIdx].isMine = true;
    }
}

function renderBoard(board, selector) {
    var strHTML = '<table oncontextmenu="return false;" border="0" class="table"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {

            var cellToPrint;
            if (board[i][j].isShowen) {
                if (board[i][j].isMine) cellToPrint = getImgHTML('mind.png', 'mind');
                else if (!board[i][j].isMine && board[i][j].minesAroundCount) {
                    cellToPrint = getImgHTML(`${board[i][j].minesAroundCount}.png`, 'number');
                } else cellToPrint = '';
            } else cellToPrint = getImgHTML('closed.png', 'closed');

            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td 
             onmousedown="flagClicked(event,${i}, ${j})"
             onclick="cellClicked(this, ${i}, ${j})" 
             class="${className}">${cellToPrint}
             </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            // maybe delte if.
            if (!gBoard[i][j].isMine) gBoard[i][j].minesAroundCount = getCellMinesNegsCount(i, j, gBoard);
        }
    }

}

function getCellMinesNegsCount(cellI, cellJ, board) {
    var minesNegsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) minesNegsCount++;
        }
    }
    return minesNegsCount;
}

function cellClicked(elCell, i, j) {
    console.log('elCell', elCell);
    // if (gGame.isFirstClick) startGame(i, j)
    if (gBoard[i][j].isShowen || gBoard[i][j].isMarked || !gGame.isOn) return;
    if (!gGame.secsPassed) startTimer()
    gBoard[i][j].isShowen = true;
    gGame.showenCount++; // maybe move it into else for avoid counting mine.
    if (gBoard[i][j].isMine) {
        renderAllBombs(i, j);
        stopTimer();
        document.querySelector('.gameStarter').innerHTML = '<img class="face" src="img/faild.png" alt="">';
        console.log('game Over');
        gGame.isOn = false;
    } else if (gBoard[i][j].minesAroundCount !== 0) {
        renderCellNumber(elCell, i, j)
    } else {
        exposeNegsEmptyCell(elCell, i, j)
    }
    checkGameVictory()
}

function exposeNegsEmptyCell(elCell, cellI, cellJ) {
    renderCellNumber(elCell, cellI, cellJ)

    for (var k = cellI - 1; k <= cellI + 1; k++) {
        if (k < 0 || k >= gBoard.length) continue;
        for (var l = cellJ - 1; l <= cellJ + 1; l++) {
            if (l < 0 || l >= gBoard[k].length) continue;
            if (k === cellI && l === cellJ) continue;
            if (gBoard[k][l].isShowen || gBoard[k][l].isMarked) continue;
            var elNegCell = document.querySelector('.cell' + k + '-' + l);
            gGame.showenCount++;
            gBoard[k][l].isShowen = true;
            renderCellNumber(elNegCell, k, l);
            if (gBoard[k][l].minesAroundCount === 0) exposeNegsEmptyCell(elNegCell, k, l)
        }
    }
    return
}

function renderAllBombs(i, j) {
    for (var k = 0; k < gBoard.length; k++) {
        for (var l = 0; l < gBoard.length; l++) {
            if (gBoard[k][l].isMine && gBoard[k][l].isMarked) renderCell({ i: k, j: l }, getImgHTML('mindCorrect.png', 'mind'))
            else if (gBoard[k][l].isMine && !gBoard[k][l].isMarked) renderCell({ i: k, j: l }, getImgHTML('mind.png', 'mind'))
        }
    }
    renderCell({ i: i, j: j }, getImgHTML('mindBoom.png', 'mind'))
}

function renderCellNumber(elCell, i, j) {
    var cellHTMLToRender;
    if (gBoard[i][j].minesAroundCount) {
        cellHTMLToRender = getImgHTML(`${gBoard[i][j].minesAroundCount}.png`, 'number');
    } else cellHTMLToRender = ''; // if you dony have image for 0 negs.
    elCell.innerHTML = cellHTMLToRender
}

function checkGameVictory() {
    if (gGame.flagMarkedCount === gLevel.mines && (gGame.showenCount === (gLevel.size ** 2 - gLevel.mines))) {
        gGame.isOn = false;
        stopTimer();
        document.querySelector('.gameStarter').innerHTML = '<img class="face" src="img/win.png" alt="">';
        return true;
    } return false;
}

function expandShown(board, elCell, i, j) {
    // When user clicks a cell with no
    // mines around, we need to open 
    // not only that cell, but also its 
    // neighbors. 
    // NOTE: start with a basic 
    // implementation that only opens 
    // the non-mine 1
    // st
    // degree 
    // neighbors
}

function flagClicked(event, i, j) {
    if (event.button === 2 && gGame.isOn) {
        if (!gGame.secsPassed) startTimer()
        if (gBoard[i][j].isShowen) return;
        if (gBoard[i][j].isMarked) {
            renderCell({ i: i, j: j }, getImgHTML('closed.png', 'closed'))
            gGame.flagMarkedCount--;
            gBoard[i][j].isMarked = false;
        }
        else if (gLevel.mines > gGame.flagMarkedCount) {
            renderCell({ i: i, j: j }, getImgHTML('flag.png', 'flag'))
            gGame.flagMarkedCount++;
            gBoard[i][j].isMarked = true;
        }
        console.log('gGame.flagMarkedCount', gGame.flagMarkedCount)
    } else return;
    checkGameVictory()

}

function changeLevel(level) {
    if (level === '1') {
        gLevel.size = 4;
        gLevel.mines = 2;
    }
    if (level === '2') gLevel = { size: 8, mines: 12 }
    if (level === '3') gLevel = { size: 12, mines: 10 }
    init();
}

