(function(window){
    const privs = new Map();
    function createPrivateVars() {
        privs.set(this, {});
        return getPrivateVars.call(this);
    }
    function getPrivateVars() {
        return privs.get.call(privs, this);
    }

    function AreaMain(params) {
        const priv = createPrivateVars.call(this);
        if (!params.ctxPadding) {
            params.ctxPadding = { top: 0, right: 0, bottom: 20, left: 0 };
        } else {
            params.ctxPadding.bottom += 20;
        }
        Area.call(this, params);
        priv.ctx = this._getCtx();
        priv.axleLabelsY = new AreaAxleLabels(params.axleLabelsY);
        priv.axleLabelsYCtxOptions = params.axleLabelsY.ctxOptions || {
            lineWidth: 1,
            font: '12px Arial',
            strokeStyle: 'rgba(180, 192, 197, 0.1)',
            fillStyle: 'rgb(111, 133, 144, 0.7)',
            textAlign: 'start'
        };
        priv.axleLabelsYCurrent = null;
        priv.axleLabelsX = new AreaAxleLabels(params.axleLabelsX);
        priv.axleLabelsXCtxOptions = params.axleLabelsX.ctxOptions || {
            lineWidth: 1,
            font: '12px Arial',
            strokeStyle: 'rgba(111, 133, 144, 0.1)',
            fillStyle: 'rgb(111, 133, 144, 0.7)'
        };
        priv.axleLabelsXCurrent = null;

        if (!params.onOver) {
            priv.xPointInfo = new XPointInfo(this._getCanvasEl().parentElement);
            params.onOver = onOverHandler.bind(this);
        }

        priv.onOver = params.onOver;
        createOverListener.call(this);
    }

    AreaMain.prototype = new Area;

    const TO_HIDE = -1;
    const TO_SHOW = 1;

    function onOverHandler(info) {
        const priv = getPrivateVars.call(this);
        if (!info) {
            priv.xPointInfo.hide();
            return;
        }
        priv.xPointInfo.show(info);
    }

    function createOverListener() {
        const priv = getPrivateVars.call(this);
        const canvasEl = this._getCanvasEl();
        function findPoints(c) {
            const ctxPadding = this._getCtxPadding();
            const ctxDrawSize = this._getCanvasElDrawSize();
            const xPercents = (c.x - ctxPadding.left) / ctxDrawSize.width;
            const xMin = this._getCurrentLinesBoundingRect().xMin;
            const xMax = this._getCurrentLinesBoundingRect().xMax;
            const x = (xMax - xMin) * xPercents + xMin;
            return this._getVisibleLineItems().map((function(lineItem){
                const dataPoint = lineItem.line.getClosestPointToX(x);
                const point = this._getCurrentCoordinatesTransformer()(dataPoint);
                point[0] += ctxPadding.left;
                point[1] += ctxPadding.top;
                return {
                    color: lineItem.line.color,
                    name: lineItem.line.name,
                    point: {
                        left: point[0],
                        top: point[1]
                    },
                    dataPoint: dataPoint,
                    line: {
                        left: point[0],
                        top: ctxPadding.top,
                        height: ctxDrawSize.height,
                        color: priv.axleLabelsXCtxOptions.strokeStyle
                    }
                };
            }).bind(this));
        }
        function triggerHandler(c) {
            const points = findPoints.call(this, c);
            const info = {
                left: points[0].line.left,
                top: points[0].line.top,
                height: points[0].line.height,
                lineColor: points[0].line.color,
                xValue: points[0].dataPoint.x,
                points: points
            }
            priv.onOver(info);
        }
        canvasEl.addEventListener(mouseDeviceInterface.eventNames.move, (function(e){
            triggerHandler.call(this, mouseDeviceInterface.pointerCoords(e));
        }).bind(this));
        canvasEl.addEventListener(touchDeviceInterface.eventNames.move, (function(e){
            triggerHandler.call(this, touchDeviceInterface.pointerCoords(e));
        }).bind(this), { passive: true });
    }

    function drawAxleY() {
        const priv = getPrivateVars.call(this);
        this._applyCtxOptions(priv.axleLabelsYCtxOptions);
        const rgbaStroke = colorToRgba(priv.ctx.strokeStyle);
        const rgbaFill = colorToRgba(priv.ctx.fillStyle);
        Object.keys(priv.axleLabelsYCurrent).forEach((function(key){
            const axleItem = priv.axleLabelsYCurrent[key];
            if (axleItem.hasOwnProperty('opacity') && !axleItem.opacity) {
                return;
            }
            const value = Number(key);
            priv.ctx.beginPath();
            const y = this._getCurrentCoordinatesTransformer()(point(0, value))[1];
            priv.ctx.moveTo(this._getCtxPadding().left, y);
            priv.ctx.lineTo(this._getCanvasElDrawSize().width, y);
            priv.ctx.closePath();
            priv.ctx.strokeStyle = rgbaToColor(rgbaPlusOpacity(rgbaStroke, axleItem.hasOwnProperty('opacity') ? axleItem.opacity : 1));
            priv.ctx.fillStyle = rgbaToColor(rgbaPlusOpacity(rgbaFill, axleItem.hasOwnProperty('opacity') ? axleItem.opacity : 1));
            priv.ctx.stroke();
            priv.ctx.fillText(axleItem.label, 0, y - 4);
        }).bind(this));
    }

    function drawAxleX() {
        const priv = getPrivateVars.call(this);
        this._applyCtxOptions(priv.axleLabelsXCtxOptions);
        const rgbaFill = colorToRgba(priv.ctx.fillStyle);
        Object.keys(priv.axleLabelsXCurrent).forEach((function(key){
            const axleItem = priv.axleLabelsXCurrent[key];
            if (axleItem.hasOwnProperty('opacity') && !axleItem.opacity) {
                return;
            }
            const value = Number(key);
            const x = this._getCurrentCoordinatesTransformer()(point(value, 0))[0];
            priv.ctx.fillStyle = rgbaToColor(rgbaPlusOpacity(rgbaFill, axleItem.hasOwnProperty('opacity') ? axleItem.opacity : 1));
            priv.ctx.textAlign = value === this._getCurrentLinesBoundingRect().xMin
                ? 'start'
                : (value === this._getCurrentLinesBoundingRect().xMax ? 'end' : 'center');
            priv.ctx.fillText(axleItem.label, x, this._getCanvasElDrawSize().height + this._getCtxPadding().top + 17);
        }).bind(this));
    }

    function mergeLabelsToAxle(axle, axleLabels) {
        if (!axle) {
            return Object.keys(axleLabels).reduce((function(r, key){
                r[key] = {
                    label: axleLabels[key]
                };
                return r;
            }).bind(this), {});
        }
        Object.keys(axle).forEach((function(key){
            if (!axleLabels.hasOwnProperty(key)) {
                axle[key].way = TO_HIDE;
                axle[key].opacity = axle[key].hasOwnProperty('opacity') ? axle[key].opacity : 1;
                return;
            }
            if (axle[key].way === TO_HIDE) {
                axle[key].way = TO_SHOW;
                axle[key].opacity = axle[key].hasOwnProperty('opacity') ? axle[key].opacity : 0;
            }
        }).bind(this));
        Object.keys(axleLabels).forEach((function(key){
            if (!axle.hasOwnProperty(key)) {
                axle[key] = {
                    label: axleLabels[key],
                    way: TO_SHOW,
                    opacity: 0
                };
                return;
            }
        }).bind(this));
        return axle;
    }

    function updateAxle(axle, progress, startAxle) {
        Object.keys(axle).forEach((function(key){
            const axleItem = axle[key];
            if (progress >= 1) {
                if (axleItem.way === TO_HIDE) {
                    delete axle[key];
                    return;
                }
                if (axleItem.way === TO_SHOW) {
                    delete axleItem.opacity;
                    delete axleItem.way;
                    return;
                }
                return;
            }
            if (axleItem.way === TO_HIDE) {
                axleItem.opacity = startAxle[key].opacity - startAxle[key].opacity * progress;
                return;
            }
            if (axleItem.way === TO_SHOW) {
                axleItem.opacity = startAxle[key].opacity + (1 - startAxle[key].opacity) * progress;
                return;
            }
        }).bind(this));
    }

    AreaMain.prototype._updateLinesBoundingRect = function() {
        Area.prototype._updateLinesBoundingRect.call(this);

        const priv = getPrivateVars.call(this);
        priv.axleLabelsY.setAxleRange(rangeStruct(
            this._getLinesBoundingRect().yMin,
            this._getLinesBoundingRect().yMax
        ));
        priv.axleLabelsX.setAxleRange(rangeStruct(
            this._getLinesBoundingRect().xMin,
            this._getLinesBoundingRect().xMax
        ));
    };

    AreaMain.prototype._drawCurrent = function() {
        drawAxleY.call(this);
        drawAxleX.call(this);

        Area.prototype._drawCurrent.call(this);
    };

    AreaMain.prototype.setSize = function(width, height) {
        Area.prototype.setSize.call(this, width, height);
        const priv = getPrivateVars.call(this);
        priv.axleLabelsY.setSize(this._getCanvasElDrawSize().height);
        priv.axleLabelsX.setSize(this._getCanvasElDrawSize().width);
    };

    AreaMain.prototype.draw = function() {
        Area.prototype.draw.call(this);
        const priv = getPrivateVars.call(this);
        if (!priv.axleLabelsYCurrent || !priv.axleLabelsXCurrent) {
            priv.axleLabelsYCurrent = mergeLabelsToAxle.call(this, null, priv.axleLabelsY.getLabels());
            priv.axleLabelsXCurrent = mergeLabelsToAxle.call(this, null, priv.axleLabelsX.getLabels());
            this._animationAction('axle');
        } else {
            let lastAxleLabelsY = priv.axleLabelsY.getLabels();
            let lastAxleLabelsX = priv.axleLabelsX.getLabels();
            this._animationAction(
                'axle',
                (function(progress, startValue){
                    if (lastAxleLabelsY) {
                        mergeLabelsToAxle.call(this, priv.axleLabelsYCurrent, lastAxleLabelsY);
                        lastAxleLabelsY = null;
                    }
                    if (lastAxleLabelsX) {
                        mergeLabelsToAxle.call(this, priv.axleLabelsXCurrent, lastAxleLabelsX);
                        lastAxleLabelsX = null;
                    }
                    updateAxle.call(this, priv.axleLabelsYCurrent, progress, startValue.y);
                    updateAxle.call(this, priv.axleLabelsXCurrent, progress, startValue.x);
                }).bind(this),
                CONSTANTS.ANIMATION_DURATION,
                (function(){
                    return {
                        y: mergeLabelsToAxle.call(this, cloneObject(priv.axleLabelsYCurrent), lastAxleLabelsY),
                        x: mergeLabelsToAxle.call(this, cloneObject(priv.axleLabelsXCurrent), lastAxleLabelsX)
                    };
                }).bind(this)
            );
        }
        priv.onOver(null);
    };

    window.AreaMain = AreaMain;

    if (window.TEST_FS) {
        window.TEST_FS['area-main'] = {
            mergeLabelsToAxle: mergeLabelsToAxle,
            updateAxle: updateAxle,
            TO_SHOW: TO_SHOW,
            TO_HIDE: TO_HIDE
        };
    }
    
})(window);
