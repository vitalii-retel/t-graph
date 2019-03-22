(function(window){
    const privs = new Map();
    function createPrivateVars() {
        privs.set(this, {});
        return getPrivateVars.call(this);
    }
    function getPrivateVars() {
        return privs.get.call(privs, this);
    }

    function Graph(graphData, params) {
        const priv = createPrivateVars.call(this);
        this.createEl(params.parentEl || document.body, params.name);
        this.createLines(graphData);
        this.createAreas(params);
        this.createButtons();
        this.createResizeListeners();
        createRangeBox.call(this);

        this.draw();
    }

    function buttonToggleListener(buttonEl, line, e) {
        e.preventDefault();
        e.stopPropagation();
        const off = !buttonEl.classList.contains('_off');
        if (off) {
            this.traverseThroughAreas(function(areaItem) {
                areaItem.area.addOffLines([line]);
            });
            buttonEl.classList.add('_off');
        } else {
            this.traverseThroughAreas(function(areaItem) {
                areaItem.area.removeOffLines([line]);
            });
            buttonEl.classList.remove('_off');
        }
        this.draw();
    }

    function createRangeBox() {
        const priv = getPrivateVars.call(this);
        new RangeBox({
            parentEl: this.el.querySelector('[data-el="graph-map"]'),
            onChange: (function(range){
                this.areas.main.area.setBoundingMaxRange(priv.rangeToRect(range));
                this.areas.main.area.draw();
            }).bind(this),
            start: 0,
            end: 1.0
        });
    }
    
    Graph.prototype.createEl = function(parentEl, name) {
        this.el = cloneTemplate('graph');
        this.el.querySelector('[data-el="name"]').textContent = name;
        parentEl.appendChild(this.el);
    };
    
    Graph.prototype.createLines = function(graphData) {
        const priv = getPrivateVars.call(this);
        this.lines = graphData.map(function(graphDataItem){ return new Line(graphDataItem); });
        const linesBoundingRect = LineBasic.calcLinesBoundingRect(this.lines);
        priv.rangeToRect = (function(range){
            const dx = linesBoundingRect.xMax - linesBoundingRect.xMin;
            const r = boundingRect(
                this.lines[0].getClosestXBefore(range.start * dx + linesBoundingRect.xMin),
                undefined,
                this.lines[0].getClosestXAfter(range.end * dx + linesBoundingRect.xMin),
                undefined
            );
            return r;
        }).bind(this);
    };
    
    Graph.prototype.createAreas = function(params) {
        const priv = getPrivateVars.call(this);
        const areaMainBoxEl = this.el.querySelector('[data-el="graph-main"]');
        const areaMapBoxEl = this.el.querySelector('[data-el="graph-map"]');
        this.areas = {
            main: {
                area: new AreaMain({
                    canvasEl: areaMainBoxEl.querySelector('[data-el="area-main"]'),
                    ctxOptions: {
                        lineCap: 'round',
                        lineJoin: 'round'
                    },
                    ctxLineOptions: {
                        lineWidth: 2
                    },
                    ctxPadding: {
                        top: 1,
                        left: 0,
                        bottom: 1,
                        right: 0
                    },
                    axleLabelsY: params.axleLabelsY || {
                        labelSize: 20,
                        labelMinGap: 40
                    },
                    axleLabelsX: params.axleLabelsX || {
                        labelSize: 40,
                        labelMinGap: 30,
                        multiplicityFn: function(){ return 1000 * 60 * 60 * 24; },
                        multiplicityStart: this.lines[0].calcBoundingRect().xMin,
                        labelTransformer: function(value){ return new Date(value).toDateString().slice(4, 10); }
                    },
                    boundingMinRange: boundingRect(undefined, 0, undefined, undefined),
                    boundingMaxRange: priv.rangeToRect(rangeStruct(0, 1.0))
                }),
                boxEl: areaMainBoxEl
            },
            map: {
                area: new Area({
                    canvasEl: areaMapBoxEl.querySelector('[data-el="area-map"]'),
                    ctxOptions: {
                        lineWidth: 1,
                        lineCap: 'round',
                        lineJoin: 'round'
                    }
                }),
                boxEl: areaMapBoxEl
            }
        };
        this.updateAreasSize();
        this.traverseThroughAreas((function(areaItem){
            areaItem.area.addLines(this.lines);
        }).bind(this));
    };

    Graph.prototype.createButtons = function() {
        const buttonParentEl = this.el.querySelector('[data-el="buttons"]');
        this.buttons = this.lines.map((function(line){
            const buttonEl = cloneTemplate('graph-button');
            buttonEl.querySelector('[data-el="icon"]').style.backgroundColor = line.color;
            buttonEl.querySelector('[data-el="icon"]').style.borderColor = line.color;
            buttonEl.querySelector('[data-el="name"]').textContent = line.name;
            buttonParentEl.appendChild(buttonEl);
            buttonEl.addEventListener('click', buttonToggleListener.bind(this, buttonEl, line));
            return buttonEl;
        }).bind(this));
    };
    
    Graph.prototype.createResizeListeners = function() {
        window.addEventListener('resize', (function(){
            this.updateAreasSize();
            this.draw();
        }).bind(this));
    };
    
    Graph.prototype.updateAreasSize = function() {
        this.traverseThroughAreas(function(areaItem) {
            areaItem.area.setSize(areaItem.boxEl.clientWidth, areaItem.boxEl.clientHeight);
        });
    };
    
    Graph.prototype.draw = function() {
        this.traverseThroughAreas(function(areaItem) {
            areaItem.area.draw();
        });
    };
    
    Graph.prototype.traverseThroughAreas = function(cb) {
        Object.keys(this.areas).forEach((function(areaKey){
            cb(this.areas[areaKey]);
        }).bind(this));
    };

    window.Graph = Graph;
})(window);
