function learnToNavigate(ep) {

    var xs = tf.tensor2d(new_x, [new_x.length, 5]);
    var ys = tf.oneHot(tf.tensor1d(new_y, 'int32'), 4);

    //THE NEURAL NETWORK MODEL
    model = tf.sequential();

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 200,
        activation: 'sigmoid',
        inputDim: 5
    });

    const hidden2 = tf.layers.dense({
        units: 200,
        activation: 'sigmoid'
    });



    //OUTPUT LAYER WITH 4-UNIT ONE_HOTS FOR CATERGORIZATION
    const output = tf.layers.dense({
        units: 4,
        activation: 'softmax'
    });

    //ADDING THE LAYERS
    model.add(hidden);
    model.add(hidden2);
    // model.add(hidden2);
    //model.add(hidden2);
    model.add(output);


    //COMPILING MODEL WITH ADAM OPTIMIZER AND CATEGORICAL_CROSS_ENTROPY FOR SOFTMAX
    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy'
    });


    //MAIN RUNNER WITH 500 EPOCHS AS ASYNCHRONOUS CALL FOR NON-BLOCK
    async function train() {
        let config = {
            epochs: ep,
            callbacks: {
                onTrainBegin: function (result) {

                },
                onEpochEnd: function (num, log) {
                    //LOGGING THE LOSS FOR EACH EPOCH. 
                    //WE EXPECT THIS TO STEP DOWN TOWARDS 0
                    console.log(`epoch: ${num}`);
                    console.log('loss: ' + log.loss);
                },
                onTrainEnd: function () {

                }
            }
        }
        return await model.fit(xs, ys, config);
    }

    //TRAINIG THE MODEL
    train().then(function (ress) {
        trained = true;
        initGrid();
        scan(grid.pos);
        alert('Navigator NN training complete...');
        trainToFindApple();
        LearnToFindTheApple(200);
    });


}

//apple finder
function LearnToFindTheApple(ep) {

    var xs = tf.tensor2d(apple_x, [apple_x.length, 4]);
    var ys = tf.oneHot(tf.tensor1d(apple_y, 'int32'), 4);

    //THE NEURAL NETWORK MODEL
    appleFinder = tf.sequential();

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 200,
        activation: 'sigmoid',
        inputDim: 4
    });

    const hidden2 = tf.layers.dense({
        units: 200,
        activation: 'sigmoid'
    });



    //OUTPUT LAYER WITH 4-UNIT ONE_HOTS FOR CATERGORIZATION
    const output = tf.layers.dense({
        units: 4,
        activation: 'softmax'
    });

    //ADDING THE LAYERS
    appleFinder.add(hidden);
    appleFinder.add(hidden2);
    // model.add(hidden2);
    //model.add(hidden2);
    appleFinder.add(output);


    //COMPILING MODEL WITH ADAM OPTIMIZER AND CATEGORICAL_CROSS_ENTROPY FOR SOFTMAX
    appleFinder.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy'
    });


    //MAIN RUNNER WITH 500 EPOCHS AS ASYNCHRONOUS CALL FOR NON-BLOCK
    async function train() {
        let config = {
            epochs: ep,
            callbacks: {
                onTrainBegin: function (result) {

                },
                onEpochEnd: function (num, log) {
                    //LOGGING THE LOSS FOR EACH EPOCH. 
                    //WE EXPECT THIS TO STEP DOWN TOWARDS 0
                    console.log(`epoch: ${num}`);
                    console.log('loss: ' + log.loss);
                },
                onTrainEnd: function () {

                }
            }
        }
        return await appleFinder.fit(xs, ys, config);
    }

    //TRAINIG THE MODEL
    train().then(function (ress) {

        alert('Apple finder training complete...');
    });
}

//Data generation for apple finder
function trainToFindApple(ep) {
    for (var i = 0; i < 600; i++) {
        var pos_a = Math.floor(Math.random() * grid.x_length);
        var pos_b = Math.floor(Math.random() * grid.y_length);
        var apple_a = Math.floor(Math.random() * grid.x_length);
        var apple_b = Math.floor(Math.random() * grid.x_length);
        apple_x.push([pos_a, pos_b, apple_a, apple_b]);
        apple_y.push(dirToApple(pos_a, pos_b, apple_a, apple_b));
    }
}

//adding parts
function addPart(old) {
    console.log('Adding part...');
    grid.parts.push(old);
}

function findTheApple(a, b, c, d) {
    var onehot = appleFinder.predict(tf.tensor2d([a, b, c, d], [1, 4])).dataSync();
    var val = 0;
    var index = 0;
    for (var i = 0; i < 4; i++) {
        if (onehot[i] > val) {
            val = onehot[i];
            index = i;
        }
    }

    return index;
}

var model;
var appleFinder;
var trained = false;
var runs = 0;
var pos = [8, 5];
var rate = 100;
var navigating = false;
var lastDir = 1;
var apple = [5, 5];
var timeout;


function _start() {
    if (!navigating) {
        runs = 0;
        start();
    }
}

function start() {
    if (trained) {
        navigating = true;
        var input = scan(grid.pos);

        //from algo
        //var dir = dirToApple(grid.pos[0], grid.pos[1], grid.apple[0], grid.apple[1]);

        //from neura
        var dir = findTheApple(grid.pos[0], grid.pos[1], grid.apple[0], grid.apple[1]);
        //var dir = Math.floor(Math.random() * 8)
        input.push(dir);
        var onehot = model.predict(tf.tensor2d(input, [1, 5])).dataSync();
        var index = 0;
        var vall = 0;
        for (var i = 0; i < 4; i++) {
            if (onehot[i] > vall) {
                index = i;
                vall = onehot[i];
            }
        }
        if (index != lastDir) {
            lastDir = index;
        }
        var next = getDirection(index);
        initGrid();

        if (rows[grid.pos[1] + next[1]] && rows[grid.pos[0] + next[0]] && ((rows[grid.pos[0] + next[0]][grid.pos[1] + next[1]] == 3))) {
            var tail = grid.parts[grid.parts.length - 1];
            if (!tail) {
                tail = grid.pos;
            }
            //debugger;
            propagate(next);
            addPart(tail);
            randomizeApple();
            initGrid();
            runs++;
            if (1) {
                timeout = setTimeout(function () {
                    start();
                }, rate);
            } else {
                alert('Congrats! 500 steps!');
                navigating = false;
            }
        } else {
            if (rows[grid.pos[1] + next[1]] && rows[grid.pos[0] + next[0]] && ((rows[grid.pos[0] + next[0]][grid.pos[1] + next[1]] == 0))) {
                propagate(next);
                initGrid();
                runs++;
                if (1) {
                    timeout = setTimeout(function () {
                        start();
                    }, rate);
                } else {
                    alert('Congrats! 500 steps!');
                    navigating = false;
                }
            } else {
                console.log('HIT!');
                navigating = false;
                initGrid();
                alert('GOT HIT!! ' + runs + ' RUNS...');
            }
        }

    } else {
        alert('Please train the model first...');
    }
}

function stop() {
    clearTimeout(timeout);
    navigating = false;
}

function propagate(next) {
    var oldPos = grid.pos;
    grid.pos = [(grid.pos[0] + next[0]), (grid.pos[1] + next[1])];
    if (grid.parts.length > 0) {
        grid.parts.pop();
        grid.parts.unshift(oldPos);
    }
}

var grid = {
    x_length: 15,
    y_length: 15,
    obstacles: [[3, 3], [2, 2], [0, 1], [3, 1], [1, 3], [2, 3], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 5], [5, 0], [6, 7], [7, 1], [2, 1], [1, 1, [0, 7]]],
    pos: pos,
    apple: apple,
    parts: []
}
var rows = [];

function randomizeApple() {
    var a = Math.floor(Math.random() * grid.x_length);
    var b = Math.floor(Math.random() * grid.x_length);
    // console.log(a, b)

    if (rows[a][b] == 0) {
        grid.apple = [a, b];
        initGrid();
    } else {
        randomizeApple();
        //initGrid();
    }
}

function dirToApple(a, b, c, d) {
    var row_now = a;
    var col_now = b;
    var row_apple = c;
    var col_apple = d;

    //same row
    if (row_apple == row_now) {
        console.log('SAME ROW');
        if (col_apple > col_now) {
            return 2;
        }
        return 0;
    }
    //same col
    if (col_apple == col_now) {
        console.log('SAME Col');
        if (row_apple > row_now) {
            return 3;
        }
        return 1;
    }

    var dif_col;
    var dif_row;

    if (col_apple > col_now) {
        dif_col = col_apple - col_now;
    } else {
        dif_col = col_now - col_apple;
    }

    if (row_apple > row_now) {
        dif_row = row_apple - row_now;
    } else {
        dif_row = row_now - row_apple;
    }

    console.log('diffs, col, row', dif_col, dif_row);


    //var rand = Math.floor(Math.random() * 2);
    var rand = 0;
    if (rand == 0) {

        //correct quick
        if (dif_col > dif_row) {
            if (row_apple > row_now) {
                console.log(3);
                return 3;
            }
            console.log(1);
            return 1;
        } else {
            if (col_apple > col_now) {
                console.log(2);
                return 2;
            }
            console.log(0);
            return 0;
        }
    } else {


        //correct slow
        if (dif_col > dif_row) {
            if (col_apple > col_now) {
                console.log(2);
                return 2;
            }
            console.log(0);
            return 0;
        } else {
            if (row_apple > row_now) {
                console.log(3);
                return 3;
            }
            console.log(1);
            return 1;
        }
    }



}

function initGrid() {
    rows = [];
    for (var i = 0; i < grid.y_length; i++) {
        var row = [];
        for (var j = 0; j < grid.x_length; j++) {
            row.push(0);
        }
        rows.push(row);
    }
    grid.obstacles.forEach(function (obs) {
        rows[obs[0]][obs[1]] = 1;
    });
    if (rows[grid.pos[0]][grid.pos[1]] == 0) {
        rows[grid.pos[0]][grid.pos[1]] = 2;
    } else {
        console.log('Cant position the Navigator there');
    }
    if (rows[grid.apple[0]][grid.apple[1]] == 0) {
        rows[grid.apple[0]][grid.apple[1]] = 3;
    } else {
        console.log('Can\'t place the apple there...');
    }
    grid.parts.forEach(function (part) {
        if (part) {
            if (rows[part[0]][part[1]] == 0) {
                rows[part[0]][part[1]] = 2
            }
        }
    });
    var scope = angular.element($(".ang")).scope();
    scope.rows = rows;
    scope.$evalAsync();
}

function scan(pos) {
    var ar = [];
    var row = pos[0];
    var col = pos[1];
    //console.log(row, col)
    if (col == 0) {
        ar[0] = 1;
    } else {
        if (rows[row][col - 1] == 1 || rows[row][col - 1] == 2) {
            ar[0] = 1;

        } else {
            ar[0] = 0;
        }
    }

    if (row == 0) {
        ar[1] = 1;
    } else {
        if (rows[row - 1][col] == 1 || rows[row - 1][col] == 2) {
            ar[1] = 1;
        } else {
            ar[1] = 0;
        }
    }

    if (col == (grid.x_length - 1)) {
        ar[2] = 1;
    } else {
        if (rows[row][col + 1] == 1 || rows[row][col + 1] == 2) {
            ar[2] = 1;
        } else {
            ar[2] = 0;
        }

    }
    if (row == grid.y_length - 1) {
        ar[3] = 1;
    } else {
        if (rows[row + 1][col] == 1 || rows[row + 1][col] == 2) {
            ar[3] = 1;
        } else {
            ar[3] = 0;
        }
    }
    return ar;
}

var new_x = [];
var new_y = [];
var apple_x = [];
var apple_y = [];

function createRandomX(loops) {
    new_x = [];
    new_y = [];
    var gens = 0;

    console.log('Creating training dataset...');
    for (var i = 0; i < loops; i++) {
        var a = Math.floor(Math.random() * grid.x_length);
        var b = Math.floor(Math.random() * grid.x_length);

        if (rows[a][b] == 0) {
            gens++;
            console.log('generations: ' + gens);

            for (var k = 0; k < 4; k++) {
                var ar = scan([a, b]);
                ar.push(k);
                new_x.push(ar);
                var next = getNext(ar);
                new_y.push(next);
                grid.pos = [a, b];
                initGrid();
            }
        }
    }
    grid.obstacles = [];
    initGrid();
    console.log('Ready...');
}

function reset() {
    grid.parts = [];
    initGrid();
}

function getNext(ar) {
    var dir = ar[4];
    if (dir == 0) {
        if (ar[0] == 0 || ar[0] == 3) {
            return (0);
        }
        if (ar[1] == 0) {
            return (1);
        }
        if (ar[3] == 0) {
            return (3);
        }
        return (ar.indexOf(0));
    }
    if (dir == 1) {
        if (ar[1] == 0 || ar[1] == 3) {
            return (1);
        }
        if (ar[0] == 0) {
            return (0);
        }
        if (ar[2] == 0) {
            return (2);
        }
        return ar.indexOf(0);
    }
    if (dir == 2) {
        if (ar[2] == 0 || ar[2] == 3) {
            return (2);
        }
        if (ar[1] == 0) {
            return (1);
        }
        if (ar[3] == 0) {
            return (3);
        }
        return ar.indexOf(0);
    }
    if (dir == 3) {
        if (ar[3] == 0 || ar[3] == 3) {
            return (3);
        }
        if (ar[0] == 0) {
            return (0);
        }
        if (ar[2] == 0) {
            return (2);
        }
        return ar.indexOf(0);
    }
}


function getDirection(x) {

    var row = 0;
    var col = 0;

    if (x == 0) {
        row = 0;
        col = -1;
    }
    if (x == 1) {
        row = -1;
        col = 0;
    }
    if (x == 2) {
        row = 0;
        col = 1;
    }
    if (x == 3) {
        row = 1;
        col = 0
    }

    return [row, col];
}


$(function () {
    initGrid();
    createRandomX(300);
});

//start();
var myApp = angular.module('myApp', []);
myApp.controller('myController', ['$scope', function ($scope) {
    $scope.rows = rows;
    var brick = false;
    var place = false;
    var remove = false;
    $scope.brick = function () {
        brick = true;
        place = false;
        remove = false;
    }
    $scope.brikMarker = false;

    $scope.mark = function (row, col) {
        if (brick) {
            grid.obstacles.push([row, col]);
            initGrid();
        }
        if (place) {
            if (rows[row][col] == 0) {
                grid.pos = [row, col];
                initGrid();
            }
        }
        if (remove) {
            if (rows[row][col] == 1) {
                var index;
                for (var i = 0; i < grid.obstacles.length; i++) {
                    if (grid.obstacles[i][0] == row && grid.obstacles[i][1] == col) {
                        index = i;
                    }
                }
                grid.obstacles.splice(index, 1);
                //grid.obstacles.splice(grid.obstacles.indexOf([row, col]), 1);
                initGrid();
            }
        }
    }
    $scope.place = function () {
        place = true;
        brick = false;
        remove = false;
    }

    $scope.remove = function () {
        remove = true;
        brick = false;
        place = false;
    }
    $scope.setEpoch = function () {
        runs = 0;
        learnToNavigate($("#epoch").val());

    }
    $scope.start = function () {
        runs = 0;
        start();
    }
    }]);
