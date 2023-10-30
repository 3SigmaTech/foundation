
export function getSVG(opts) {
    let svg = document.querySelector(opts.container);
    if (svg == null || svg == undefined) {
        console.error('Container does not exist');
    }
    return svg;
}

export function getPadding(opts) {
    return opts.padding;
}

export function getBannerHeight(opts) {
    return opts.bannerHeight;
}

export function getPyramidHeight(opts) {
    if (opts.pyramidHeight >= opts.height) {
        return opts.height - 2 * getPadding(opts);
    }
    return opts.pyramidHeight;
}

export function getPyramidWidth(opts) {
    return opts.pyramidWidth;
}

export function getPathGutter(opts) {
    return getPyramidHeight(opts) / opts.numLevels;
}

export function getPathWidth(opts) {
    //return 3;
    return Math.min(10, (opts.useFlatColors ? 0.8 : 0.5) * getPathGutter(opts) / opts.numLevels - 2);
}

export function getPathChannel(opts) {
    return (getPathGutter(opts) / (opts.numLevels + 1));
}
export function getTopLeftRoundedCorner(radius, counterclockwise = true) {
    if (counterclockwise) {
        return `q0,-${radius} ${radius},-${radius}`;
    } else {
        return `q-${radius},0 -${radius},${radius}`;
    }
}
export function getTopRightRoundedCorner(radius, counterclockwise = true) {
    if (counterclockwise) {
        return `q${radius},0 ${radius},${radius}`;
    } else {
        return `q0,-${radius} -${radius},-${radius}`;
    }
}

export function getBottomLeftRoundedCorner(radius, counterclockwise = true) {
    return 'this has not been worked out';
    // if (counterclockwise) {
    //     return `q0,-${radius} ${radius},-${radius}`;
    // } else {
    //     return `q-${radius},0 -${radius},${radius}`;
    // }
}
export function getBottomRightRoundedCorner(radius, counterclockwise = true) {
    return 'this has not been worked out';
    // if (counterclockwise) {
    //     return `q${radius},0 ${radius},${radius}`;
    // } else {
    //     return `q0,-${radius} -${radius},-${radius}`;
    // }
}