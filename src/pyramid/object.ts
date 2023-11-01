import type { PyramidData, FoundationOptions } from '../foundation-utils';

import * as utils from '../foundation-utils';
import { mix_hexes_naive as mix_hexes } from '../color-mixer';
import * as svgutils from '../svg-utils';

export type PyramidObject = {
    levels: number[][][];
    labels: {
        text: string;
        x: number;
        y: number;
    }[];
};

export function generatePyramid(data: PyramidData, opts: FoundationOptions): PyramidObject {

    let padding = utils.getPadding(opts);
    let pH = utils.getPyramidHeight(opts);
    let pW = utils.getPyramidWidth(opts);
    let bannerHeight = utils.getBannerHeight(opts);

    let p0 = [0.5 * pW + padding, bannerHeight + padding];
    let p1 = [padding, bannerHeight + pH + padding];
    let p2 = [pW + padding, bannerHeight + pH + padding];

    let levels = [];
    let labels = [];

    let lastL = p1;
    let lastR = p2;
    for (let i = opts.pyramidLevels - 1; i >= 0; i--) {
        let nextL = [
            lastL[0] + (0.5 * pW / opts.pyramidLevels),
            lastL[1] - (pH / opts.pyramidLevels)
        ];
        let nextR = [
            lastR[0] - (0.5 * pW / opts.pyramidLevels),
            lastR[1] - (pH / opts.pyramidLevels)
        ];

        levels.push([
            lastL, lastR, nextR, nextL
        ]);


        labels.push({
            text: data[i].label ?? '',
            x: p0[0],
            y: lastL[1] - 0.5 * (lastL[1] - nextL[1]),
        });

        lastL = nextL;
        lastR = nextR;

    }

    return { levels: levels, labels: labels };
}


export function renderPyramid(pyramid:PyramidObject, opts:FoundationOptions) {

    let svg = utils.getSVG(opts);

    for (let i = 0; i < pyramid.levels.length; i++) {
        let pointStr = '';
        for (let pt of pyramid.levels[i]) {
            pointStr += ` ${pt[0]},${pt[1]}`;
        }

        let styleStr = 'stroke-width:1;';
        styleStr += `fill:${opts.pyramidColors[i]};`;
        styleStr += `stroke:${mix_hexes(opts.pyramidColors[i], "#000000")};`;

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        poly.setAttribute('points', pointStr.trim());
        poly.setAttribute('style', styleStr);
        if (!opts.useFlatColors) {
            poly.setAttribute('filter', `url(#inner-glow-pyramid-${i})`);
        }
        svg.appendChild(poly);

        poly = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        poly.setAttribute('points', pointStr.trim());
        poly.setAttribute('style', styleStr + 'fill:none;');
        svg.appendChild(poly);
    }

    for (let i = 0; opts.showLabels && i < pyramid.labels.length; i++) {

        let tBox = svgutils.drawContainedText({
            svg: svg,
            text: pyramid.labels[i].text,
            x: pyramid.labels[i].x,
            y: pyramid.labels[i].y,
            textStyle: opts.labelStyle,
            padding: utils.getPadding(opts)
        });
        tBox.background.setAttribute("fill", `${mix_hexes(opts.pyramidColors[i], mix_hexes(opts.pyramidColors[i], "#000000"))}`);
        if (!opts.useFlatColors) {
            tBox.background.setAttribute('filter', `url(#big-blur)`);
        }

    }
}
