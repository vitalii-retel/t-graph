(function () {
    getJSON('../data/chart_data.json', function(data) {
        const graphsEl = document.querySelector('[data-el="graphs"]');
        for (let i = 0; i < data.length; i++) {
            new Graph(
                transformGraphData(data[i]),
                {
                    parentEl: graphsEl,
                    name: 'Graph ' + (i + 1)
                }
            );
        }
    });

    const lightModeEl = document.getElementById('light-mode-switch');
    const lightModeStorageKey = 'graph-night-mode';
    let nightMode = localStorage.getItem(lightModeStorageKey) || '';
    function updateLightMode() {
        if (nightMode) {
            lightModeEl.textContent = 'Switch to Day Mode';
            document.body.classList.add('night-mode');
        } else {
            document.body.classList.remove('night-mode');
            lightModeEl.textContent = 'Switch to Night Mode';
        }
    }
    lightModeEl.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        nightMode = nightMode ? '' : '1';
        localStorage.setItem(lightModeStorageKey, nightMode);
        updateLightMode();
    });
    updateLightMode();

    /*function myGraphs() {
        const graphsEl = document.querySelector('[data-el="graphs-my"]');
        const xStart = - Math.PI * 5;
        const dx = 0.001;
        const xEnd = - xStart;
        new Graph(
            [{
                values: ['cos(x)'].reduce(function(r){
                    for (let x = xStart; x < xEnd; x += dx) {
                        r.push([x, Math.cos(x)]);
                    }
                    return r;
                }, []),
                color: '#ff0000',
                name: ''
            }, {
                values: ['six(x)'].reduce(function(r){
                    for (let x = xStart; x < xEnd; x += dx) {
                        r.push([x, Math.sin(x)]);
                    }
                    return r;
                }, []),
                color: '#0000ff',
                name: ''
            }, {
                values: ['-'].reduce(function(r){
                    for (let x = xStart; x < xEnd; x += dx) {
                        r.push([x, Math.cos(x) * Math.sin(x)]);
                    }
                    return r;
                }, []),
                color: '#00ff00',
                name: ''
            }],
            {
                parentEl: graphsEl,
                name: 'Test',
                axleLabelsX: {
                    labelSize: 40,
                    labelMinGap: 30
                },
            }
        );
    }
    myGraphs();*/

})();
