import * as utils from './foundation-utils';
import { mix_hexes_naive as mix_hexes } from './color-mixer';

export function generateContext(data, opts) {

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
    
    let remainingPaths = opts.numLevels;

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

        let myPathGutter = remainingPaths * (pathGutter / opts.numLevels);
        remainingPaths -= rowMeta.columns[r];

        let pathVerticalGutter = (r == rowMeta.width.length ? 0 : pathChannelWidth * wrappingPaths + padding);
        
        let contextWidth = (opts.width - padding - objectSpace - pathVerticalGutter) / rowMeta.width[r];

        if (r > 0) {
            titleTopLeft[1] += (padding + myPathGutter + titleHeight + bodyHeight);
            titleBottomLeft[1] += (padding + myPathGutter + titleHeight + bodyHeight);
            bodyBottomLeft[1] += (padding + myPathGutter + titleHeight + bodyHeight);
        }

        for (let i = opts.numLevels - 1; i >= 0; i--) {

            if ((data[i].row ?? 1) != (r + 1)) {
                continue;
            }

            let myWidth = contextWidth * (data[i].contextWidth ?? 1) - padding;

            let titleTopRight = [titleTopLeft[0] + myWidth, titleTopLeft[1]];
            let titleBottomRight = [titleBottomLeft[0] + myWidth, titleBottomLeft[1]];
            let bodyBottomRight = [bodyBottomLeft[0] + myWidth, bodyBottomLeft[1]];

            titles.push({
                text: opts.labels[i],
                cx: titleTopLeft[0] + 0.5 * (titleTopRight[0] - titleTopLeft[0]),
                cy: titleTopLeft[1] + 0.5 * (titleBottomLeft[1] - titleTopLeft[1]),
                x: titleTopLeft[0],
                y: titleTopLeft[1],
                width: (titleTopRight[0] - titleTopLeft[0]),
                height: (titleBottomLeft[1] - titleTopLeft[1]),
                row: (data[i].row ?? 1)
            });

            bodies.push({
                body: {
                    file: data[i].contextFile,
                    html: '<p>There is nothing to do here yet. Just move along people.</p>'
                },
                cx: titleBottomLeft[0] + 0.5 * (titleBottomRight[0] - titleBottomLeft[0]),
                cy: titleBottomLeft[1] + 0.5 * (bodyBottomLeft[1] - titleBottomLeft[1]),
                x: titleBottomLeft[0],
                y: titleBottomLeft[1],
                width: (titleBottomRight[0] - titleBottomLeft[0]),
                height: (bodyBottomLeft[1] - titleBottomLeft[1]),
                box: [[...titleBottomLeft], [...titleBottomRight], [...bodyBottomRight], [...bodyBottomLeft]]
            });


            titleTopLeft[0] = titleTopRight[0] + padding;
            titleBottomLeft[0] = titleBottomRight[0] + padding;
            bodyBottomLeft[0] = bodyBottomRight[0] + padding;
        }
    }

    return { titles: titles, bodies: bodies };
}

export function renderContext(context, opts) {

    let svg = utils.getSVG(opts);
    let padding = utils.getPadding(opts);

    for (let i = 0; i < context.titles.length; i++) {

        let pathStr = `M${context.titles[i].x},${context.titles[i].y + context.titles[i].height} `;
        pathStr += `v-${context.titles[i].height - padding} `;
        pathStr += utils.getTopLeftRoundedCorner(padding);
        pathStr += `h${context.titles[i].width - 2 * padding} `;
        pathStr += utils.getTopRightRoundedCorner(padding);
        pathStr += `v${context.titles[i].height - padding} `;
        pathStr += `h-${context.titles[i].width}`;

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

        let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.setAttribute('x', context.titles[i].cx);
        text.setAttribute('y', context.titles[i].cy);
        text.setAttribute('style', opts.labelStyle);

        var textNode = document.createTextNode(context.titles[i].text);
        text.appendChild(textNode);

        svg.appendChild(text);

        SVGRect = text.getBBox();
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

    for (let i = 0; i < context.bodies.length; i++) {

        let styleStr = 'stroke-width:1;';
        styleStr += `fill:none;`;
        styleStr += `stroke:${mix_hexes(opts.colors[i], "#000000")};`;

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        poly.setAttribute('x', context.bodies[i].x);
        poly.setAttribute('y', context.bodies[i].y);
        poly.setAttribute('width', context.bodies[i].width);
        poly.setAttribute('height', context.bodies[i].height);
        poly.setAttribute('style', styleStr);
        svg.appendChild(poly);

        let fx = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        fx.setAttribute('x', context.bodies[i].x + 0.5 * padding);
        fx.setAttribute('y', context.bodies[i].y + 0.5 * padding);
        fx.setAttribute('width', context.bodies[i].width - padding);
        fx.setAttribute('height', context.bodies[i].height - padding);

        if (context.bodies[i].body.file) {
            fetch(context.bodies[i].body.file)
                .then((response) => {return response.text()})
                .then((html) => {
                    fx.innerHTML = html;
                    svg.appendChild(fx);
                });
        } else {
            fx.innerHTML = context.bodies[i].body.html;
            svg.appendChild(fx);
        }
    }

}
