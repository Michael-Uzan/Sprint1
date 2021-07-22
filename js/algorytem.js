'use strict'


function algo1(i, j) {
    if (i < 2) var iIdx = getRandomInt(2, gLevel.size);
    if (i > gLevel.size - 2) var iIdx = getRandomInt(0, gLevel.size - 2);
    if (i >= 2) var iIdx = getRandomInt(0, i - 1);
    if (i < gLevel.size - 2) var iIdx = getRandomInt(i + 2, gLevel.size)

    if (j < 2) var jIdx = getRandomInt(2, gLevel.size);
    if (j > gLevel.size - 2) var jIdx = getRandomInt(0, gLevel.size - 2);
    if (j >= 2) var jIdx = getRandomInt(0, j - 1);
    if (j < gLevel.size - 2) var jIdx = getRandomInt(j + 2, gLevel.size)
    return { i: iIdx, j: jIdx }
}


function algo2(i) {
    if (i < 2) var iIdx = getRandomInt(2, gLevel.size);
    if (i > gLevel.size - 2) var iIdx = getRandomInt(0, gLevel.size - 2);
    if (i >= 2) var iIdx = getRandomInt(0, i - 1);
    if (i < gLevel.size - 2) var iIdx = getRandomInt(i + 2, gLevel.size)

    var jIdx = getRandomInt(0, gLevel.size);

    return { i: iIdx, j: jIdx }
}


function algo3(j) {
    var iIdx = getRandomInt(2, gLevel.size);

    if (j < 2) var jIdx = getRandomInt(2, gLevel.size);
    if (j > gLevel.size - 2) var jIdx = getRandomInt(0, gLevel.size - 2);
    if (j >= 2) var jIdx = getRandomInt(0, j - 1);
    if (j < gLevel.size - 2) var jIdx = getRandomInt(j + 2, gLevel.size)
    return { i: iIdx, j: jIdx }
}
