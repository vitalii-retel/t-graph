(function(window){
    const privs = new Map();
    function createPrivateVars() {
        privs.set(this, {});
        return getPrivateVars.call(this);
    }
    function getPrivateVars() {
        return privs.get.call(privs, this);
    }

    function LineBasic(points) {
        if (!arguments.length) {
            return;
        }
        const priv = createPrivateVars.call(this);
        priv.points = points.slice();
    }

    function isPointOutOfRange(point, boundingMaxRange) {
        return boundingMaxRange && (point.x < boundingMaxRange.xMin || point.x > boundingMaxRange.xMax);
    }
    
    /**
     * @param boundingMaxRange supports x axis only
     */
    LineBasic.prototype.calcBoundingRect = function(boundingMaxRange) {
        const priv = getPrivateVars.call(this);
        // ['xMin', 'yMin', 'xMax', 'yMax'];
        const resultRectVector = priv.points.reduce((function(r, point){
            if (isPointOutOfRange.call(this, point, boundingMaxRange)) {
                return r;
            }
            if (!r) {
                return [point.x, point.y, point.x, point.y];
            }
            if (point.x < r[0]) {
                r[0] = point.x;
            }
            if (point.y < r[1]) {
                r[1] = point.y;
            }
            if (point.x > r[2]) {
                r[2] = point.x;
            }
            if (point.y > r[3]) {
                r[3] = point.y;
            }
            return r;
        }).bind(this), null);
        if (!resultRectVector) {
            return null;
        }
        return boundingRect.apply(null, resultRectVector);
    };
    
    /**
     * @param ctx
     * @param transform {x,y} -> [x,y]
     * @param boundingMaxRange supports x axis only
     */
    LineBasic.prototype.draw = function(ctx, transform, boundingMaxRange) {
        const priv = getPrivateVars.call(this);
        // make drawing smoother by adding outer two points
        boundingMaxRange = boundingRect(
            this.getClosestXBefore(boundingMaxRange.xMin),
            undefined,
            this.getClosestXAfter(boundingMaxRange.xMax),
            undefined
        );
        ctx.beginPath();
        let startPoint = null;
        priv.points.forEach((function(point){
            if (isPointOutOfRange.call(this, point, boundingMaxRange)) {
                return;
            }
            if (!startPoint) {
                startPoint = point;
                ctx.moveTo.apply(ctx, transform(startPoint));
            }
            ctx.lineTo.apply(ctx, transform(point));
        }).bind(this));
        if (startPoint) {
            ctx.moveTo.apply(ctx, transform(startPoint));
        }
        ctx.closePath();
        ctx.stroke();
    };

    LineBasic.prototype.getClosestPointToX = function(xValue) {
        const priv = getPrivateVars.call(this);
        let dLast = null;
        for (let i = 0; i < priv.points.length; i++) {
            const d = Math.abs(priv.points[i].x - xValue);
            if (!dLast || d < dLast) {
                dLast = d;
                continue;
            }
            return priv.points[i - 1];
        }
        return priv.points[priv.points.length - 1];
    };

    LineBasic.prototype.getClosestXBefore = function(xValue) {
        const priv = getPrivateVars.call(this);
        let i = 0;
        while (i < priv.points.length && priv.points[i].x < xValue) {
            i++;
        }
        return priv.points[Math.max(0, i - 1)].x;
    };

    LineBasic.prototype.getClosestXAfter = function(xValue) {
        const priv = getPrivateVars.call(this);
        let i = priv.points.length - 1;
        while (i >= 0 && priv.points[i].x > xValue) {
            i--;
        }
        return priv.points[Math.min(priv.points.length - 1, i + 1)].x;
    };

    /**
     * @param lines
     * @param boundingMaxRange supports x axis only
     * @returns returns null of lines don't have bounding rect
     */
    LineBasic.calcLinesBoundingRect = function(lines, boundingMaxRange) {
        const resultRect = lines.reduce((function(r, line){
            const boundingRect = line.calcBoundingRect(boundingMaxRange);
            if (!boundingRect) {
                return r;
            }
            if (!r) {
                return boundingRect;
            }
            if (boundingRect.xMin < r.xMin) {
                r.xMin = boundingRect.xMin;
            }
            if (boundingRect.yMin < r.yMin) {
                r.yMin = boundingRect.yMin;
            }
            if (boundingRect.xMax > r.xMax) {
                r.xMax = boundingRect.xMax;
            }
            if (boundingRect.yMax > r.yMax) {
                r.yMax = boundingRect.yMax;
            }
            return r;
        }).bind(this), null);
        return resultRect;
    };

    window.LineBasic = LineBasic;
})(window);
