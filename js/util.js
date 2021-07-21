'use strict'

function createEmptyMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

// print Mat Into Selector with Class of evey cell
function printMat(mat, selector) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}


// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}


function getImgHTML(imgName, imgClass = '') {
    return `<img src="img/${imgName}" class="${imgClass}" />`
}


function findEmptyCell() {
    var emptyCellArray = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j] === EMPTY) emptyCellArray.push({ i: i, j: j })
        }
    }
    if (!emptyCellArray.length) return;
    shuffle(emptyCellArray);
    return drawNum(emptyCellArray);
}


function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            console.log('mat[i][j]', mat[i][j]); // here are all the negs 
            neighborsCount++;
        }
    }
    return neighborsCount;
}


function handleKeyMoveGamer(event) {
    // console.log('event.key', event.key);

    var i = gGamerPos.i;
    var j = gGamerPos.j;

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;

    }
}

// Returns the class name for a specific cell
function getClassName(location) { // {i:3,j:5}
    var cellClass = 'cell-' + location.i + '-' + location.j; // cell-3-5 
    return cellClass;
}


function shuffle(items) {
    var randIdx, keep, i;
    for (i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length);

        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //including minimum
}


function drawNum(nums) {
    return nums.pop()
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function playSound(soundWave) {
    var sound = new Audio(soundWave);
    sound.play();
}

function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}


function getTime() {
    return new Date().toString().split(' ')[4];
}



// var gStartTime = Date.now();
// var gTimerInterval;

function startTimer() {
    gStartTime = Date.now(); //  gStartTime - need to be global
    gTimerInterval = setInterval(timeCycle, 1); //  gTimerInterval - need to be global
}
function timeCycle() {
    var timeLater = Date.now();
    var msTimeDiff = timeLater - gStartTime;
    gGame.secsPassed = new Date(msTimeDiff).toISOString().slice(14, -1);
    document.querySelector('.stopwatch').innerHTML = gGame.secsPassed; // if you want to print the time
}

// stop the timer
function stopTimer() {
    clearInterval(gTimerInterval);
    // var finishTime = document.querySelector('.stopwatch').innerHTML;  // string to print the timer
}
