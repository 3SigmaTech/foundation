import * as utils from './foundation-utils';
import { mix_hexes_naive as mix_hexes } from './color-mixer';


export function generatePaths(pyramid, context, opts) {

    let padding = utils.getPadding(opts);
    let pathGutter = utils.getPathGutter(opts);
    let channel = utils.getPathChannel(opts);
    let bannerHeight = utils.getBannerHeight(opts);

    let paths = [];
    for (let i = 0; i < opts.numLevels; i++) {

        let row = context.titles[i].row - 1;

        let p0 = [
            pyramid.levels[i][1][0] - 0.5 * (pyramid.levels[i][1][0] - pyramid.levels[i][2][0]),
            pyramid.levels[i][1][1] - 0.1 * pathGutter
        ];

        let p1 = [
            p0[0],
            bannerHeight + padding + (opts.numLevels - i) * channel
        ];


        let pEnd = [
            context.titles[i].x + 0.5 * context.titles[i].width,
            context.titles[i].y
        ];


        if (row == 0) {
            let p2 = [
                pEnd[0],
                p1[1]
            ];

            paths.push([
                [...p0], [...p1], [...p2], [...pEnd]
            ]);
        } else {

            let p2 = [
                opts.width - padding - (opts.numLevels - i) * channel,
                p1[1]
            ];

            let p3 = [
                p2[0],
                context.titles[i].y - (opts.numLevels - i) * channel,
            ];

            let p4 = [
                pEnd[0],
                p3[1]
            ];

            paths.push([
                [...p0], [...p1], [...p2], [...p3], [...p4], [...pEnd]
            ]);
        }

    }

    return paths;
}

export function renderPaths(paths, opts) {

    let svg = utils.getSVG(opts);

    for (let i = 0; i < paths.length; i++) {
        let pointStr = '';
        for (let pt of paths[i]) {
            pointStr += ` ${pt[0]},${pt[1]}`;
        }


        let width = utils.getPathWidth(opts);
        let styleStr = `stroke-linejoin:round;fill:none;`;
        styleStr += `stroke-width:${width};`;
        //styleStr += `stroke:${mix_hexes(opts.colors[i], "#000000")};`;
        styleStr += `stroke:${opts.colors[i]};`;

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        poly.setAttribute('points', pointStr.trim());
        poly.setAttribute('style', styleStr);
        if (!opts.useFlatColors) {
            poly.setAttribute('filter', `url(#faint-outer-glow-${i})`);
        }
        svg.appendChild(poly);
    }


}