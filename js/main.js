'use strict'

var gBoard;
var gIsFirstUndo = true;

var gLevel = {
    size: 4,
    mines: 2,
    lives: 1,
    hints: 1,
    safe: 1
}

var gGame = {
    isOn: true,
    showenCount: 0,
    flagMarkedCount: 0,
    secsPassed: 0,
    isFirstClick: true,
    isHint: false,
    hintClicked: 0,
    isManuall: false,
    manuallCount: 0
}
var gStartTime = Date.now();
var gTimerInterval;

var gMemoryStepBoard = [];
var gMemoryStepGame = [];

// var source = { a: 1, b: 2 }
// var target = {};
// target = Object.assign(target, source);
// source.a = 100;

function init() {
    gGame.isFirstClick = true;
    gIsFirstUndo = true;
    stopTimer();
    document.querySelector('.stopwatch').innerHTML = '00:00:000';
    gGame.secsPassed = 0;
    gGame.isOn = true;
    gGame.flagMarkedCount = 0;
    gGame.showenCount = 0;
    gGame.manuallCount = 0;
    gGame.isHint = false;
    gGame.isManuall = false;
    gMemoryStepBoard = [];
    gMemoryStepGame = [];
    document.querySelector('.gameStarter').innerHTML = '<img class="face" src="img/gameOn.png" alt="">';
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard, '.container');
    pushStepGame();
    renderFlagCount(gLevel.mines);
    renderSafeCount(gLevel.safe);
    restartLevelLives();
    RenderHintsMenu();
    // restartSafeCount();
    renderSafeCount(gLevel.safe);
    document.querySelector('.manually').classList.remove('selected');
}

function startGame(elCell, i, j) {
    gGame.isFirstClick = false;
    setMinesOnBoard(gLevel.mines, i, j)
    setMinesNegsCount();
    console.table(gBoard);
    renderCellNumber(elCell, i, j)
    pushStepGame()
    // console.table(gBoard);
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

function setNoMineOnNeg(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            mat[i][j] =
                neighborsCount++;
        }
    }
    return neighborsCount;
}

function setMinesOnBoard(mines, i, j) {
    var k = 0;
    while (k !== gLevel.mines) {

        var loto = getRandomInt(0, 3);
        if (loto === 0) var index = algo1(i, j)
        if (loto === 1) var index = algo2(i)
        if (loto === 2) var index = algo3(j)
        gBoard[index.i][index.j].isMine = true;
        k = CountCellMined()
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
            } else if (board[i][j].isMarked) {
                cellToPrint = getImgHTML('flag.png', 'flag')
            } else cellToPrint = getImgHTML('closed.png', 'closed');

            var className = 'cell cell' + i + '-' + j;
            strHTML += `<td 
             onmousedown="flagClicked(event,${i}, ${j})"
             onclick="cellClicked(this, ${i}, ${j})
             manualCellClicked(this, ${i}, ${j})" 
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
    if (gBoard[i][j].isShowen || gBoard[i][j].isMarked || !gGame.isOn) return;
    if (gGame.isFirstClick) startGame(elCell, i, j)
    if (!gGame.secsPassed) startTimer()
    if (gGame.isHint) {
        showNegs(elCell, i, j)
        return;
    }
    if (gBoard[i][j].isMine) {
        if (gLevel.lives === 0) {
            renderAllBombs(i, j);
            stopTimer();
            document.querySelector('.gameStarter').innerHTML = '<img class="face" src="img/faild.png" alt="">';
            console.log('game Over');
            gGame.isOn = false;
            pushStepGame();
        } else if (gLevel.lives > 0) {
            gLevel.lives--;
            renderHeartCount(gLevel.lives);
            renderCell({ i: i, j: j }, getImgHTML('danger.png', 'mind'));
            pushStepGame();
        }
    } else if (gBoard[i][j].minesAroundCount !== 0) {
        gBoard[i][j].isShowen = true;
        gGame.showenCount++;
        renderCellNumber(elCell, i, j)
        checkGameVictory()
        pushStepGame();
    } else {
        gBoard[i][j].isShowen = true;
        gGame.showenCount++;
        exposeNegsEmptyCell(elCell, i, j)
        checkGameVictory()
        pushStepGame();
    }

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
    if (gGame.flagMarkedCount === gLevel.mines && (gGame.showenCount === (gLevel.size ** 2 - gLevel.mines))
        || (gGame.showenCount === (gLevel.size ** 2 - gLevel.mines))) {
        gGame.isOn = false;
        stopTimer();
        document.querySelector('.gameStarter').innerHTML = '<img class="face" src="img/win.png" alt="">';
        return true;
    } return false;
}

function flagClicked(event, i, j) {
    if (event.button === 2 && gGame.isOn) {
        if (!gGame.secsPassed) startTimer()
        if (gBoard[i][j].isShowen) return;
        if (gBoard[i][j].isMarked) {
            renderCell({ i: i, j: j }, getImgHTML('closed.png', 'closed'))
            gGame.flagMarkedCount--;
            gBoard[i][j].isMarked = false;
            pushStepGame();
        }
        else if (gLevel.mines > gGame.flagMarkedCount) {
            renderCell({ i: i, j: j }, getImgHTML('flag.png', 'flag'))
            gGame.flagMarkedCount++;
            gBoard[i][j].isMarked = true;
            pushStepGame();
        }
        renderFlagCount(gLevel.mines - gGame.flagMarkedCount);
    } else return;
    checkGameVictory()
}

function changeLevel(level) {
    if (level === '1') {
        addOnlyOneSelected('.easy');
        gLevel = { size: 4, mines: 2, lives: 1, hints: 1, safe: 1 };
    }
    if (level === '2') {
        addOnlyOneSelected('.medium');
        gLevel = { size: 8, mines: 12, lives: 2, hints: 2, safe: 2 };
    }
    if (level === '3') {
        addOnlyOneSelected('.diff');
        gLevel = { size: 12, mines: 30, lives: 3, hints: 3, safe: 3 };
    }
    init();
}

function RenderHintsMenu() {
    if (gLevel.hints === 1) {
        document.querySelector('.hints').innerHTML = `<img onclick="hint('1')" class="hint hint1" src="img/lightOff.png" alt=""></img>`;
    }
    if (gLevel.hints === 2) {
        document.querySelector('.hints').innerHTML = `<img onclick="hint(\'1\')" class="hint hint1" src="img/lightOff.png" alt="">
        <img onclick="hint('2')" class="hint hint2" src="img/lightOff.png" alt="">`
    }
    if (gLevel.hints === 3) {
        document.querySelector('.hints').innerHTML = `<img onclick="hint('1')" class="hint hint1" src="img/lightOff.png" alt="">
        <img onclick="hint('2')" class="hint hint2" src="img/lightOff.png" alt="">
        <img onclick="hint('3')" class="hint hint3" src="img/lightOff.png" alt=""></img>`
    }
}

function hint(hintNumber) {
    if (gGame.showenCount === 0) return;
    if (!gGame.isHint) {
        gGame.isHint = true;
        gGame.hintClicked = hintNumber;
        renderHintOn(hintNumber)
    }
}

function showNegs(elCell, cellI, cellJ) {
    renderHintCellNumber(elCell, cellI, cellJ)

    for (var k = cellI - 1; k <= cellI + 1; k++) {
        if (k < 0 || k >= gBoard.length) continue;
        for (var l = cellJ - 1; l <= cellJ + 1; l++) {
            if (l < 0 || l >= gBoard[k].length) continue;
            if (k === cellI && l === cellJ) continue;
            // if (gBoard[k][l].isShowen || gBoard[k][l].isMarked) continue;
            if (gBoard[k][l].isShowen) continue;
            var elNegCell = document.querySelector('.cell' + k + '-' + l);
            renderHintCellNumber(elNegCell, k, l);
        }
    }
    setTimeout(function () {
        renderBoard(gBoard, '.container')
    }, 1000);
    gGame.isHint = false;
    document.querySelector('.hint' + gGame.hintClicked).style.display = 'none';
}



function renderHintCellNumber(elCell, i, j) {
    var cellHTMLToRender;
    if (gBoard[i][j].minesAroundCount) {
        cellHTMLToRender = getImgHTML(`${gBoard[i][j].minesAroundCount}.png`, 'number');
    } else if (gBoard[i][j].isMine) cellHTMLToRender = getImgHTML('mind.png', 'mind');
    else cellHTMLToRender = ''; // if you dony have image for 0 negs.
    elCell.innerHTML = cellHTMLToRender
}

function safe() {
    if (gLevel.safe === 0) return;
    if (gGame.showenCount === 0) return;
    var safeCell = findSafeCell(); //safeCell{i:3, j:2}
    if (!safeCell) return;
    renderCell(safeCell, getImgHTML('safeCell.png', 'flag'));
    setTimeout(function () {
        renderBoard(gBoard, '.container')
    }, 1500);
    gLevel.safe--;
    renderSafeCount(gLevel.safe);
}

function manual() {

    init();
    document.querySelector('.manually').classList.toggle('selected');
    gGame.isOn = false;
    gGame.isManuall = true;
    boardShownAll(true);
    renderBoard(gBoard, '.container');
    // console.table(gBoard);


    // gGame.isOn = true;
}

function manualCellClicked(elCell, i, j) {
    if (gGame.isOn || !gGame.isManuall) return;
    console.log('manuall')
    gBoard[i][j].isMine = true;
    renderCell({ i: i, j: j }, getImgHTML('mind.png', 'mind'))
    gGame.manuallCount++;
    if (gLevel.mines === gGame.manuallCount) {
        gGame.isManuall = false;
        gGame.isOn = true;
        gGame.isFirstClick = false;
        boardShownAll(false);
        setMinesNegsCount();
        renderBoard(gBoard, '.container');
        document.querySelector('.manually').classList.toggle('selected');
    }


}

function boardShownAll(boolean) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].isShowen = boolean;
        }
    }
}

function undoStep() {
    if (!gGame.isOn) return;
    if (gIsFirstUndo) {
        var lastStepBoard = drawNum(gMemoryStepBoard);
        var lastStepGame = drawNum(gMemoryStepGame);
    }
    gIsFirstUndo = false;
    var lastStepBoard = drawNum(gMemoryStepBoard);
    var lastStepGame = drawNum(gMemoryStepGame);
    // console.log('lastStep', lastStep)
    if (!lastStepBoard) return;
    gBoard = lastStepBoard;
    gGame = lastStepGame;

    renderFlagCount(gLevel.mines - gGame.flagMarkedCount);
    renderBoard(gBoard, '.container');
}