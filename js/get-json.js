function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function(e) {
        try {
            if (e.target.status >= 400) {
                throw new Error(e.target.statusText);
            }
            callback(JSON.parse(e.target.response));
        } catch (e) {
            throw e;
        }
    }, false);
    xhr.open('GET', url, true);
    xhr.send(null);
}
