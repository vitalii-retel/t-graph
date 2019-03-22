(function(window){
    function round(value, x) {
        const p = Math.pow(10, x || 0);
        return Math.round(value * p) / p;
    }

    Math.log10 = Math.log10 || function(x) {
        return Math.log(x) * Math.LOG10E;
    };

    window.round = round;
})(window);
