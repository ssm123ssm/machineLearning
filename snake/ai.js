const x_array = [[1, 0, 1, 0, 0, 1, 1, 1], [1, 0, 1, 0, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 0, 0], [1, 1, 1, 0, 1, 0, 0, 1], [0, 1, 0, 0, 0, 1, 1, 1], [0, 1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 0, 0, 0, 0], [0, 0, 1, 1, 1, 0, 0, 1], [0, 0, 1, 0, 1, 1, 0, 1]];
const y_array = [[0, -1], [-1, 0], [1, 1], [1, -1], [-1, -1], [1, 1], [0, 1], [1, 0], [-1, -1], [1, 0]];
//UP RIGHT
const pos = [4, 4];
var eps = 500;

function learnToNavigate(ep) {

    const xs = tf.tensor2d(new_x, [new_x.length, 9]);
    const ys = tf.tensor2d(new_y, [new_y.length, 2]);

    //THE NEURAL NETWORK MODEL
    model = tf.sequential();

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 500,
        activation: 'sigmoid',
        inputDim: 9
    });

    const hidden2 = tf.layers.dense({
        units: 500,
        activation: 'sigmoid'
    });



    //OUTPUT LAYER WITH 4-UNIT ONE_HOTS FOR CATERGORIZATION
    const output = tf.layers.dense({
        units: 2,
        activation: 'tanh'
    });

    //ADDING THE LAYERS
    model.add(hidden);
    model.add(hidden2);
    model.add(hidden2);
    model.add(output);


    //COMPILING MODEL WITH ADAM OPTIMIZER AND CATEGORICAL_CROSS_ENTROPY FOR SOFTMAX
    model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError'
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
        start();
    });


}

function test(x, y) {
    model.predict(tf.tensor2d(scan([x, y]), [1, 8])).print();
}

//learnToNavigate(1);

var model;
var trained = false;
var runs = 0;

function getDest(tens) {
    var coords = tens.dataSync().map(function (val) {
        return Math.round(val);
    });
    //console.log(coords);
    return coords;
}

function start() {
    //console.log(`Now at ${grid.pos}`);
    var input = scan(grid.pos);
    var dir = Math.floor(Math.random() * 8)
    input.push(dir);
    console.log(`Direction: ${dir}`);
    var next = getDest(model.predict(tf.tensor2d(input, [1, 9])));
    var xx = 0;
    //var next = getNext(input);
    initGrid();
    console.log('Suggested next: ');
    console.log(next);
    //console.log(grid.pos[0] + next[0]);
    //console.log(grid.pos[1] + next[1]);

    if (rows[grid.pos[0] + next[0]][grid.pos[1] + next[1]] == 0) {
        //console.log('Correct choice!');
        //rows[grid.pos[0]][grid.pos[1]] = 0;
        grid.pos = [(grid.pos[0] + next[0]), (grid.pos[1] + next[1])];
        initGrid();
        runs++;
        if (runs < 100) {
            setTimeout(function () {
                start();
            }, 1000);
        }
    } else {
        console.log('HIT!');
        initGrid();
        console.log(next);
        alert('GOT HIT!!' + runs + ' RUNS...');
    }
}

var grid = {
    x_length: 5,
    y_length: 5,
    obstacles: [[3, 3], [2, 2], [0, 1], [3, 1], [1, 3], [2, 3]],
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
    console.log(rows);
    //debugger;
    var scope = angular.element($(".ang")).scope();
    scope.rows = rows;
    scope.$apply();
    console.log(scope);
}

function scan(pos) {
    //console.log(`currently at ${pos}`);
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
    //console.log(ar);
    return ar;
}

var new_x = [];
var new_y = [];

function createRandomX(loops) {
    new_x = [];
    new_y = [];
    var gens = 0;

    for (var i = 0; i < loops; i++) {
        var a = Math.floor(Math.random() * grid.x_length);
        var b = Math.floor(Math.random() * grid.x_length);

        if (rows[a][b] == 0) {
            gens++;
            console.log('generations: ' + gens);
            var ar = scan([a, b]);
            var dir = Math.floor(Math.random() * 8);
            ar.push(dir);
            new_x.push(ar);
            var next = getNext(ar);
            new_y.push(next);

            grid.pos = [a, b];
            initGrid();
            console.log(`direction: ${dir}`);
            console.log(next);
            //var scope = angular.element($(".ang")).scope();

        }
        //console.log(scope);
        //scope.$apply();

    }
}

function getNext(ar) {
    var dir = ar[8];
    if (dir == 0) {
        if (ar[0] == 0) {
            return getDirection(0);
        }
        if (ar[1] == 0) {
            return getDirection(1);
        }
        if (ar[3] == 0) {
            return getDirection(3);
        }
        return getDirection(randomDirection(ar));
    }
    if (dir == 1) {
        if (ar[1] == 0) {
            return getDirection(1);
        }
        if (ar[0] == 0) {
            return getDirection(0);
        }
        if (ar[2] == 0) {
            return getDirection(2);
        }
        return getDirection(randomDirection(ar));
    }
    if (dir == 2) {
        if (ar[2] == 0) {
            return getDirection(2);
        }
        if (ar[1] == 0) {
            return getDirection(1);
        }
        if (ar[4] == 0) {
            return getDirection(4);
        }
        return getDirection(randomDirection(ar));
    }
    if (dir == 7) {
        if (ar[3] == 0) {
            return getDirection(3);
        }
        if (ar[0] == 0) {
            return getDirection(0);
        }
        if (ar[5] == 0) {
            return getDirection(5);
        }
        return getDirection(randomDirection(ar));
    }
    if (dir == 3) {
        if (ar[4] == 0) {
            return getDirection(4);
        }
        if (ar[2] == 0) {
            return getDirection(2);
        }
        if (ar[7] == 0) {
            return getDirection(7);
        }
        return getDirection(randomDirection(ar));
    }
    if (dir == 6) {
        if (ar[5] == 0) {
            return getDirection(5);
        }
        if (ar[3] == 0) {
            return getDirection(3);
        }
        if (ar[6] == 0) {
            return getDirection(6);
        }
        return getDirection(randomDirection(ar));
    }
    if (dir == 5) {
        if (ar[6] == 0) {
            return getDirection(6);
        }
        if (ar[5] == 0) {
            return getDirection(5);
        }
        if (ar[7] == 0) {
            return getDirection(7);
        }
        return getDirection(randomDirection(ar));
    }
    if (dir == 4) {
        if (ar[7] == 0) {
            return getDirection(7);
        }
        if (ar[6] == 0) {
            return getDirection(6);
        }
        if (ar[4] == 0) {
            return getDirection(4);
        }
        return getDirection(randomDirection(ar));
    }
}

function randomDirection(ar) {
    var s = [];
    for (var i = 0; i < 8; i++) {
        if (ar[i] == 0) {
            s.push(i);
        }
    }
    return s[Math.floor(Math.random() * s.length)];
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

function getZeros(ar) {
    var z = 0;
    for (var i = 0; i < 7; i++) {
        if (ar[i] == 0) {
            z++;
        }
    }
    return z;
}

//learnToNavigate(eps);


$(function () {
    initGrid();
    createRandomX(300);

});

//start();
var myApp = angular.module('myApp', []);
myApp.controller('myController', ['$scope', function ($scope) {
    $scope.rows = rows;
    $scope.setEpoch = function () {
        learnToNavigate($("#epoch").val());
    }
    }]);
