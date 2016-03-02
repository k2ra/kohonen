'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _fp = require('lodash/fp');

var _fp2 = _interopRequireDefault(_fp);

var _vector = require('./vector');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// A basic implementation of Kohonen map

// The main class
//
//

var Kohonen = function () {

    // The constructor needs two params :
    // * size : the dimension size of the vectors
    // * neurons : an already built neurons grid as an array
    // * maxStep : the max step that will be clamped in scaleStepLearningCoef and
    //             scaleStepNeighborhood
    // * minLearningCoef
    // * minNeighborhood
    //
    // each neuron should provide a 2D vector pos,
    // which refer to the grid position
    //
    // You should use an hexagon grid as it is the easier case
    // to deal with neighborhood.
    //
    // You also should normalized your neighborhood in such a way that 2 neighbors
    // got an euclidian distance of 1 between each other.

    function Kohonen(_ref) {
        var size = _ref.size;
        var neurons = _ref.neurons;
        var _ref$maxStep = _ref.maxStep;
        var maxStep = _ref$maxStep === undefined ? 10000 : _ref$maxStep;
        var _ref$minLearningCoef = _ref.minLearningCoef;
        var minLearningCoef = _ref$minLearningCoef === undefined ? .3 : _ref$minLearningCoef;
        var _ref$minNeighborhood = _ref.minNeighborhood;
        var minNeighborhood = _ref$minNeighborhood === undefined ? .3 : _ref$minNeighborhood;
        (0, _classCallCheck3.default)(this, Kohonen);


        // On each neuron, generate a random vector v
        // of <size> dimension
        this.neurons = neurons.map(function (n) {
            return (0, _assign2.default)({}, n, {
                v: (0, _vector.random)(size)
            });
        });

        // Initialize step
        this.step = 0;

        // generate scaleStepLearningCoef,
        // as the learning coef decreases with time
        this.scaleStepLearningCoef = _d2.default.scale.linear().clamp(true).domain([0, maxStep]).range([1, minLearningCoef]);

        // decrease neighborhood with time
        this.scaleStepNeighborhood = _d2.default.scale.linear().clamp(true).domain([0, maxStep]).range([1, minNeighborhood]);
    }

    Kohonen.prototype.learn = function learn(v) {
        var _this = this;

        // find bmu
        var bmu = this.findBestMatchingUnit(v);
        // compute current learning coef
        var currentLearningCoef = this.scaleStepLearningCoef(this.step);

        this.neurons.forEach(function (n) {
            // compute neighborhood
            var currentNeighborhood = _this.neighborhood({ bmu: bmu, n: n });
            // compute delta for the current neuron
            var delta = (0, _vector.mult)((0, _vector.diff)(n.v, v), currentNeighborhood * currentLearningCoef);
            // update current vector
            n.v = (0, _vector.add)(n.v, delta);
        });
        this.step += 1;
    };

    // Find closer neuron


    Kohonen.prototype.findBestMatchingUnit = function findBestMatchingUnit(v) {
        return _fp2.default.flow(_fp2.default.sortBy(function (n) {
            return (0, _vector.dist)(v, n.v);
        }), _fp2.default.first)(this.neurons);
    };

    // http://en.wikipedia.org/wiki/Gaussian_function#Two-dimensional_Gaussian_function
    //
    // http://mathworld.wolfram.com/GaussianFunction.html
    //
    // neighborhood function made with a gaussian


    Kohonen.prototype.neighborhood = function neighborhood(_ref2) {
        var bmu = _ref2.bmu;
        var n = _ref2.n;

        var a = 1;
        var sigmaX = 1;
        var sigmaY = 1;

        return a * Math.exp(-(Math.pow(n.pos[0] - bmu.pos[0], 2) / 2 * Math.pow(sigmaX, 2) + Math.pow(n.pos[1] - bmu.pos[1], 2) / 2 * Math.pow(sigmaY, 2))) * this.scaleStepNeighborhood(this.step);
    };

    return Kohonen;
}();

exports.default = Kohonen;