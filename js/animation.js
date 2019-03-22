(function(window){
    const raf = requestAnimationFrame;
    const caf = cancelAnimationFrame;
    
    function Animation(stepFn) {
        const params = new Map();
        let afId;
        function step() {
            afId = null;
            params.forEach(update.bind(this, Date.now()));
            stepFn();
            if (!params.size) {
                return;
            }
            params.forEach(update.bind(this, Date.now()));
            afId = raf(step);
        }
        function update(dateNow, param, id) {
            const progress = !param.duration ? 1 : (dateNow - param.startTime) / param.duration;
            if (progress >= 1) {
                param.changeValueFn(1, param.startValue, param.endValue);
                params.delete(id);
                return;
            }
            param.changeValueFn(progress, param.startValue, param.endValue);
            param.lastTime = dateNow;
        }
        this.action = function(id, changeValueFn, duration, startValue, endValue) {
            const now = Date.now();
            params.set(id, {
                startValue: typeof startValue === 'function' ? startValue() : startValue,
                endValue: typeof endValue === 'function' ? endValue() : endValue,
                duration: duration,
                changeValueFn: changeValueFn || function(){},
                startTime: params.has(id) ? params.get(id).lastTime : now,
                lastTime: now
            });
            if (!afId) {
                afId = raf(step);
            }
        };
    }

    window.Animation = Animation;
})(window);
