(function(window){
    function Line(lineData) {
        LineBasic.call(this, lineData.values.map(function(value){ return point(value[0], value[1]); }));

        this.color = lineData.color;
        const colorRGBA = colorToRgba(this.color);
        this.colorRGB = [colorRGBA.r, colorRGBA.g, colorRGBA.b];
        this.name = lineData.name;
    }

    const prototype = new LineBasic;
    Line.prototype = prototype;

    window.Line = Line;
})(window);
