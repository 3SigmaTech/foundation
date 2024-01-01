import type { PyramidData, FoundationOptions } from '../foundation-utils';

import * as utils from '../foundation-utils';
import * as svgutils from '../svg-utils';

import { mix_hexes } from "../color-mixer";


export type PyramidObject = {
    pyramid: number[][];
    levels: number[][][];
    labels: {
        text: string;
        x: number;
        y: number;
    }[];
};

export function generatePyramid(data: PyramidData, opts: FoundationOptions): PyramidObject {

    let padding = opts.padding;
    let pH = utils.getPyramidHeight(opts);
    let pW = opts.pyramidWidth;
    let bannerHeight = opts.bannerHeight;

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

    return { pyramid: [p0, p1, p2], levels: levels, labels: labels };
}


export function renderPyramid(pyramid:PyramidObject, opts:FoundationOptions) {

    let svg = utils.getSVG(opts);

    let pointStr = 'M';
    for (let pt of pyramid.pyramid) {
        pointStr += `${pt[0]},${pt[1]} `;
    }
    pointStr += 'Z';

    // Draw a white pyramid to hide the paths that are drawn under the pyramid
    let styleStr = `stroke-width:1;fill:#ffffff;stroke:#ffffff;`;
    let poly = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    poly.setAttribute('d', pointStr.trim());
    poly.setAttribute('style', styleStr);
    svg.appendChild(poly);


    for (let i = 0; i < pyramid.levels.length; i++) {
        let pointStr = 'M';
        for (let pt of pyramid.levels[i]) {
            pointStr += `${pt[0]},${pt[1]} `;
        }
        pointStr += 'Z';

        let styleStr = 'stroke-width:1;';
        styleStr += `fill:${opts.pyramidColors[i]};`;
        styleStr += `stroke:${mix_hexes(opts.pyramidColors[i], "#000000")};`;

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        poly.setAttribute('d', pointStr.trim());
        poly.setAttribute('style', styleStr);
        if (!opts.useFlatColors) {
            //poly.setAttribute('filter', `url(#inner-glow-pyramid-${i})`);
            poly.setAttribute('filter', 'url(#glow-by-blur)');
        }
        svg.appendChild(poly);

        poly = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        poly.setAttribute('d', pointStr.trim());
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
            padding: opts.padding
        });
        tBox.background.setAttribute('fill', 'none');
        tBox.group.setAttribute('filter', `url(#outline-pyramid-${i})`);

    }



    // Renders embossed label on the pyramid

    styleStr = opts.labelStyle;
    styleStr += `letter-spacing:0.05em;`

    // Add text to get size, then remove
    let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    text.setAttribute('style', styleStr);
    text.setAttribute('class', 'uncentered');
    var textNode = document.createTextNode(opts.pyramidLabel);
    text.appendChild(textNode);
    svg.appendChild(text);
    let textRect = text.getBBox();
    svg.removeChild(text);

    let angle = Math.atan((pyramid.pyramid[1][1] - pyramid.pyramid[0][1]) / (pyramid.pyramid[0][0] - pyramid.pyramid[1][0]));
    let rotation = angle * -(180/Math.PI);

    let [cx, cy] = pyramid.pyramid[1];
    let dy = utils.getPathGutter(opts) / 2;
    cy -= dy;
    cx += ((dy / Math.tan(angle)) + textRect.height / 2 + opts.padding);

    let tBox = svgutils.drawContainedText({
        svg: svg,
        text: opts.pyramidLabel,
        x: cx,
        y: cy,
        textStyle: styleStr,
        padding: opts.padding,
        centered: false
    });
    tBox.group.setAttribute('filter', 'url(#emboss)');
    tBox.label.setAttribute("transform", `rotate(${rotation} ${cx} ${cy})`);
    tBox.background.setAttribute("transform", `rotate(${rotation} ${cx} ${cy})`);
    tBox.background.setAttribute("fill", `none`);


}
