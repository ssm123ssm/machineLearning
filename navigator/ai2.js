function learnToNavigate(ep) {

    var xs = tf.tensor2d(new_x, [new_x.length, 9]);
    var ys = tf.oneHot(tf.tensor1d(new_y, 'int32'), 8);

    //THE NEURAL NETWORK MODEL
    model = tf.sequential();

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 200,
        activation: 'sigmoid',
        inputDim: 9
    });

    const hidden2 = tf.layers.dense({
        units: 200,
        activation: 'sigmoid'
    });



    //OUTPUT LAYER WITH 4-UNIT ONE_HOTS FOR CATERGORIZATION
    const output = tf.layers.dense({
        units: 8,
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
        alert('Trainig complete! You can start the navigation now...');
    });


}


var model;
var trained = false;
var runs = 0;
var pos = [1, 1];
var rate = 50;
var navigating = false;


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
        var dir = Math.floor(Math.random() * 8)
        input.push(dir);
        var onehot = model.predict(tf.tensor2d(input, [1, 9])).dataSync();
        var index = 0;
        var vall = 0;
        for (var i = 0; i < 8; i++) {
            if (onehot[i] > vall) {
                index = i;
                vall = onehot[i];
            }
        }
        var next = getDirection(index);
        initGrid();

        if (rows[grid.pos[1] + next[1]] && rows[grid.pos[0] + next[0]] && (rows[grid.pos[0] + next[0]][grid.pos[1] + next[1]] == 0)) {
            grid.pos = [(grid.pos[0] + next[0]), (grid.pos[1] + next[1])];
            initGrid();
            runs++;
            if (runs < 500) {
                setTimeout(function () {
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
    } else {
        alert('Please train the model first...');
    }
}

var grid = {
    x_length: 9,
    y_length: 9,
    obstacles: [[3, 3], [2, 2], [0, 1], [3, 1], [1, 3], [2, 3], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 5], [5, 0], [6, 7], [7, 1], [2, 1], [1, 1, [0, 7]]],
    pos: pos
}
var rows = [];


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
    var scope = angular.element($(".ang")).scope();
    scope.rows = rows;
    scope.$evalAsync();
}

function scan(pos) {
    var ar = [];
    if (pos[0] - 1 < 0) {
        ar = [1, 1, 1];
    } else {
        if (rows[pos[0] - 1][pos[1] - 1] == 0) {
            ar.push(0);
        } else {
            ar.push(1);
        }
        if (rows[pos[0] - 1][pos[1]] == 0) {
            ar.push(0);
        } else {
            ar.push(1);
        }
        if (rows[pos[0] - 1][pos[1] + 1] == 0) {
            ar.push(0);
        } else {
            ar.push(1);
        }
    }
    if (rows[pos[0]][pos[1] - 1] == 0) {
        ar.push(0);
    } else {
        ar.push(1);
    }
    if (rows[pos[0]][pos[1] + 1] == 0) {
        ar.push(0);
    } else {
        ar.push(1);
    }
    if (pos[0] + 1 >= grid.y_length) {
        ar.push(1);
        ar.push(1);
        ar.push(1);
    } else {
        if (rows[pos[0] + 1][pos[1] - 1] == 0) {
            ar.push(0);
        } else {
            ar.push(1);
        }
        if (rows[pos[0] + 1][pos[1]] == 0) {
            ar.push(0);
        } else {
            ar.push(1);
        }
        if (rows[pos[0] + 1][pos[1] + 1] == 0) {
            ar.push(0);
        } else {
            ar.push(1);
        }
    }
    return ar;
}

var new_x = [];
var new_y = [];

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

            for (var k = 0; k < 8; k++) {
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
    console.log('Ready...');
}

function getNext(ar) {
    var dir = ar[8];
    if (dir == 0) {
        if (ar[0] == 0) {
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
        if (ar[1] == 0) {
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
        if (ar[2] == 0) {
            return (2);
        }
        if (ar[1] == 0) {
            return (1);
        }
        if (ar[4] == 0) {
            return (4);
        }
        return ar.indexOf(0);
    }
    if (dir == 7) {
        if (ar[3] == 0) {
            return (3);
        }
        if (ar[0] == 0) {
            return (0);
        }
        if (ar[5] == 0) {
            return (5);
        }
        return ar.indexOf(0);
    }
    if (dir == 3) {
        if (ar[4] == 0) {
            return (4);
        }
        if (ar[2] == 0) {
            return (2);
        }
        if (ar[7] == 0) {
            return (7);
        }
        return ar.indexOf(0);
    }
    if (dir == 6) {
        if (ar[5] == 0) {
            return (5);
        }
        if (ar[3] == 0) {
            return (3);
        }
        if (ar[6] == 0) {
            return (6);
        }
        return ar.indexOf(0);
    }
    if (dir == 5) {
        if (ar[6] == 0) {
            return (6);
        }
        if (ar[5] == 0) {
            return (5);
        }
        if (ar[7] == 0) {
            return (7);
        }
        return ar.indexOf(0);
    }
    if (dir == 4) {
        if (ar[7] == 0) {
            return (7);
        }
        if (ar[6] == 0) {
            return (6);
        }
        if (ar[4] == 0) {
            return (4);
        }
        return ar.indexOf(0);
    }
}


function getDirection(x) {

    var row = 0;
    var col = 0;

    if (x == 0 || x == 1 || x == 2) {
        row = -1;
    }
    if (x == 5 || x == 6 || x == 7) {
        row = 1;
    }
    if (x == 0 || x == 3 || x == 5) {
        col = -1;
    }
    if (x == 2 || x == 4 || x == 7) {
        col = 1;
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
