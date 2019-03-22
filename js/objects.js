(function(window){
    function cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    window.cloneObject = cloneObject;
})(window);
