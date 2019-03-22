(function(window){
    const privs = new Map();
    function createPrivateVars() {
        privs.set(this, {});
        return getPrivateVars.call(this);
    }
    function getPrivateVars() {
        return privs.get.call(privs, this);
    }

    function multiplicityDefaultFn(length, amount) {
        const mValues = [1, 2, 5];
        const perOne = length / amount;
        let x10 = Math.floor(Math.log10(perOne));
        let i = 0;
        do {
            const m = mValues[i] * Math.pow(10, x10);
            if (m >= perOne) {
                return m;
            }
            i++;
            if (i >= mValues.length) {
                x10++;
                i = 0;
            }
        } while (true);
    }

    function AreaAxleLabels(params) {
        const priv = createPrivateVars.call(this);
        priv.labelSize = params.labelSize;
        priv.labelMinGap = params.labelMinGap;
        priv.multiplicityFn = params.multiplicityFn || multiplicityDefaultFn;
        priv.multiplicityStart = params.multiplicityStart || 0;
        priv.labelTransformer = params.labelTransformer || function(value){return value;};
    }

    function calcMultiplicity() {
        const priv = getPrivateVars.call(this);
        let multiplicity = priv.multiplicityFn(priv.length, priv.labelsMaxAmount);
        const labelsAmount = Math.ceil(priv.length / multiplicity);
        if (labelsAmount <= priv.labelsMaxAmount) {
            return multiplicity;
        }
        return multiplicity * Math.ceil(labelsAmount / priv.labelsMaxAmount);
    }

    function buildLabels() {
        const priv = getPrivateVars.call(this);
        priv.labels = [];
        if (!priv.length || !priv.size) {
            return;
        }
        const multiplicity = calcMultiplicity.call(this);
        const labelsAmount = Math.ceil(priv.length / multiplicity);
        priv.labels = {};
        const start = Math.ceil((priv.start - priv.multiplicityStart) / multiplicity) * multiplicity + priv.multiplicityStart;
        for (let i = 0; i <= labelsAmount; i++) {
            const label = start + i * multiplicity;
            const value = start + i * multiplicity;
            priv.labels[value] = priv.labelTransformer(label);
        }
    }

    AreaAxleLabels.prototype.setAxleRange = function(range) {
        const priv = getPrivateVars.call(this);
        priv.start = range.start;
        priv.end = range.end;
        priv.length = priv.end - priv.start;
        buildLabels.call(this);
    };

    AreaAxleLabels.prototype.setSize = function(size) {
        const priv = getPrivateVars.call(this);
        priv.size = size;
        priv.labelsMaxAmount = Math.floor(priv.size / (priv.labelSize + priv.labelMinGap));
        buildLabels.call(this);
    };

    AreaAxleLabels.prototype.getLabels = function() {
        const priv = getPrivateVars.call(this);
        return priv.labels;
    };

    window.AreaAxleLabels = AreaAxleLabels;
})(window);
