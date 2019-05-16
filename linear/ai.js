function learnLinear(ep) {

    const xs = tf.tensor2d([-1, 0, 1, 2, 3, 4], [6, 1]);
    const ys = tf.tensor2d([-3, -1, 1, 3, 5, 7], [6, 1]);

    //THE NEURAL NETWORK MODEL
    model = tf.sequential();

    //HIDDEN LAYER
    const hidden = tf.layers.dense({
        units: 200,
        activation: 'linear',
        inputShape: [1]
    });

    //OUTPUT LAYER WITH 4-UNIT ONE_HOTS FOR CATERGORIZATION
    const output = tf.layers.dense({
        units: 1,
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
                    $(".loss").html(log.loss);
                }
            }
        }
        return await model.fit(xs, ys, config);
    }

    //TRAINIG THE MODEL
    train().then(function (ress) {
        trained = true;
        $(".getters").css('display', 'block');
        //alert('Traing complete. User test(int) on console to test the model');
        console.log('Expected outcome is..');
        ys.print();
        console.log('The AI generated, ');
        model.predict(xs).print();
    });



}

function test(int) {
    if (trained) {
        model.predict(tf.tensor2d([int], [1, 1])).print();
    } else {
        console.log('Not yet');
    }
};
var model;
var trained = false;
//learnLinear();
$(function () {
    $(".run").click(function () {
        learnLinear(parseInt($("#epoch").val()));
        console.log(parseInt($("#epoch").val()));
        $(".getters").css('display', 'none');
    });
    $(".predict").click(function () {
        model.predict(tf.tensor2d([parseInt($("#x").val())], [1, 1])).print();
        console.log(model.predict(tf.tensor2d([parseInt($("#x").val())], [1, 1])).dataSync());
        $(".y").html(Math.round(model.predict(tf.tensor2d([parseInt($("#x").val())], [1, 1])).dataSync()[0]));
    });
});
