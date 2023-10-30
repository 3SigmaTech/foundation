(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foundation = {}));
})(this, (function (exports) { 'use strict';

    function getSVG(opts) {
        let svg = document.querySelector(opts.container);
        if (svg == null || svg == undefined) {
            console.error('Container does not exist');
        }
        return svg;
    }

    function getPadding(opts) {
        return opts.padding;
    }

    function getBannerHeight(opts) {
        return opts.bannerHeight;
    }

    function getPyramidHeight(opts) {
        if (opts.pyramidHeight >= opts.height) {
            return opts.height - 2 * getPadding(opts);
        }
        return opts.pyramidHeight;
    }

    function getPyramidWidth(opts) {
        return opts.pyramidWidth;
    }

    function getPathGutter(opts) {
        return getPyramidHeight(opts) / opts.numLevels;
    }

    function getPathWidth(opts) {
        //return 3;
        return Math.min(10, (opts.useFlatColors ? 0.8 : 0.5) * getPathGutter(opts) / opts.numLevels - 2);
    }

    function getPathChannel(opts) {
        return (getPathGutter(opts) / (opts.numLevels + 1));
    }
    function getTopLeftRoundedCorner(radius, counterclockwise = true) {
        if (counterclockwise) {
            return `q0,-${radius} ${radius},-${radius}`;
        } else {
            return `q-${radius},0 -${radius},${radius}`;
        }
    }
    function getTopRightRoundedCorner(radius, counterclockwise = true) {
        if (counterclockwise) {
            return `q${radius},0 ${radius},${radius}`;
        } else {
            return `q0,-${radius} -${radius},-${radius}`;
        }
    }

    function mix_hexes_naive(...hexes) {
      const rgbs = hexes.map(hex => hex2dec(hex));
      const rgb = rgbs.reduce((acc, cur) => {
        cur.forEach((e, i) => acc[i] = acc[i] ? acc[i] + e : e);
        return acc;
      }, []).map(e => e / rgbs.length);
      const mixture = rgb2hex(...rgb);
      return mixture;
    }

    function hex2dec(hex) {
      return hex.replace('#', '').match(/.{2}/g).map(n => parseInt(n, 16));
    }

    function rgb2hex(r, g, b) {
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);
      r = Math.min(r, 255);
      g = Math.min(g, 255);
      b = Math.min(b, 255);
      return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
    }

    function generatePyramid(data, opts) {

        let padding = getPadding(opts);
        let pH = getPyramidHeight(opts);
        let pW = getPyramidWidth(opts);
        let bannerHeight = getBannerHeight(opts);

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


    function renderPyramid(pyramid, opts) {

        let svg = getSVG(opts);

        for (let i = 0; i < pyramid.levels.length; i++) {
            let pointStr = '';
            for (let pt of pyramid.levels[i]) {
                pointStr += ` ${pt[0]},${pt[1]}`;
            }

            let styleStr = 'stroke-width:1;';
            styleStr += `fill:${opts.colors[i]};`;
            styleStr += `stroke:${mix_hexes_naive(opts.colors[i], "#000000")};`;

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
            let padding = getPadding(opts);
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", SVGRect.x - padding);
            rect.setAttribute("y", SVGRect.y - padding);
            rect.setAttribute("rx", padding);
            rect.setAttribute("ry", padding);
            rect.setAttribute("width", SVGRect.width + 2 * padding);
            rect.setAttribute("height", SVGRect.height + 2 * padding);
            rect.setAttribute("fill", `${mix_hexes_naive(opts.colors[i], mix_hexes_naive(opts.colors[i], "#000000"))}`);
            if (!opts.useFlatColors) {
                rect.setAttribute('filter', `url(#big-blur)`);
            }
            svg.insertBefore(rect, text);
        }
    }

    function generateContext(data, opts) {

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
        
        let padding = getPadding(opts);
        let pyramidWidth = getPyramidWidth(opts);
        let pyramidHeight = getPyramidHeight(opts);
        let pathGutter = getPathGutter(opts);
        let pathChannelWidth = getPathChannel(opts);
        let bannerHeight = getBannerHeight(opts);

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

    function renderContext(context, opts) {

        let svg = getSVG(opts);
        let padding = getPadding(opts);

        for (let i = 0; i < context.titles.length; i++) {

            let pathStr = `M${context.titles[i].x},${context.titles[i].y + context.titles[i].height} `;
            pathStr += `v-${context.titles[i].height - padding} `;
            pathStr += getTopLeftRoundedCorner(padding);
            pathStr += `h${context.titles[i].width - 2 * padding} `;
            pathStr += getTopRightRoundedCorner(padding);
            pathStr += `v${context.titles[i].height - padding} `;
            pathStr += `h-${context.titles[i].width}`;

            let styleStr = 'stroke-width:1;';
            styleStr += `fill:${opts.colors[i]};`;
            styleStr += `stroke:${mix_hexes_naive(opts.colors[i], "#000000")};`;

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
            rect.setAttribute("fill", `${mix_hexes_naive(opts.colors[i], mix_hexes_naive(opts.colors[i], "#000000"))}`);
            if (!opts.useFlatColors) {
                rect.setAttribute('filter', `url(#big-blur)`);
            }
            svg.insertBefore(rect, text);
        }

        for (let i = 0; i < context.bodies.length; i++) {

            let styleStr = 'stroke-width:1;';
            styleStr += `fill:none;`;
            styleStr += `stroke:${mix_hexes_naive(opts.colors[i], "#000000")};`;

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

    function generatePaths(pyramid, context, opts) {

        let padding = getPadding(opts);
        let pathGutter = getPathGutter(opts);
        let channel = getPathChannel(opts);
        let bannerHeight = getBannerHeight(opts);

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

    function renderPaths(paths, opts) {

        let svg = getSVG(opts);

        for (let i = 0; i < paths.length; i++) {
            let pointStr = '';
            for (let pt of paths[i]) {
                pointStr += ` ${pt[0]},${pt[1]}`;
            }


            let width = getPathWidth(opts);
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

    function renderFilters(opts, defelement) {

        for (let i = 0; i < opts.colors.length; i++) {
            
            let innerGlow = _createInnerGlow(i, opts.colors[i]);
            defelement.appendChild(innerGlow);

            let faintOuterGlow = _createFaintOuterGlow(i, opts.colors[i]);
            defelement.appendChild(faintOuterGlow);

            let outerGlow = _createOuterGlow(i, opts.colors[i]);
            defelement.appendChild(outerGlow);
        }

        _appendOneOffs(opts, defelement);
    }


    function _createInnerGlow(index, color) {

        let innerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        innerGlow.setAttribute('id', `inner-glow-${index}`);

        let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
        filter.setAttribute('flood-color', mix_hexes_naive('#ffffff', color));
        innerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
        filter.setAttribute('operator', 'out');
        filter.setAttribute('in2', 'SourceGraphic');
        innerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
        filter.setAttribute('stdDeviation', '10');
        filter.setAttribute('in2', 'SourceGraphic');
        innerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
        filter.setAttribute('operator', 'atop');
        filter.setAttribute('in2', 'SourceGraphic');
        innerGlow.appendChild(filter);

        return innerGlow;
    }

    function _createFaintOuterGlow(index, color) {

        let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        outerGlow.setAttribute('id', `faint-outer-glow-${index}`);

        let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
        filter.setAttribute('operator', "dilate");
        filter.setAttribute('radius', "1");
        filter.setAttribute('in', "SourceAlpha");
        filter.setAttribute('result', "thicken");
        outerGlow.appendChild(filter);
        
        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
        filter.setAttribute('in', 'thicken');
        filter.setAttribute('stdDeviation', '3');
        filter.setAttribute('result', 'blurred');
        outerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
        filter.setAttribute('flood-color', mix_hexes_naive('#ffffff', color));
        filter.setAttribute('result', 'glowcolor');
        outerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
        filter.setAttribute('in', 'glowcolor');
        filter.setAttribute('in2', 'blurred');
        filter.setAttribute('operator', 'in');
        filter.setAttribute('result', 'colored_glow');
        outerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');

        let subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
        subfilter.setAttribute('in', 'colored_glow');
        filter.appendChild(subfilter);

        subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
        subfilter.setAttribute('in', 'SourceGraphic');
        filter.appendChild(subfilter);

        outerGlow.appendChild(filter);

        return outerGlow;
    }

    function _createOuterGlow(index, color) {

        let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        outerGlow.setAttribute('id', `outer-glow-${index}`);

        let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
        filter.setAttribute('operator', "dilate");
        filter.setAttribute('radius', "1");
        filter.setAttribute('in', "SourceAlpha");
        filter.setAttribute('result', "thicken");
        outerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
        filter.setAttribute('in', 'thicken');
        filter.setAttribute('stdDeviation', '3');
        filter.setAttribute('result', 'blurred');
        outerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
        filter.setAttribute('flood-color', color);
        filter.setAttribute('result', 'glowcolor');
        outerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
        filter.setAttribute('in', 'glowcolor');
        filter.setAttribute('in2', 'blurred');
        filter.setAttribute('operator', 'in');
        filter.setAttribute('result', 'colored_glow');
        outerGlow.appendChild(filter);

        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');

        let subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
        subfilter.setAttribute('in', 'colored_glow');
        filter.appendChild(subfilter);

        subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
        subfilter.setAttribute('in', 'SourceGraphic');
        filter.appendChild(subfilter);

        outerGlow.appendChild(filter);

        return outerGlow;
    }

    function _appendOneOffs(opts, defelement) {


        let blur = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        blur.setAttribute('id', `big-blur`);
        blur.setAttribute('x', `-75%`);
        blur.setAttribute('y', `-75%`);
        blur.setAttribute('width', `250%`);
        blur.setAttribute('height', `250%`);
        let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
        filter.setAttribute('in', 'SourceGraphic');
        filter.setAttribute('stdDeviation', `8`);
        blur.appendChild(filter);
        defelement.appendChild(blur);

        blur = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        blur.setAttribute('id', `blur`);
        blur.setAttribute('x', `-25%`);
        blur.setAttribute('y', `-25%`);
        blur.setAttribute('width', `150%`);
        blur.setAttribute('height', `150%`);
        filter = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
        filter.setAttribute('in', 'SourceGraphic');
        filter.setAttribute('stdDeviation', `3`);
        blur.appendChild(filter);

        defelement.appendChild(blur);
    }

    function renderBanner(opts) {

        let svg = getSVG(opts);

        _renderTitle(opts, svg);
        _renderLeftBox(opts, svg);
        _renderRightBox(opts, svg);
    }

    function _renderTitle(opts, svg) {

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        poly.setAttribute('x', 0);
        poly.setAttribute('y', 0);
        poly.setAttribute('width', opts.width);
        poly.setAttribute('height', opts.bannerHeight);
        poly.setAttribute('style', opts.title.style);
        svg.appendChild(poly);

        if (opts.title == null) {
            return;
        }

        let stretch = 2;
        let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        text.setAttribute('x', opts.width / 2 / stretch);
        text.setAttribute('y', opts.bannerHeight / 2);
        text.setAttribute('transform', `scale(${stretch},1)`);
        text.setAttribute('letter-spacing', -2.5 * stretch); // Set to 1.5 for Nunito
        text.setAttribute('style', opts.title.labelStyle);

        var textNode = document.createTextNode(opts.title.text);
        text.appendChild(textNode);

        svg.appendChild(text);

        return poly;
    }

    function _renderLeftBox(opts, svg, banner) {

        if (opts.leftContext == null) {
            return;
        }

        let fx = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        fx.setAttribute('x', 0);
        fx.setAttribute('y', 0);
        fx.setAttribute('width', opts.leftContext.width);
        fx.setAttribute('height', opts.bannerHeight);

        if (opts.leftContext.contextFile) {
            fetch(opts.leftContext.contextFile)
                .then((response) => { return response.text() })
                .then((html) => {
                    fx.innerHTML = html;
                    svg.appendChild(fx);
                });
        } else if (opts.leftContext.svgFile) {
            fetch(opts.leftContext.svgFile)
                .then((response) => { return response.text() })
                .then((data) => {
                    svg.insertAdjacentHTML('beforeend', '<g id="leftContextGroup">' + data + '</g>');
                    let lcg = svg.getElementById('leftContextGroup');
                    let lcgBB = lcg.getBBox();
                    let vOffset = (opts.bannerHeight - lcgBB.height) / 2;
                    lcg.setAttribute('transform', `translate(${opts.padding} ${vOffset})`);
                });
        } else if (opts.leftContext.html) {
            fx.innerHTML = opts.leftContext.html;
            svg.appendChild(fx);
        } else if (opts.leftContext.svg) {
            svg.insertAdjacentHTML('beforeend', opts.leftContext.svg);
        }

    }


    function _renderRightBox(opts, svg, banner) {

        if (opts.rightContext == null) {
            return;
        }

        let fx = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
        fx.setAttribute('x', opts.width - opts.rightContext.width);
        fx.setAttribute('y', 0);
        fx.setAttribute('width', opts.rightContext.width);
        fx.setAttribute('height', opts.bannerHeight);

        if (opts.rightContext.contextFile) {
            fetch(opts.rightContext.contextFile)
                .then((response) => { return response.text() })
                .then((html) => {
                    fx.innerHTML = html;
                    svg.appendChild(fx);
                });
        } else if (opts.rightContext.svgFile) {
            fetch(opts.rightContext.svgFile)
                .then((response) => { return response.text() })
                .then((data) => {
                    svg.insertAdjacentHTML('beforeend', '<g id="rightContextGroup">' + data + '</g>');
                    let lcg = svg.getElementById('rightContextGroup');
                    let lcgBB = lcg.getBBox();
                    let vOffset = (opts.bannerHeight - lcgBB.height) / 2;
                    lcg.setAttribute('transform', `translate(${-1 * opts.padding} ${vOffset})`);
                });
        } else if (opts.rightContext.html) {
            fx.innerHTML = opts.rightContext.html;
            svg.appendChild(fx);
        } else if (opts.rightContext.svg) {
            svg.insertAdjacentHTML('beforeend', opts.rightontext.svg);
        }
    }

    function render(data, opts) {
      return _render(data, opts);
    }

    var DATA = [];
    var OPTIONS = {};

    function _defaultOpts() {
        return {
            container: null,
            title: null,
            leftContext: null,
            rightContext: null,
            showBanner: true,
            width: 2245, // 594mm --> A2 Paper Size
            height: 1587, // 420mm
            pyramidWidth: 450,
            pyramidHeight: 500,
            bannerHeight: 90, 
            padding: 5,
            tooltip: true,
            tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /*  */,
            click: true,
            clickCallbackRenderer: _defaultClickCallbackRenderer /*  */,
            hover: true,
            hoverCallbackRenderer: _defaultHoverCallbackRenderer /*  */,
            showLabels: true,
            labelStyle: "fill:#ffffff;stroke:#000000;stroke-width:0.25px;",
            labels: [], // ["A", "B", "C", "D", "E", "F", "G"] - left empty for implementation reasons, but computed as commented
            colors: ["#f032e6", "#42d4f4", "#00cc00", "#f58231", "#4363d8", "#e6194B", "#009933", "#6600ff"],
            useFlatColors: false
        };
    }

    function _render(data, opts) {
        if (opts !== undefined) {
            OPTIONS = {...opts};
        }
        _applyDefaultOptions(OPTIONS);

        let dErrMsg = _validateData(data);
        if (dErrMsg) { console.error(dErrMsg); return; }

        OPTIONS.numLevels = DATA.length;
        
        let oErrMsg = _validateOptions(OPTIONS);
        if (oErrMsg) { console.error(oErrMsg); return; }
        
        let PYRAMID = generatePyramid(DATA, OPTIONS);
        let CONTEXT = generateContext(DATA, OPTIONS);
        let PATHS = generatePaths(PYRAMID, CONTEXT, OPTIONS);


        let svg = getSVG(OPTIONS);

        svg.setAttribute('width', OPTIONS.width);
        svg.setAttribute('height', OPTIONS.height);

        _renderDefs(OPTIONS);

        if (OPTIONS.showBanner) {
            renderBanner(OPTIONS);
        }

        // Render before pyramid for clean interface with pyramid's side
        if (PATHS) {
            renderPaths(PATHS, OPTIONS);
        }

        if (PYRAMID) {
            renderPyramid(PYRAMID, OPTIONS);
        }

        if (CONTEXT) {
            renderContext(CONTEXT, OPTIONS);
        }

    }

    function _applyDefaultOptions(opts) {
        let defaultOpts = _defaultOpts();
        for (let prop of Object.keys(defaultOpts)) {
            if (!opts.hasOwnProperty(prop)) {
                opts[prop] = defaultOpts[prop];
            }
        }
    }

    function _validateData(data) {
        if (data === null) {
            return "Data cannot be null.";
        }
        if (Array.isArray(data)) {
            DATA = [...data];
            while (OPTIONS.labels.length < DATA.length) {
                if (DATA[OPTIONS.labels.length].label !== undefined) {
                    OPTIONS.labels.push(DATA[OPTIONS.labels.length].label);
                } else {
                    OPTIONS.labels.push(String.fromCharCode(65 + OPTIONS.labels.length));
                }
            }
        }
        if (typeof data === 'object') {
            DATA = [];
            for (let prop of Object.keys(data)) {
                //if (Array.isArray(data[prop])) {
                    DATA.push(data[prop]);
                    if (OPTIONS.labels.length < DATA.length) {
                        OPTIONS.labels.push(prop);
                    }
                //}
            }
        }

        return '';
    }

    function _validateOptions(opts) {
        if (opts.container == null) {
            return 'You must set a container SVG tag using opts.container';
        }
    }

    function _renderDefs(opts) {

        let svg = getSVG(opts);

        let defs = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
        svg.appendChild(defs);

        renderFilters(opts, defs);

    }



    function _defaultTooltipCallbackRenderer(evt, meta) {
    //     if (evt == "mouseover") {
    //         return () => {
    //             TOOLTIP
    //                 .style("left", (d3.event.pageX - 150) + "px")
    //                 .style("top", (d3.event.pageY - 150) + "px")
    //                 .style("display", "block")
    //                 .html(meta.label + ": <br>" + meta.array.join("<br>"));
    //         }
    //     } else if (evt == "mouseout") {
    //         return () => {
    //             TOOLTIP.style("display", "none");
    //         }
    //     } else if (evt == "mousemove") {
    //         return () => {
    //             TOOLTIP
    //                 .style("left", (d3.event.pageX - 150) + "px")
    //                 .style("top", (d3.event.pageY - 150) + "px");
    //         }
    //     }
    }

    function _defaultClickCallbackRenderer(meta) {
    //     return () => {
    //         console.log("Common list elements in "
    //             + meta.label.replaceAll('&#8745;', 'n') + ": "
    //             + meta.join(",")
    //         );
    //     }
    }

    function _defaultHoverCallbackRenderer(evt, meta) {
    //     if (evt == "mouseover") {
    //         return () => {
    //             let tgt = d3.select(d3.event.currentTarget);
    //             let origFill = tgt.style("fill-opacity");
    //             let origStroke = tgt.style("stroke-opacity");
    //             let origStrokeWidth = tgt.style("stroke-width");
    //             tgt.transition()
    //                 .attr("orig-fill-opacity", origFill)
    //                 .attr("orig-stroke-opacity", origStroke)
    //                 .attr("orig-stroke-width", origStrokeWidth)
    //                 .style("fill-opacity", 0.6)
    //                 .style("stroke-opacity", 1)
    //                 .style("stroke-width", 4);
    //         }
    //     } else if (evt == "mouseout") {
    //         return () => {
    //             let tgt = d3.select(d3.event.currentTarget);
    //             let origFill = tgt.attr("orig-fill-opacity");
    //             let origStroke = tgt.attr("orig-stroke-opacity");
    //             let origStrokeWidth = tgt.attr("orig-stroke-width");
    //             tgt
    //                 .attr("orig-fill-opacity", null)
    //                 .attr("orig-stroke-opacity", null)
    //                 .attr("orig-stroke-width", null)
    //                 .style("fill-opacity", origFill)
    //                 .style("stroke-opacity", origStroke)
    //                 .style("stroke-width", origStrokeWidth);
    //         }
    //     }
    }

    exports.render = render;

}));
