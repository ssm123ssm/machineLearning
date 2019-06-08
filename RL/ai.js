var epsilon = 95;
var gamma = 0.95;
var episodes = 100;
var states = 5;
var actions = 2;
var rate = 300;
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

var rewards = [2, 0, 0, 0, 5];

function step(state, action) {
    if ((state == 0 && action == 0) || (state == 4 && action == 1)) {
        return {
            next: 0,
            reward: 0,
            done: true
        }
    }
    var ret = {
        done: false
    };
    if (action == 0) {
        ret.next = state - 1;
    } else {
        ret.next = state + 1;
    }
    ret.reward = rewards[state];
    return ret;
}



var app = angular.module('app', []);
app.controller('ctrl', ['$scope', function ($scope) {
    $scope.q_table = q_table;
    $scope.rewards = rewards;
    $scope.epsilon = epsilon;
    $scope.episode = 1;
    $scope.episodes = episodes;
    $scope.gamma = gamma;
    $scope.rate = rate;
    $scope.state = [0, 0, 0, 0, 0];
    $scope.setState = function (state) {
        $scope.state = [0, 0, 0, 0, 0];
        $scope.state[state] = 1;
        $scope.$apply();
    }
    $scope.score = 0;
    $scope.highscore = 0;
    $scope.colors = ['green', 'blue', 'black', 'brown', 'yellow'];
    $scope.currentColor = $scope.colors[randUpTo($scope.colors.length)];
    async function updateQtable(state, action) {
        return new Promise(resolve => {
            setTimeout(() => {
                // v('Q UPDATER');
                var next = step(state, action);
                var currentStateQ = q_table[state][action];
                var immediateReward = next.reward;
                var maxFutureQ = max(q_table[next.next]);
                var updated = currentStateQ + ($scope.gamma * (immediateReward + maxFutureQ - currentStateQ));
                q_table[state][action] = updated;
                $scope.q_table = q_table;
                $scope.$apply();
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
            var target = next.reward + ($scope.gamma * nextStateMaxQ);
            predictedArray[action] = target;
            model.fit(tf.tensor2d([state], [1, 1]), tf.tensor2d(predictedArray, [1, 2]));
        });
    }
    $scope.start = function () {
        var highScore = 0;
        var currentEpiseode = 0;
        var scoreHistory = [];
        q_table = initQtable();

        runGame(currentEpiseode);

        function runGame(i) {
            v('Episode ' + i);
            var state = randUpTo(5);
            var score = 0;
            proceed();

            function proceed() {
                var exploring = randUpTo(100) > $scope.epsilon;
                //v('state: ', state);
                var action;
                var actionNN;
                if (exploring || q_table[state][0] == q_table[state][1]) {
                    // v('Exploring the env in episode ' + i);
                    action = randUpTo(2);
                } else {

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
                        $scope.episode = currentEpiseode;
                        if (currentEpiseode < $scope.episodes) {
                            $scope.currentColor = $scope.colors[randUpTo($scope.colors.length)];
                            runGame(currentEpiseode);
                            $scope.score = 0;
                        } else {
                            v('Updated q_table:', q_table);
                            v('High score: ' + highScore);
                            v('Score history: ' + scoreHistory);
                        }
                    } else {
                        state = next.next;

                        $scope.setState(state);
                        $scope.$apply();
                        timeOut = setTimeout(function () {
                            score += next.reward;
                            $scope.score += next.reward;
                            proceed();
                        }, $scope.rate);
                    }
                });

            }
        }
    }
}]);

function stop() {
    clearTimeout(timeOut);
}
