const x_array = [10, 1, 18, 0, 25, 1, 30, 0, 32, 1, 52, 1, 57, 0, 65, 1, 85, 0, 93, 1];
const y_array = [0, 1, 0, 1, 2, 4, 3, 4, 3, 4];

function learnToSort(ep) {

    const xs = tf.tensor2d(x_array, [10, 2]);
    const ys = tf.oneHot(tf.tensor2d(y_array, [10, 1], 'int32'), 5);

    var candidates = xs.shape[0];
    var categories = 5;
    //THE NEURAL NETWORK MODEL
    model = tf.sequential();

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 1000,
        activation: 'sigmoid',
        inputDim: 2
    });

    const hidden2 = tf.layers.dense({
        units: 1000,
        activation: 'sigmoid'
    });

    //OUTPUT LAYER WITH 4-UNIT ONE_HOTS FOR CATERGORIZATION
    const output = tf.layers.dense({
        units: 5,
        activation: 'softmax'
    });

    //ADDING THE LAYERS
    model.add(hidden);
    model.add(hidden2);
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
                    console.log("started training Linear");
                },
                onEpochEnd: function (num, log) {
                    //LOGGING THE LOSS FOR EACH EPOCH. 
                    //WE EXPECT THIS TO STEP DOWN TOWARDS 0
                    console.log(log.loss);
                    $(".loss").html('Loss: ' + log.loss);
                }
            }
        }
        return await model.fit(xs, ys, config);
    }

    //TRAINIG THE MODEL
    train().then(function (ress) {
        trained = true;
        //$(".getters").css('display', 'block');
        //alert('Traing complete. User test(int) on console to test the model');
        console.log('Expected outcome is..');
        ys.print();
        console.log('The AI generated, ');
        tf.tensor2d(model.predict(xs).flatten().dataSync().map(function (val) {
            return Math.round(val);
        }), [candidates, categories]).print();


    });
    xs.print();
    ys.print();


}

function test(mark, prac) {
    if (trained) {
        model.predict(tf.tensor2d([mark, prac], [1, 2])).print();
    } else {
        console.log('Not yet');
    }
};
var model;
var trained = false;
//learnLinear();
//learnToSort(1);


var myApp = angular.module('myApp', []);
myApp.controller('myController', ['$scope', function ($scope) {
    $scope.xs = x_array.filter(function (val, index) {
        return index % 2 == 0;
    });
    $scope.ps = x_array.filter(function (val, index) {
        return index % 2 == 1;
    });
    $scope.ys = y_array;
    $scope.train = function () {
        learnToSort(200);
    }
    }]);
