(function(window){
    function getBoundingClientRectE(el) {
        const rect = el.getBoundingClientRect();
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollX
        const scrollX = (window.pageXOffset !== undefined)
            ? window.pageXOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
        const scrollY = (window.pageYOffset !== undefined)
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        return {
            width: rect.width,
            height: rect.height,
            left: rect.left + scrollX,
            top: rect.top + scrollY
        };
    }

    window.getBoundingClientRectE = getBoundingClientRectE;
})(window);
