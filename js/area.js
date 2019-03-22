(function(window){
    const privs = new Map();
    function createPrivateVars() {
        privs.set(this, {});
        return getPrivateVars.call(this);
    }
    function getPrivateVars() {
        return privs.get.call(privs, this);
    }

    function Area(params) {
        if (!arguments.length) {
            return;
        }
        const priv = createPrivateVars.call(this);
        priv.canvasEl = params.canvasEl;
        priv.ctx = priv.canvasEl.getContext('2d');
        priv.ctxOptions = params.ctxOptions;
        priv.ctxPadding = params.ctxPadding || { top: 0, right: 0, bottom: 0, left: 0 };
        priv.ctxLineOptions = params.ctxLineOptions || {
            lineWidth: 1
        };
        priv.boundingMinRange = params.boundingMinRange;
        priv.boundingMaxRange = params.boundingMaxRange;
        priv.lineItems = new Set();
        priv.offLines = new Set();
        priv.linesBoundingRect = boundingRect(-1, -1, 1, 1);
        priv.currentLinesBoundingRect = null;
        priv.currentCoordinatesTransformer = null;
        priv.animation = new Animation((function(){
            this._clear();
            this._drawCurrent();
        }).bind(this));
    }

    function calcLinesBoundingRect() {
        const priv = getPrivateVars.call(this);
        const lines = [];
        priv.lineItems.forEach((function(lineItem){
            lines.push(lineItem.line);
        }).bind(this));
        const resultRect = LineBasic.calcLinesBoundingRect(
            lines.filter((function(line){ return !priv.offLines.has(line); }).bind(this)),
            priv.boundingMaxRange
        );
        if (!resultRect || !priv.boundingMinRange) {
            return resultRect;
        }
        resultRect.xMin = Math.min(resultRect.xMin, priv.boundingMinRange.xMin !== undefined ? priv.boundingMinRange.xMin : Infinity);
        resultRect.yMin = Math.min(resultRect.yMin, priv.boundingMinRange.yMin !== undefined ? priv.boundingMinRange.yMin : Infinity);
        resultRect.xMax = Math.max(resultRect.xMax, priv.boundingMinRange.xMax !== undefined ? priv.boundingMinRange.xMax : -Infinity);
        resultRect.yMax = Math.max(resultRect.yMax, priv.boundingMinRange.yMax !== undefined ? priv.boundingMinRange.yMax : -Infinity);
        return resultRect;
    }

    function createCoordinatesTransformer(linesBoundingRect) {
        const priv = getPrivateVars.call(this);
        const tMatrix = {
            scaleX: linesBoundingRect.xMax - linesBoundingRect.xMin === 0
                ? 1
                : this._getCanvasElDrawSize().width / (linesBoundingRect.xMax - linesBoundingRect.xMin),
            scaleY: linesBoundingRect.yMax - linesBoundingRect.yMin === 0
                ? 1
                : this._getCanvasElDrawSize().height / (linesBoundingRect.yMax - linesBoundingRect.yMin),
            offsetX: - linesBoundingRect.xMin,
            offsetY: - linesBoundingRect.yMin
        };
        const offset = {
            x: priv.ctxPadding.left,
            y: getCanvasElSize.call(this).height - priv.ctxPadding.bottom
        };
        return function(point) {
            return [
                (point.x + tMatrix.offsetX) * tMatrix.scaleX + offset.x,
                - (point.y + tMatrix.offsetY) * tMatrix.scaleY + offset.y
            ];
        };
    }

    function animateLinesOpacity(lines) {
        const priv = getPrivateVars.call(this);
        priv.lineItems.forEach((function(lineItem){
            if (lines.indexOf(lineItem.line) < 0) {
                return;
            }
            this._animationAction(
                lineItem.line,
                (function(progress, startValue, endValue){
                    lineItem.opacity = startValue + (endValue - startValue) * progress;
                }).bind(this),
                CONSTANTS.ANIMATION_DURATION,
                lineItem.opacity,
                priv.offLines.has(lineItem.line) ? 0 : 1
            );
        }).bind(this));
    }

    function setCurrentLinesBoundingRect(currentLinesBoundingRect) {
        const priv = getPrivateVars.call(this);
        priv.currentLinesBoundingRect = currentLinesBoundingRect;
        priv.currentCoordinatesTransformer = createCoordinatesTransformer.call(this, currentLinesBoundingRect);
    }

    function getCanvasElSize() {
        const priv = getPrivateVars.call(this);
        return {
            width: priv.canvasEl.width,
            height: priv.canvasEl.height
        };
    }

    Area.prototype._applyCtxOptions = function(options) {
        const priv = getPrivateVars.call(this);
        Object.keys(options).forEach((function(key){
            priv.ctx[key] = options[key];
        }).bind(this));
    }

    Area.prototype._drawCurrent = function() {
        const priv = getPrivateVars.call(this);
        priv.lineItems.forEach((function(lineItem){
            if (!lineItem.opacity) {
                return;
            }
            priv.ctx.strokeStyle = 'rgba(' + lineItem.line.colorRGB.concat(lineItem.opacity.toFixed(2)).join(',') + ')';
            this._applyCtxOptions(priv.ctxLineOptions);
            lineItem.line.draw(priv.ctx, priv.currentCoordinatesTransformer, priv.currentLinesBoundingRect);
        }).bind(this));
    };

    Area.prototype._clear = function() {
        const priv = getPrivateVars.call(this);
        priv.ctx.clearRect(0, 0, priv.canvasEl.width, priv.canvasEl.height);
    }

    Area.prototype._getCurrentLinesBoundingRect = function() {
        const priv = getPrivateVars.call(this);
        return priv.currentLinesBoundingRect;
    };

    Area.prototype._getLinesBoundingRect = function() {
        const priv = getPrivateVars.call(this);
        return priv.linesBoundingRect;
    };

    Area.prototype._getCanvasElDrawSize = function() {
        const priv = getPrivateVars.call(this);
        const canvasElSize = getCanvasElSize.call(this);
        return {
            width: canvasElSize.width - priv.ctxPadding.left - priv.ctxPadding.right,
            height: canvasElSize.height - priv.ctxPadding.top - priv.ctxPadding.bottom
        };
    };

    Area.prototype._getCtx = function() {
        const priv = getPrivateVars.call(this);
        return priv.ctx;
    };

    Area.prototype._getCanvasEl = function() {
        const priv = getPrivateVars.call(this);
        return priv.canvasEl;
    };

    Area.prototype._getCtxPadding = function() {
        const priv = getPrivateVars.call(this);
        return priv.ctxPadding;
    };

    Area.prototype._getVisibleLineItems = function() {
        const priv = getPrivateVars.call(this);
        const lineItems = [];
        priv.lineItems.forEach((function(lineItem){
            if (priv.offLines.has(lineItem.line)) {
                return;
            }
            lineItems.push(lineItem);
        }).bind(this));
        return lineItems;
    };

    Area.prototype._animationAction = function(id, changeValueFn, duration, startValue, endValue) {
        const priv = getPrivateVars.call(this);
        priv.animation.action(id, changeValueFn, duration, startValue, endValue);
    };

    Area.prototype._getCurrentCoordinatesTransformer = function() {
        const priv = getPrivateVars.call(this);
        return priv.currentCoordinatesTransformer;
    };

    Area.prototype._updateLinesBoundingRect = function() {
        const priv = getPrivateVars.call(this);
        priv.linesBoundingRect = calcLinesBoundingRect.call(this) || priv.linesBoundingRect || boundingRect(-1, -1, 1, 1);
    };

    Area.prototype.addLines = function(lines) {
        const priv = getPrivateVars.call(this);
        lines.forEach((function(line){
            priv.lineItems.add(lineItem(line, 1));
        }).bind(this));
        this._updateLinesBoundingRect();
    };

    Area.prototype.removeLines = function(lines) {
        const priv = getPrivateVars.call(this);
        priv.lineItems.forEach((function(lineItem){
            if (lines.indexOf(lineItem.line) < 0) {
                return;
            }
            priv.lineItems.delete(lineItem);
        }).bind(this));
        this._updateLinesBoundingRect();
    };

    Area.prototype.addOffLines = function(lines) {
        const priv = getPrivateVars.call(this);
        lines.forEach((function(line){
            priv.offLines.add(line);
        }).bind(this));
        animateLinesOpacity.call(this, lines);
        this._updateLinesBoundingRect();
    };

    Area.prototype.removeOffLines = function(lines) {
        const priv = getPrivateVars.call(this);
        lines.forEach((function(line){
            priv.offLines.delete(line);
        }).bind(this));
        animateLinesOpacity.call(this, lines);
        this._updateLinesBoundingRect();
    };

    Area.prototype.draw = function() {
        const priv = getPrivateVars.call(this);
        if (!priv.currentLinesBoundingRect || boundingRectsEqual(priv.currentLinesBoundingRect, priv.linesBoundingRect)) {
            // no animation
            this._animationAction(
                'boundingRect',
                (function(){
                    setCurrentLinesBoundingRect.call(this, priv.linesBoundingRect);
                }).bind(this)
            );
        } else {
            this._animationAction(
                'boundingRect',
                (function(progress, startRect){
                    const endRect = priv.linesBoundingRect;
                    setCurrentLinesBoundingRect.call(this, boundingRect(
                        startRect.xMin + (endRect.xMin - startRect.xMin) * progress,
                        startRect.yMin + (endRect.yMin - startRect.yMin) * progress,
                        startRect.xMax + (endRect.xMax - startRect.xMax) * progress,
                        startRect.yMax + (endRect.yMax - startRect.yMax) * progress
                    ));
                }).bind(this),
                CONSTANTS.ANIMATION_DURATION,
                boundingRectCopy(priv.currentLinesBoundingRect)
            );
        }
    };

    Area.prototype.setSize = function(width, height) {
        const priv = getPrivateVars.call(this);
        priv.canvasEl.setAttribute('width', width);
        priv.canvasEl.setAttribute('height', height);
        this._applyCtxOptions(priv.ctxOptions);
    };

    Area.prototype.setBoundingMaxRange = function(boundingMaxRange) {
        const priv = getPrivateVars.call(this);
        priv.boundingMaxRange = boundingMaxRange;
        this._updateLinesBoundingRect();
    };

    window.Area = Area;
})(window);
