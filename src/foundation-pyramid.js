import * as utils from './foundation-utils';
import { mix_hexes_naive as mix_hexes } from './color-mixer';

export function generatePyramid(data, opts) {

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
    for (let i = opts.numLevels - 1; i >= 0; i--) {
        let nextL = [
            lastL[0] + (0.5 * pW / opts.numLevels),
            lastL[1] - (pH / opts.numLevels)
        ];
        let nextR = [
            lastR[0] - (0.5 * pW / opts.numLevels),
            lastR[1] - (pH / opts.numLevels)
        ];

        levels.push([
            lastL, lastR, nextR, nextL
        ]);


        labels.push({
            text: opts.labels[i],
            x: p0[0],
            y: lastL[1] - 0.5 * (lastL[1] - nextL[1]),
        });

        lastL = nextL;
        lastR = nextR;

    }

    return { levels: levels, labels: labels };
}


export function renderPyramid(pyramid, opts) {

    let svg = utils.getSVG(opts);

    for (let i = 0; i < pyramid.levels.length; i++) {
        let pointStr = '';
        for (let pt of pyramid.levels[i]) {
            pointStr += ` ${pt[0]},${pt[1]}`;
        }

        let styleStr = 'stroke-width:1;';
        styleStr += `fill:${opts.colors[i]};`;
        styleStr += `stroke:${mix_hexes(opts.colors[i], "#000000")};`;

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        poly.setAttribute('points', pointStr.trim());
        poly.setAttribute('style', styleStr);
        if (!opts.useFlatColors) {
            poly.setAttribute('filter', `url(#inner-glow-${i})`);
        }
        svg.appendChild(poly);

        poly = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
        poly.setAttribute('points', pointStr.trim());
        poly.setAttribute('style', styleStr + 'fill:none;');
        svg.appendChild(poly);
    }

    for (let i = 0; opts.showLabels && i < pyramid.labels.length; i++) {
        let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.setAttribute('x', pyramid.labels[i].x);
        text.setAttribute('y', pyramid.labels[i].y);
        text.setAttribute('style', opts.labelStyle);

        var textNode = document.createTextNode(pyramid.labels[i].text);
        text.appendChild(textNode);

        svg.appendChild(text);

        SVGRect = text.getBBox();
        let padding = utils.getPadding(opts);
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", SVGRect.x - padding);
        rect.setAttribute("y", SVGRect.y - padding);
        rect.setAttribute("rx", padding);
        rect.setAttribute("ry", padding);
        rect.setAttribute("width", SVGRect.width + 2 * padding);
        rect.setAttribute("height", SVGRect.height + 2 * padding);
        rect.setAttribute("fill", `${mix_hexes(opts.colors[i], mix_hexes(opts.colors[i], "#000000"))}`);
        if (!opts.useFlatColors) {
            rect.setAttribute('filter', `url(#big-blur)`);
        }
        svg.insertBefore(rect, text);
    }
}
