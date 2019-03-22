(function(window){
    const privs = new Map();
    function createPrivateVars() {
        privs.set(this, {});
        return getPrivateVars.call(this);
    }
    function getPrivateVars() {
        return privs.get.call(privs, this);
    }

    function RangeBox(params) {
        const priv = createPrivateVars.call(this);

        new RangeSlider({
            parentEl: params.parentEl || document.body,
            start: params.start || 0.0,
            end: params.end || 1.0,
            minRange: params.minRange || 0.01,
            onChange: params.onChange
        });
    }

    function RangeSlider(params) {
        function calcSlidersAreas(uiParams, minSliderArea) {
            minSliderArea = Math.max(uiParams.sliderWidth, minSliderArea);
            const halfOfSliderWidth = Math.round(uiParams.sliderWidth / 2);
            const halfOfMinSliderArea = Math.round(minSliderArea / 2);
            const r = {};
            r.leftSliderStart = Math.max(
                0,
                uiParams.left + halfOfSliderWidth - halfOfMinSliderArea
            );
            r.leftSliderEnd = Math.max(
                uiParams.left + halfOfSliderWidth + halfOfMinSliderArea,
                r.leftSliderStart + minSliderArea
            );
            const rightSliderStartR = Math.max(
                0,
                uiParams.right + halfOfSliderWidth - halfOfMinSliderArea
            );
            const rightSliderEndR = Math.max(
                uiParams.right + halfOfSliderWidth + halfOfMinSliderArea,
                rightSliderStartR + minSliderArea
            );
            r.rightSliderStart = uiParams.elWidth - rightSliderEndR;
            r.rightSliderEnd = uiParams.elWidth - rightSliderStartR;
            const reserve = r.rightSliderStart - r.leftSliderEnd - minSliderArea;
            if (reserve >= 0) {
                return r;
            }
            const shift = - Math.round(reserve / 2);
            r.leftSliderEnd = Math.max(
                uiParams.left + uiParams.sliderWidth,
                r.leftSliderEnd - shift
            );
            r.leftSliderStart = Math.max(
                0,
                r.leftSliderEnd - minSliderArea
            );
            r.rightSliderStart = Math.min(
                uiParams.elWidth - uiParams.right - uiParams.sliderWidth,
                r.rightSliderStart + shift
            );
            r.rightSliderEnd = Math.min(
                uiParams.elWidth,
                r.rightSliderStart + minSliderArea
            );
            return r;
        }

        function safeStart(value) {
            return Math.max(0, Math.min(value, priv.end - priv.minRange));
        }

        function safeEnd(value) {
            return Math.min(1.0, Math.max(value, priv.start + priv.minRange));
        }

        function leftHandler(uiParams, c) {
            priv.start = safeStart(priv.start + (c.dx / uiParams.elWidth));
            update();
        }

        function centerHandler(uiParams, c) {
            const range = priv.end - priv.start;
            if (c.dx < 0) {
                priv.start = safeStart(priv.start + (c.dx / uiParams.elWidth));
                priv.end = safeEnd(priv.start + range);
                update();
            }
            if (c.dx > 0) {
                priv.end = safeEnd(priv.end + (c.dx / uiParams.elWidth));
                priv.start = safeStart(priv.end - range);
                update();
            }
        }

        function rightHandler(uiParams, c) {
            priv.end = safeEnd(priv.end + (c.dx / uiParams.elWidth));
            update();
        }

        function findHandler(c) {
            const uiParams = calcUIParameters();
            const x = c.x - uiParams.elLeft;
            const slidersAreas = calcSlidersAreas(uiParams, uiParams.sliderWidth * 5);
            if (x >= slidersAreas.leftSliderStart && x <= slidersAreas.leftSliderEnd) {
                return leftHandler.bind(null, uiParams);
            }
            if (x > slidersAreas.leftSliderEnd && x < slidersAreas.rightSliderStart) {
                return centerHandler.bind(null, uiParams);
            }
            if (x >= slidersAreas.rightSliderStart && x <= slidersAreas.rightSliderEnd) {
                return rightHandler.bind(null, uiParams);
            }
            return null;
        }

        function updateUI() {
            const uiParams = calcUIParameters();
            priv.shadowLeftEl.style.width = (uiParams.left + uiParams.sliderWidth) + 'px';
            priv.sliderLeftEl.style.left = uiParams.left + 'px';
            priv.sliderRightEl.style.right = uiParams.right + 'px';
            priv.shadowRightEl.style.width = (uiParams.right + uiParams.sliderWidth) + 'px';
        }

        function createEl(parentEl) {
            priv.el = cloneTemplate('range-box');
            priv.shadowLeftEl = priv.el.querySelector('[data-el="shadow-left"]');
            priv.shadowRightEl = priv.el.querySelector('[data-el="shadow-right"]');
            priv.sliderLeftEl = priv.el.querySelector('[data-el="slider-left"]');
            priv.sliderRightEl = priv.el.querySelector('[data-el="slider-right"]');
            parentEl.appendChild(priv.el);
        }
    
        function calcUIParameters() {
            const sliderWidth = priv.sliderLeftEl.getBoundingClientRect().width;
            const elRect = priv.el.getBoundingClientRect();
            function sliderPosition(percents) {
                return Math.min(
                    elRect.width - 2 * sliderWidth,
                    Math.max(
                        0,
                        Math.round(elRect.width * percents) - sliderWidth
                    )
                );
            }
            return {
                left: sliderPosition(priv.start),
                right: sliderPosition(1.0 - priv.end),
                sliderWidth: sliderWidth,
                elWidth: elRect.width,
                elLeft: elRect.left
            };
        }

        function update() {
            updateUI();
            if (priv.onChange) {
                priv.onChange(rangeStruct(priv.start, priv.end));
            }
        }

        const priv = {
            start: params.start,
            end: params.end,
            minRange: params.minRange,
            onChange: params.onChange,
            handler: null
        };
        createEl(params.parentEl);
        new RangeSliderEventsListener(
            params.parentEl,
            function(c){ priv.handler = findHandler(c); },
            function(c){ priv.handler && priv.handler(c); }
        );
        updateUI();
        window.addEventListener('resize', updateUI);
    }

    function RangeSliderEventsListener(el, onStart, onMove, documentEl) {
        function cancelEvent(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        function mouseDownListener(e) {
            cancelEvent(e);
            lastC = deviceInterface.pointerCoords(e);
            onStart({x: lastC.x});
            documentEl.removeEventListener(deviceInterface.eventNames.move, mouseMoveListener);
            documentEl.removeEventListener(deviceInterface.eventNames.up, mouseUpListener);
            documentEl.addEventListener(deviceInterface.eventNames.move, mouseMoveListener);
            documentEl.addEventListener(deviceInterface.eventNames.up, mouseUpListener);
        }
        function mouseMoveListener(e) {
            cancelEvent(e);
            triggerOnMove(e);
        }
        function mouseUpListener(e) {
            cancelEvent(e);
            documentEl.removeEventListener(deviceInterface.eventNames.move, mouseMoveListener);
            documentEl.removeEventListener(deviceInterface.eventNames.up, mouseUpListener);
            triggerOnMove(e);
        }
        function triggerOnMove(e) {
            const c = deviceInterface.pointerCoords(e);
            onMove({
                x: c.x,
                dx: c.x - lastC.x
            });
            lastC = c;
        }
        function setDeviceInterface(devInt) {
            if (deviceInterface) {
                documentEl.removeEventListener(deviceInterface.eventNames.move, mouseMoveListener);
                documentEl.removeEventListener(deviceInterface.eventNames.up, mouseUpListener);
            }
            deviceInterface = devInt;
        }
        let lastC;
        let deviceInterface;
        documentEl = documentEl || document.getElementsByTagName('html')[0];
        el.addEventListener(touchDeviceInterface.eventNames.down, function(e) {
            setDeviceInterface(touchDeviceInterface);
            mouseDownListener(e);
        }, { passive: true });
        el.addEventListener(mouseDeviceInterface.eventNames.down, function(e) {
            setDeviceInterface(mouseDeviceInterface);
            mouseDownListener(e);
        });
    }

    window.RangeBox = RangeBox;
})(window);
