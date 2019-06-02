function createModel() {

    //THE NEURAL NETWORK MODEL
    model = tf.sequential();
    var x_array = [0, 4];
    var

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 20,
        activation: 'sigmoid',
        inputDim: 1
    });

    //OUTPUT LAYER WITH 4-UNIT ONE_HOTS FOR CATERGORIZATION
    const output = tf.layers.dense({
        units: 2,
        activation: 'linear'
    });

    //ADDING THE LAYERS
    model.add(hidden);
    model.add(output);


    //COMPILING MODEL WITH ADAM OPTIMIZER AND CATEGORICAL_CROSS_ENTROPY FOR SOFTMAX
    model.compile({
        optimizer: 'sgd',
        loss: 'meanSquaredError'
    });


    //MAIN RUNNER WITH 500 EPOCHS AS ASYNCHRONOUS CALL FOR NON-BLOCK
    async function train() {

        return await model.fit(xs, ys, config);
    }

    //TRAINIG THE MODEL
    train().then(function (ress) {
        v('Model initialized...');
    });



}
var config = {
    epochs: 1,
    callbacks: {
        onTrainBegin: function (result) {

        },
        onEpochEnd: function (num, log) {
            v('loss: ' + log.loss);
        }
    }
}
var model;
createModel();
