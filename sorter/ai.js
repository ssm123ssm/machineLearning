const x_array = [40, 0, 18, 0, 25, 1, 30, 0, 45, 1, 52, 1, 57, 0, 65, 1, 85, 0, 93, 1];
const y_array = [1, 0, 0, 0, 2, 4, 3, 4, 3, 4];

function learnToSort(ep) {

    const xs = tf.tensor2d(x_array, [10, 2]);
    const ys = tf.oneHot(tf.tensor2d(y_array, [10, 1], 'int32'), 5);

    var candidates = xs.shape[0];
    var categories = 5;
    //THE NEURAL NETWORK MODEL
    model = tf.sequential();

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 500,
        activation: 'sigmoid',
        inputDim: 2
    });

    const hidden2 = tf.layers.dense({
        units: 500,
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
                    angular.element($(".ag")).scope().training = true;
                    angular.element($(".ag")).scope().$apply();
                },
                onEpochEnd: function (num, log) {
                    //LOGGING THE LOSS FOR EACH EPOCH. 
                    //WE EXPECT THIS TO STEP DOWN TOWARDS 0
                    console.log(log.loss);
                    $(".loss").html('Epoch: ' + (num + 1) + '   Loss: ' + log.loss);
                },
                onTrainEnd: function () {
                    angular.element($(".ag")).scope().training = false;
                    angular.element($(".ag")).scope().$apply();
                }
            }
        }
        return await model.fit(xs, ys, config);
    }

    //TRAINIG THE MODEL
    train().then(function (ress) {
        trained = true;
        var scope = angular.element($(".ag")).scope();
        scope.trained = trained;
        $("html, body").animate({
            scrollTop: $(document).height()
        }, 1000);

        scope.$apply();
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
    $scope.trained = trained;
    $scope.ps = x_array.filter(function (val, index) {
        return index % 2 == 1;
    });
    $scope.ys = y_array;
    $scope.train = function () {
        learnToSort($("#epoch").val() || 100);
    }
    $scope.predict = function () {
        getCat(model.predict(tf.tensor2d([$("#marks").val(), $("input[name='optionsRadios']:checked").val()], [1, 2])));
    }
    }]);

function getCat(tens) {
    tens.print();
    var a = tens.flatten().dataSync();
    var max = 0;
    var index = 0;

    for (var i = 0; i < a.length; i++) {
        if (a[i] > max) {
            max = a[i];
            index = i + 1;
        }
    }
    $(".cat").html('Category: ' + index);
}
