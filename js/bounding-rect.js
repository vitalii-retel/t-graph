function boundingRect(xMin, yMin, xMax, yMax) {
    return {
        xMin: xMin,
        yMin: yMin,
        xMax: xMax,
        yMax: yMax
    };
}

function boundingRectCopy(bRect) {
    return boundingRect(bRect.xMin, bRect.yMin, bRect.xMax, bRect.yMax);
}

function boundingRectsEqual(bRect1, bRect2) {
    return bRect1.xMin === bRect2.xMin &&
    bRect1.yMin === bRect2.yMin &&
    bRect1.xMax === bRect2.xMax &&
    bRect1.yMax === bRect2.yMax;
}
