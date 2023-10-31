import type { FoundationOptions, PyramidData, FoundationContent } from '../foundation-utils';

import * as utils from '../foundation-utils';
import * as svgutils from '../svg-utils';

import { mix_hexes_naive as mix_hexes } from '../color-mixer';

export type PyramidContext = {
    titles:{
        text: string;
        cx: number;
        cy: number;
        x: number;
        y: number;
        width: number;
        height: number;
        row: number;
    }[];
    bodies:{
        body: FoundationContent;
        cx: number;
        cy: number;
        x: number;
        y: number;
        width: number;
        height: number;
        row: number;
    }[];
};

export function generateContext(data:PyramidData, opts:FoundationOptions):PyramidContext {

    let rowMeta = {width: [0], columns: [0]};
    for (let i = 0; i < data.length; i++) {
        let colWidth = (data[i].contextWidth ?? 1);
        let row = (data[i].row ?? 1) - 1;

        while (row >= rowMeta.width.length) {
            rowMeta.width.push(0);
            rowMeta.columns.push(0);
        }
        
        rowMeta.width[row] += colWidth;
        rowMeta.columns[row]++;
    }
    
    let padding = utils.getPadding(opts);
    let pyramidWidth = utils.getPyramidWidth(opts);
    let pyramidHeight = utils.getPyramidHeight(opts);
    let pathGutter = utils.getPathGutter(opts);
    let pathChannelWidth = utils.getPathChannel(opts);
    let bannerHeight = utils.getBannerHeight(opts);

    let titles = [];
    let bodies = [];
    
    let titleHeight = pathGutter;
    let bodyHeight = pyramidHeight - pathGutter - titleHeight;
    
    let remainingPaths = opts.pyramidLevels;

    let titleTopLeft = [0, bannerHeight + padding + pathGutter];
    let titleBottomLeft = [0, bannerHeight + padding + pathGutter + titleHeight];
    let bodyBottomLeft = [0, bannerHeight + padding + pathGutter + titleHeight + bodyHeight];

    for (let r = 0; r < rowMeta.width.length; r++) {
        
        let objectSpace = (r > 0 ? 0 : pyramidWidth + padding);
        let x0 = objectSpace + padding;
        titleTopLeft[0] = x0;
        titleBottomLeft[0] = x0;
        bodyBottomLeft[0] = x0;

        let wrappingPaths = 0;
        for (let i = r + 1; i < rowMeta.columns.length; i++) {
            wrappingPaths += rowMeta.columns[i];
        }

        let myPathGutter = remainingPaths * (pathGutter / opts.pyramidLevels);
        remainingPaths -= rowMeta.columns[r];

        let pathVerticalGutter = (r == rowMeta.width.length ? 0 : pathChannelWidth * wrappingPaths + padding);
        
        let contextWidth = (opts.width - padding - objectSpace - pathVerticalGutter) / rowMeta.width[r];

        if (r > 0) {
            titleTopLeft[1] += (padding + myPathGutter + titleHeight + bodyHeight);
            titleBottomLeft[1] += (padding + myPathGutter + titleHeight + bodyHeight);
            bodyBottomLeft[1] += (padding + myPathGutter + titleHeight + bodyHeight);
        }

        for (let i = opts.pyramidLevels - 1; i >= 0; i--) {

            if ((data[i].row ?? 1) != (r + 1)) {
                continue;
            }

            let myWidth = contextWidth * (data[i].contextWidth ?? 1) - padding;

            let titleTopRight = [titleTopLeft[0] + myWidth, titleTopLeft[1]];
            let titleBottomRight = [titleBottomLeft[0] + myWidth, titleBottomLeft[1]];
            let bodyBottomRight = [bodyBottomLeft[0] + myWidth, bodyBottomLeft[1]];

            titles.push({
                text: data[i].label ?? '',
                cx: titleTopLeft[0] + 0.5 * (titleTopRight[0] - titleTopLeft[0]),
                cy: titleTopLeft[1] + 0.5 * (titleBottomLeft[1] - titleTopLeft[1]),
                x: titleTopLeft[0],
                y: titleTopLeft[1],
                width: (titleTopRight[0] - titleTopLeft[0]),
                height: (titleBottomLeft[1] - titleTopLeft[1]),
                row: (data[i].row ?? 1)
            });

            bodies.push({
                body: {...data[i].content},
                cx: titleBottomLeft[0] + 0.5 * (titleBottomRight[0] - titleBottomLeft[0]),
                cy: titleBottomLeft[1] + 0.5 * (bodyBottomLeft[1] - titleBottomLeft[1]),
                x: titleBottomLeft[0],
                y: titleBottomLeft[1],
                width: (titleBottomRight[0] - titleBottomLeft[0]),
                height: (bodyBottomLeft[1] - titleBottomLeft[1]),
                row: (data[i].row ?? 1)
            });


            titleTopLeft[0] = titleTopRight[0] + padding;
            titleBottomLeft[0] = titleBottomRight[0] + padding;
            bodyBottomLeft[0] = bodyBottomRight[0] + padding;
        }
    }

    return { titles: titles, bodies: bodies };
}

export function renderContext(context:PyramidContext, opts:FoundationOptions) {

    let svg = utils.getSVG(opts);
    let padding = utils.getPadding(opts);

    for (let i = 0; i < context.titles.length; i++) {

        let pathStr = svgutils.roundedRectPath({
            x: context.titles[i].x,
            y: context.titles[i].y,
            width: context.titles[i].width,
            height: context.titles[i].height,
            radii: [padding, padding, 0, 0]
        });

        let styleStr = 'stroke-width:1;';
        styleStr += `fill:${opts.colors[i]};`;
        styleStr += `stroke:${mix_hexes(opts.colors[i], "#000000")};`;

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', pathStr);
        path.setAttribute('style', styleStr);
        if (!opts.useFlatColors) {
            path.setAttribute('filter', `url(#inner-glow-${i})`);
        }
        svg.appendChild(path);

        path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', pathStr);
        path.setAttribute('style', styleStr += 'fill:none;');
        svg.appendChild(path);

        let tBox = svgutils.drawContainedText({
            svg: svg,
            text: context.titles[i].text,
            x: context.titles[i].cx,
            y: context.titles[i].cy,
            textStyle: opts.labelStyle,
            padding: utils.getPadding(opts)
        });
        tBox.background.setAttribute("fill", `${mix_hexes(opts.colors[i], mix_hexes(opts.colors[i], "#000000"))}`);
        if (!opts.useFlatColors) {
            tBox.background.setAttribute('filter', `url(#big-blur)`);
        }

    }

    for (let i = 0; i < context.bodies.length; i++) {

        let styleStr = 'stroke-width:1;';
        styleStr += `fill:none;`;
        styleStr += `stroke:${mix_hexes(opts.colors[i], "#000000")};`;

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        poly.setAttribute('x', context.bodies[i].x.toString());
        poly.setAttribute('y', context.bodies[i].y.toString());
        poly.setAttribute('width', context.bodies[i].width.toString());
        poly.setAttribute('height', context.bodies[i].height.toString());
        poly.setAttribute('style', styleStr);
        svg.appendChild(poly);

        svgutils.embedContent({
            x: context.bodies[i].x + 0.5 * padding,
            y: context.bodies[i].y + 0.5 * padding,
            width: context.bodies[i].width,
            height: context.bodies[i].height,
            svg: svg,
            content: {...context.bodies[i].body},
            contextId: `pyramidContext-${i}`
        });
    }

}