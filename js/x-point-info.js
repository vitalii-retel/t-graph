(function(window){
    const privs = new Map();
    function createPrivateVars() {
        privs.set(this, {});
        return getPrivateVars.call(this);
    }
    function getPrivateVars() {
        return privs.get.call(privs, this);
    }

    function XPointInfo(parentEl) {
        const priv = createPrivateVars.call(this);
        priv.parentEl = parentEl;
        priv.el = parentEl.querySelector('[data-el="x-point"]');
        priv.titleEl = priv.el.querySelector('[data-el="x-point-title"]');
        priv.lineEl = priv.el.querySelector('[data-el="x-point-line"]');
        priv.pointsEl = priv.el.querySelector('[data-el="x-point-points"]');
        priv.pointValuesEl = priv.el.querySelector('[data-el="x-point-values"]');
        priv.bubbleEl = priv.el.querySelector('.bubble');
        const bubbleStyles = window.getComputedStyle(priv.bubbleEl);
        priv.bubbleStyles = {
            marginLeft: parseInt(bubbleStyles['margin-left'], 10),
            marginTop: parseInt(bubbleStyles['margin-top'], 10)
        };
        priv.serializedLastInfo = null;
    }

    function build(info) {
        const priv = getPrivateVars.call(this);
        const serializedInfo = JSON.stringify(info);
        if (serializedInfo === priv.serializedLastInfo) {
            return;
        }
        // position
        priv.el.style.top = info.top + 'px';
        priv.el.style.left = round(info.left, 1) + 'px';
        priv.el.style.height = info.height + 'px';
        // title
        priv.titleEl.textContent = (function(date){ return date.slice(0, 3) + ', ' + date.slice(4, 10); })(new Date(info.xValue).toDateString());
        // line
        priv.lineEl.style.backgroundColor = info.lineColor;
        // points
        while (priv.pointsEl.hasChildNodes()) {
            priv.pointsEl.removeChild(priv.pointsEl.lastChild);
        }
        while (priv.pointValuesEl.hasChildNodes()) {
            priv.pointValuesEl.removeChild(priv.pointValuesEl.lastChild);
        }
        const pointTops = [];
        info.points.forEach((function(pointItem){
            const point = cloneTemplate('x-point-point');
            const top = round(pointItem.point.top - info.top, 1);
            pointTops.push(top);
            point.style.top = top + 'px';
            point.style.backgroundColor = pointItem.color;
            priv.pointsEl.appendChild(point);
            const pointValue = cloneTemplate('x-point-value');
            pointValue.querySelector('[data-el="point-value"]').textContent = pointItem.dataPoint.y;
            pointValue.querySelector('[data-el="point-name"]').textContent = pointItem.name;
            pointValue.style.color = pointItem.color;
            priv.pointValuesEl.appendChild(pointValue);
        }).bind(this));
        // bubble position
        const bubbleRect = getBoundingClientRectE(priv.bubbleEl);
        const parentRect = getBoundingClientRectE(priv.parentEl);
        if (info.left + priv.bubbleStyles.marginLeft <= 20) {
            priv.el.classList.add('_left');
        } else {
            priv.el.classList.remove('_left');
        }
        if (info.left + priv.bubbleStyles.marginLeft + bubbleRect.width + 20 >= parentRect.width) {
            priv.el.classList.add('_right');
        } else {
            priv.el.classList.remove('_right');
        }
        const bubbleHeight = bubbleRect.height;
        function intersect(top) {
            return pointTops.some(function(pointTop){
                return (top <= pointTop + 15) && (top + bubbleHeight >= pointTop - 15);
            });
        };
        let bubbleTop = priv.bubbleStyles.marginTop;
        if (intersect(bubbleTop)) {
            while (intersect(bubbleTop) && (bubbleTop + bubbleHeight < info.height)) {
                bubbleTop += 3;
            }
            priv.bubbleEl.style.marginTop = bubbleTop + 'px';
        } else {
            priv.bubbleEl.style.marginTop = '';
        }
        
        priv.serializedLastInfo = serializedInfo;
    }

    XPointInfo.prototype.show = function(info) {
        const priv = getPrivateVars.call(this);
        build.call(this, info);
        priv.el.classList.add('_show');
    };

    XPointInfo.prototype.hide = function() {
        const priv = getPrivateVars.call(this);
        priv.el.classList.remove('_show');
    };

    window.XPointInfo = XPointInfo;
})(window);
