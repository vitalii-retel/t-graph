function transformGraphData(graphDataSource) {
    // { [id: string]: number[] }
    const columns = graphDataSource.columns.reduce((function(r, column){
        r[column[0]] = column.slice(1);
        return r;
    }).bind(this), {});
    // { x: string, lines: string[] } -> { x: id, lines: id[] }
    const types = {
        x: null,
        lines: []
    };
    for (let key in graphDataSource.types) {
        if (!graphDataSource.types.hasOwnProperty(key)) {
            continue;
        }
        if (graphDataSource.types[key] === 'line') {
            types.lines.push(key);
            continue;
        }
        if (graphDataSource.types[key] === 'x') {
            types.x = key;
            continue;
        }
    }
    // { values: [number, number][], color: string, name: string }[] -> { values: [x, y][], color: string, name: string }[]
    return types.lines.map((function(lineId){
        return {
            color: graphDataSource.colors[lineId],
            name: graphDataSource.names[lineId],
            values: columns[types.x].map(function(x, index){ return [x, columns[lineId][index]]; })
        };
    }).bind(this));
}
