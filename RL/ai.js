var epsilon = 90;
var gamma = 0.95;
var episodes = 100;
var states = 5;
var actions = 2;
var rate = 100;
var timeOut;

function initQtable() {
    var qs = [];
    var qs = [];
    for (var i = 0; i < states; i++) {
        var ar = [];
        for (var j = 0; j < actions; j++) {
            ar.push(0);
        }
        qs.push(ar);
    }
    return qs;
}

var q_table = initQtable();




async function updateQtable(state, action) {
    return new Promise(resolve => {
        setTimeout(() => {
            // v('Q UPDATER');
            var next = step(state, action);
            var currentStateQ = q_table[state][action];
            var immediateReward = next.reward;
            var maxFutureQ = max(q_table[next.next]);
            var updated = currentStateQ + (gamma * (immediateReward + maxFutureQ - currentStateQ));
            q_table[state][action] = updated;
            //v(q_table);
            resolve();
        }, 0);
    });
}

async function fitModel(state, action) {
    return new Promise(resolve => {
        var next = step(state, action);
        var predictedArray = model.predict(tf.tensor2d([state], [1, 1])).dataSync();
        var nextStateMaxQ = max(model.predict(tf.tensor2d([next.next], [1, 1])).dataSync());
        var target = next.reward + (gamma * nextStateMaxQ);
        predictedArray[action] = target;
        model.fit(tf.tensor2d([state], [1, 1]), tf.tensor2d(predictedArray, [1, 2]));
    });
}

function test(state) {
    model.predict(tf.tensor2d([state], [1, 1])).print();
}


/*
reaching points '1' and '4' carried score...
point '1' from point '0' = 500 score
point '4' from '3' = 200 score
*/

function step(state, action) {
    var ret;
    if (state == 0 && action == 0) {
        ret = {
            next: 0,
            reward: 0,
            done: true
        }
    }
    if (state == 4 && action == 1) {
        ret = {
            next: 4,
            reward: 0,
            done: true
        }
    }
    if (state == 1 && action == 0) {
        ret = {
            next: 0,
            reward: 0,
            done: false
        }
    }
    if (state == 1 && action == 1) {
        ret = {
            next: 2,
            reward: 0,
            done: false
        }
    }
    if (state == 2 && action == 0) {
        ret = {
            next: 1,
            reward: 0,
            done: false
        }
    }
    if (state == 2 && action == 1) {
        ret = {
            next: 3,
            reward: 0,
            done: false
        }
    }
    if (state == 3 && action == 0) {
        ret = {
            next: 2,
            reward: 0,
            done: false
        }
    }
    if (state == 3 && action == 1) {
        ret = {
            next: 4,
            reward: 550,
            done: false
        }
    }
    if (state == 4 && action == 0) {
        ret = {
            next: 1,
            reward: 0,
            done: false
        }
    }

    if (state == 0 && action == 1) {
        ret = {
            next: 1,
            reward: 500,
            done: false
        }
    }
    if (state == 4 && action == 0) {
        ret = {
            next: 3,
            reward: 0,
            done: false
        }
    }

    return ret;
}

var app = angular.module('app', []);
app.controller('ctrl', ['$scope', function ($scope) {
    $scope.state = [0, 0, 0, 0, 0];
    $scope.setState = function (state) {
        $scope.state = [0, 0, 0, 0, 0];
        $scope.state[state] = 1;
    }
    $scope.score = 0;
    $scope.highscore = 0;
    $scope.colors = ['green', 'blue', 'black', 'brown', 'yellow'];
    $scope.currentColor = $scope.colors[randUpTo($scope.colors.length)];
    $scope.start = function () {
        var highScore = 0;
        var currentEpiseode = 0;
        var scoreHistory = [];

        runGame(currentEpiseode);

        function runGame(i) {
            v('Episode ' + i);
            var state = randUpTo(5);
            var score = 0;
            proceed();

            function proceed() {
                var exploring = randUpTo(100) > epsilon;
                //v('state: ', state);
                var action;
                var actionNN;
                if (exploring) {
                    // v('Exploring the env in episode ' + i);
                    action = randUpTo(2);
                } else {
                    // v('Exploitig the NN in episode ' + i);
                    action = maxIndex(q_table[state]);

                }
                // v('Action: ' + action);



                updateQtable(state, action).then(function () {
                    // v('Line next to Q Updater');
                    var next = step(state, action);
                    if (next.done) {
                        if (score > highScore) {
                            highScore = score;
                            $scope.highscore = highScore;
                            $scope.$apply();
                        }
                        v('Game Over');
                        v('Score : ' + score);
                        scoreHistory.push(score);
                        currentEpiseode++;
                        if (currentEpiseode < episodes) {
                            $scope.currentColor = $scope.colors[randUpTo($scope.colors.length)];
                            runGame(currentEpiseode);
                        } else {
                            v('Updated q_table:', q_table);
                            v('High score: ' + highScore);
                            v('Score history: ' + scoreHistory);
                        }
                    } else {
                        state = next.next;
                        score += next.reward;
                        $scope.score = score;
                        $scope.setState(state);
                        $scope.$apply();
                        timeOut = setTimeout(function () {
                            proceed();
                        }, rate);
                    }
                });

            }
        }
    }
}]);

function stop() {
    clearTimeout(timeOut);
}
