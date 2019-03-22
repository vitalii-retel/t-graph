(function(window){
    /**
     * Returns rgba object
     * Input can be
     * #aaa
     * #bbbbbb
     * rgb(10, 10, 10)
     * rgba(20, 20, 20, 0.5)
     * @param {{r,g,b,a}} color 
     */
    function colorToRgba(color) {
        if (!color) {
            return null;
        }
        if (/^#[a-z0-9]{3}$/i.test(color)) {
            return {
                r: parseInt(color.slice(1, 2) + color.slice(1, 2), 16),
                g: parseInt(color.slice(2, 3) + color.slice(2, 3), 16),
                b: parseInt(color.slice(3, 4) + color.slice(3, 4), 16),
                a: 1
            }
        }
        if (/^#[a-z0-9]{6}$/i.test(color)) {
            return {
                r: parseInt(color.slice(1, 3), 16),
                g: parseInt(color.slice(3, 5), 16),
                b: parseInt(color.slice(5, 7), 16),
                a: 1
            }
        }
        const rgb = /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/i;
        const rgbMatch = color.match(rgb);
        if (rgbMatch) {
            return {
                r: Number(rgbMatch[1]),
                g: Number(rgbMatch[2]),
                b: Number(rgbMatch[3]),
                a: 1
            }
        }
        const rgba = /^rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9.,]{1,})\s*\)$/i;
        const rgbaMatch = color.match(rgba);
        if (rgbaMatch) {
            return {
                r: Number(rgbaMatch[1]),
                g: Number(rgbaMatch[2]),
                b: Number(rgbaMatch[3]),
                a: Number(rgbaMatch[4])
            }
        }
        return null;
    }

    function rgbaToColor(rgba) {
        return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')';
    }

    function rgbaPlusOpacity(rgba, opacity) {
        return {
            r: rgba.r,
            g: rgba.g,
            b: rgba.b,
            a: rgba.a * opacity
        };
    }

    window.colorToRgba = colorToRgba;
    window.rgbaToColor = rgbaToColor;
    window.rgbaPlusOpacity = rgbaPlusOpacity;
})(window);
