(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foundation = {}));
})(this, (function (exports) { 'use strict';

    function getSVG(opts) {
      let svg = document.querySelector(opts.container);
      if (svg == null || svg == undefined) {
        console.error('Container does not exist; creating one');
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        document.appendChild(svg);
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
      return getPyramidHeight(opts) / opts.pyramidLevels;
    }
    function getPathWidth(opts) {
      return Math.min(10, (opts.useFlatColors ? 0.8 : 0.5) * getPathGutter(opts) / opts.pyramidLevels - 2);
    }
    function getPathChannel(opts) {
      return getPathGutter(opts) / (opts.pyramidLevels + 1);
    }

    function mix_hexes_naive() {
      for (var _len = arguments.length, hexes = new Array(_len), _key = 0; _key < _len; _key++) {
        hexes[_key] = arguments[_key];
      }
      const rgbs = hexes.map(hex => hex2dec(hex));
      const rgb = rgbs.reduce((acc, cur) => {
        cur.forEach((e, i) => acc[i] = acc[i] ? acc[i] + e : e);
        return acc;
      }, []).map(e => e / rgbs.length);
      const mixture = rgb2hex(rgb[0], rgb[1], rgb[2]);
      return mixture;
    }
    function hex2dec(hex) {
      let breakdown = hex.replace('#', '').match(/.{2}/g);
      breakdown = breakdown == null ? ['0', '0', '0'] : breakdown;
      return breakdown.map(n => parseInt(n, 16));
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

    function embedContent(opts) {
      let fx = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
      fx.setAttribute('x', opts.x.toString());
      fx.setAttribute('y', opts.y.toString());
      fx.setAttribute('width', opts.width.toString());
      fx.setAttribute('height', opts.height.toString());
      fx.setAttribute('id', opts.contextId);
      if (!opts.content) {
        return;
      }
      if (opts.content.htmlFile) {
        fetch(opts.content.htmlFile).then(response => {
          return response.text();
        }).then(html => {
          fx.innerHTML = html;
          opts.svg.appendChild(fx);
        });
      } else if (opts.content.svgFile) {
        fetch(opts.content.svgFile).then(response => {
          return response.text();
        }).then(data => {
          opts.svg.insertAdjacentHTML('beforeend', `<g id="${opts.contextId}">${data}</g>`);
          setTimeout(() => {
            let lcg = opts.svg.getElementById(opts.contextId);
            let lcgBB = lcg.getBBox();
            let vOffset = (opts.height - lcgBB.height) / 2;
            let hOffset = (opts.width - lcgBB.width) / 2;
            lcg.setAttribute('transform', `translate(${hOffset} ${vOffset})`);
          }, 500);
        });
      } else if (opts.content.html) {
        fx.innerHTML = opts.content.html;
        opts.svg.appendChild(fx);
      } else if (opts.content.svg) {
        opts.svg.insertAdjacentHTML('beforeend', opts.content.svg);
      }
    }
    function roundedRectPath(opts) {
      let pathStr = `M${opts.x},${opts.y + opts.radii[0]} `;
      pathStr += getTopLeftRoundedNinety(opts.radii[0]);
      pathStr += `h${opts.width - opts.radii[0] - opts.radii[1]} `;
      pathStr += getTopRightRoundedNinety(opts.radii[1]);
      pathStr += `v${opts.height - opts.radii[1] - opts.radii[2]} `;
      pathStr += getBottomRightRoundedNinety(opts.radii[2]);
      pathStr += `h-${opts.width - opts.radii[2] - opts.radii[3]} `;
      pathStr += getBottomLeftRoundedNinety(opts.radii[3]);
      pathStr += `v-${opts.height - opts.radii[3] - opts.radii[0]} `;
      return pathStr;
    }
    function getTopLeftRoundedNinety(radius) {
      let clockwise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (clockwise) {
        return `q0,-${radius} ${radius},-${radius}`;
      } else {
        return `q-${radius},0 -${radius},${radius}`;
      }
    }
    function getTopRightRoundedNinety(radius) {
      let clockwise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (clockwise) {
        return `q${radius},0 ${radius},${radius}`;
      } else {
        return `q0,-${radius} -${radius},-${radius}`;
      }
    }
    function getBottomLeftRoundedNinety(radius) {
      let clockwise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (clockwise) {
        return `q-${radius},0 -${radius},-${radius}`;
      } else {
        return `q0,${radius} ${radius},${radius}`;
      }
    }
    function getBottomRightRoundedNinety(radius) {
      let clockwise = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      if (clockwise) {
        return `q0,${radius} -${radius},${radius}`;
      } else {
        return `q${radius},0 ${radius},-${radius}`;
      }
    }
    function drawContainedText(opts) {
      let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      text.setAttribute('x', opts.x.toString());
      text.setAttribute('y', opts.y.toString());
      text.setAttribute('style', opts.textStyle);
      var textNode = document.createTextNode(opts.text);
      text.appendChild(textNode);
      opts.svg.appendChild(text);
      let textRect = text.getBBox();
      let padding = opts.padding;
      let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", (textRect.x - padding).toString());
      rect.setAttribute("y", (textRect.y - padding).toString());
      rect.setAttribute("rx", padding.toString());
      rect.setAttribute("ry", padding.toString());
      rect.setAttribute("width", (textRect.width + 2 * padding).toString());
      rect.setAttribute("height", (textRect.height + 2 * padding).toString());
      opts.svg.insertBefore(rect, text);
      return {
        label: text,
        background: rect
      };
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
      for (let i = opts.pyramidLevels - 1; i >= 0; i--) {
        let nextL = [lastL[0] + 0.5 * pW / opts.pyramidLevels, lastL[1] - pH / opts.pyramidLevels];
        let nextR = [lastR[0] - 0.5 * pW / opts.pyramidLevels, lastR[1] - pH / opts.pyramidLevels];
        levels.push([lastL, lastR, nextR, nextL]);
        labels.push({
          text: data[i].label ?? '',
          x: p0[0],
          y: lastL[1] - 0.5 * (lastL[1] - nextL[1])
        });
        lastL = nextL;
        lastR = nextR;
      }
      return {
        levels: levels,
        labels: labels
      };
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
        let tBox = drawContainedText({
          svg: svg,
          text: pyramid.labels[i].text,
          x: pyramid.labels[i].x,
          y: pyramid.labels[i].y,
          textStyle: opts.labelStyle,
          padding: getPadding(opts)
        });
        tBox.background.setAttribute("fill", `${mix_hexes_naive(opts.colors[i], mix_hexes_naive(opts.colors[i], "#000000"))}`);
        if (!opts.useFlatColors) {
          tBox.background.setAttribute('filter', `url(#big-blur)`);
        }
      }
    }

    function generateContext(data, opts) {
      let rowMeta = {
        width: [0],
        columns: [0]
      };
      for (let i = 0; i < data.length; i++) {
        let colWidth = data[i].contextWidth ?? 1;
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
      let remainingPaths = opts.pyramidLevels;
      let titleTopLeft = [0, bannerHeight + padding + pathGutter];
      let titleBottomLeft = [0, bannerHeight + padding + pathGutter + titleHeight];
      let bodyBottomLeft = [0, bannerHeight + padding + pathGutter + titleHeight + bodyHeight];
      for (let r = 0; r < rowMeta.width.length; r++) {
        let objectSpace = r > 0 ? 0 : pyramidWidth + padding;
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
        let pathVerticalGutter = r == rowMeta.width.length ? 0 : pathChannelWidth * wrappingPaths + padding;
        let contextWidth = (opts.width - padding - objectSpace - pathVerticalGutter) / rowMeta.width[r];
        if (r > 0) {
          titleTopLeft[1] += padding + myPathGutter + titleHeight + bodyHeight;
          titleBottomLeft[1] += padding + myPathGutter + titleHeight + bodyHeight;
          bodyBottomLeft[1] += padding + myPathGutter + titleHeight + bodyHeight;
        }
        for (let i = opts.pyramidLevels - 1; i >= 0; i--) {
          if ((data[i].row ?? 1) != r + 1) {
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
            width: titleTopRight[0] - titleTopLeft[0],
            height: titleBottomLeft[1] - titleTopLeft[1],
            row: data[i].row ?? 1
          });
          bodies.push({
            body: {
              ...data[i].content
            },
            cx: titleBottomLeft[0] + 0.5 * (titleBottomRight[0] - titleBottomLeft[0]),
            cy: titleBottomLeft[1] + 0.5 * (bodyBottomLeft[1] - titleBottomLeft[1]),
            x: titleBottomLeft[0],
            y: titleBottomLeft[1],
            width: titleBottomRight[0] - titleBottomLeft[0],
            height: bodyBottomLeft[1] - titleBottomLeft[1],
            row: data[i].row ?? 1
          });
          titleTopLeft[0] = titleTopRight[0] + padding;
          titleBottomLeft[0] = titleBottomRight[0] + padding;
          bodyBottomLeft[0] = bodyBottomRight[0] + padding;
        }
      }
      return {
        titles: titles,
        bodies: bodies
      };
    }
    function renderContext(context, opts) {
      let svg = getSVG(opts);
      let padding = getPadding(opts);
      for (let i = 0; i < context.titles.length; i++) {
        let pathStr = roundedRectPath({
          x: context.titles[i].x,
          y: context.titles[i].y,
          width: context.titles[i].width,
          height: context.titles[i].height,
          radii: [padding, padding, 0, 0]
        });
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
        let tBox = drawContainedText({
          svg: svg,
          text: context.titles[i].text,
          x: context.titles[i].cx,
          y: context.titles[i].cy,
          textStyle: opts.labelStyle,
          padding: getPadding(opts)
        });
        tBox.background.setAttribute("fill", `${mix_hexes_naive(opts.colors[i], mix_hexes_naive(opts.colors[i], "#000000"))}`);
        if (!opts.useFlatColors) {
          tBox.background.setAttribute('filter', `url(#big-blur)`);
        }
      }
      for (let i = 0; i < context.bodies.length; i++) {
        let styleStr = 'stroke-width:1;';
        styleStr += `fill:none;`;
        styleStr += `stroke:${mix_hexes_naive(opts.colors[i], "#000000")};`;
        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        poly.setAttribute('x', context.bodies[i].x.toString());
        poly.setAttribute('y', context.bodies[i].y.toString());
        poly.setAttribute('width', context.bodies[i].width.toString());
        poly.setAttribute('height', context.bodies[i].height.toString());
        poly.setAttribute('style', styleStr);
        svg.appendChild(poly);
        embedContent({
          x: context.bodies[i].x + 0.5 * padding,
          y: context.bodies[i].y + 0.5 * padding,
          width: context.bodies[i].width,
          height: context.bodies[i].height,
          svg: svg,
          content: {
            ...context.bodies[i].body
          },
          contextId: `pyramidContext-${i}`
        });
      }
    }

    function generatePaths(pyramid, context, opts) {
      let padding = getPadding(opts);
      let pathGutter = getPathGutter(opts);
      let channel = getPathChannel(opts);
      let bannerHeight = getBannerHeight(opts);
      let paths = [];
      for (let i = 0; i < opts.pyramidLevels; i++) {
        let row = context.titles[i].row - 1;
        let p0 = [pyramid.levels[i][1][0] - 0.5 * (pyramid.levels[i][1][0] - pyramid.levels[i][2][0]), pyramid.levels[i][1][1] - 0.1 * pathGutter];
        let p1 = [p0[0], bannerHeight + padding + (opts.pyramidLevels - i) * channel];
        let pEnd = [context.titles[i].x + 0.5 * context.titles[i].width, context.titles[i].y];
        if (row == 0) {
          let p2 = [pEnd[0], p1[1]];
          paths.push([[...p0], [...p1], [...p2], [...pEnd]]);
        } else {
          let p2 = [opts.width - padding - (opts.pyramidLevels - i) * channel, p1[1]];
          let p3 = [p2[0], context.titles[i].y - (opts.pyramidLevels - i) * channel];
          let p4 = [pEnd[0], p3[1]];
          paths.push([[...p0], [...p1], [...p2], [...p3], [...p4], [...pEnd]]);
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
      let feMorphology = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
      feMorphology.setAttribute('operator', "dilate");
      feMorphology.setAttribute('radius', "1");
      feMorphology.setAttribute('in', "SourceAlpha");
      feMorphology.setAttribute('result', "thicken");
      outerGlow.appendChild(feMorphology);
      let feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
      feGaussianBlur.setAttribute('in', 'thicken');
      feGaussianBlur.setAttribute('stdDeviation', '3');
      feGaussianBlur.setAttribute('result', 'blurred');
      outerGlow.appendChild(feGaussianBlur);
      let feFlood = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
      feFlood.setAttribute('flood-color', mix_hexes_naive('#ffffff', color));
      feFlood.setAttribute('result', 'glowcolor');
      outerGlow.appendChild(feFlood);
      let feComposite = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
      feComposite.setAttribute('in', 'glowcolor');
      feComposite.setAttribute('in2', 'blurred');
      feComposite.setAttribute('operator', 'in');
      feComposite.setAttribute('result', 'colored_glow');
      outerGlow.appendChild(feComposite);
      let feMerge = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');
      let feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
      feMergeNode.setAttribute('in', 'colored_glow');
      feMerge.appendChild(feMergeNode);
      feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
      feMergeNode.setAttribute('in', 'SourceGraphic');
      feMerge.appendChild(feMergeNode);
      outerGlow.appendChild(feMerge);
      return outerGlow;
    }
    function _createOuterGlow(index, color) {
      let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
      outerGlow.setAttribute('id', `outer-glow-${index}`);
      let feMorphology = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
      feMorphology.setAttribute('operator', "dilate");
      feMorphology.setAttribute('radius', "1");
      feMorphology.setAttribute('in', "SourceAlpha");
      feMorphology.setAttribute('result', "thicken");
      outerGlow.appendChild(feMorphology);
      let feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
      feGaussianBlur.setAttribute('in', 'thicken');
      feGaussianBlur.setAttribute('stdDeviation', '3');
      feGaussianBlur.setAttribute('result', 'blurred');
      outerGlow.appendChild(feGaussianBlur);
      let feFlood = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
      feFlood.setAttribute('flood-color', color);
      feFlood.setAttribute('result', 'glowcolor');
      outerGlow.appendChild(feFlood);
      let feComposite = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
      feComposite.setAttribute('in', 'glowcolor');
      feComposite.setAttribute('in2', 'blurred');
      feComposite.setAttribute('operator', 'in');
      feComposite.setAttribute('result', 'colored_glow');
      outerGlow.appendChild(feComposite);
      let feMerge = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');
      let feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
      feMergeNode.setAttribute('in', 'colored_glow');
      feMerge.appendChild(feMergeNode);
      feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
      feMergeNode.setAttribute('in', 'SourceGraphic');
      feMerge.appendChild(feMergeNode);
      outerGlow.appendChild(feMerge);
      return outerGlow;
    }
    function _appendOneOffs(_opts, defelement) {
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
      poly.setAttribute('x', '0');
      poly.setAttribute('y', '0');
      poly.setAttribute('width', opts.width.toString());
      poly.setAttribute('height', opts.bannerHeight.toString());
      if (opts.title?.style) {
        poly.setAttribute('style', opts.title?.style);
      }
      svg.appendChild(poly);
      if (opts.title == null) {
        return;
      }
      let stretch = 2;
      let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
      text.setAttribute('x', (opts.width / 2 / stretch).toString());
      text.setAttribute('y', (opts.bannerHeight / 2).toString());
      text.setAttribute('transform', `scale(${stretch},1)`);
      text.setAttribute('letter-spacing', (-2.5 * stretch).toString());
      if (opts.title?.labelStyle) {
        text.setAttribute('style', opts.title?.labelStyle);
      }
      if (opts.title?.text) {
        var textNode = document.createTextNode(opts.title?.text);
        text.appendChild(textNode);
      }
      svg.appendChild(text);
      return poly;
    }
    function _renderLeftBox(opts, svg) {
      if (opts.leftContext == null) {
        return;
      }
      embedContent({
        x: getPadding(opts),
        y: 0,
        width: opts.leftContext.width ?? 0,
        height: opts.bannerHeight,
        svg: svg,
        content: opts.leftContext.content,
        contextId: 'leftBannerContext'
      });
    }
    function _renderRightBox(opts, svg) {
      if (opts.rightContext == null) {
        return;
      }
      embedContent({
        x: opts.width - (opts.rightContext.width ?? 0) - getPadding(opts),
        y: 0,
        width: opts.rightContext.width ?? 0,
        height: opts.bannerHeight,
        svg: svg,
        content: opts.rightContext.content,
        contextId: 'rightBannerContext'
      });
    }

    function render(data, opts) {
      return _render(data, opts);
    }
    function _defaultOpts() {
      return {
        container: '',
        title: null,
        leftContext: null,
        rightContext: null,
        showBanner: true,
        width: 2245,
        height: 1587,
        pyramidWidth: 450,
        pyramidHeight: 500,
        bannerHeight: 90,
        padding: 5,
        pyramidLevels: 0,
        showLabels: true,
        labelStyle: "fill:#ffffff;stroke:#000000;stroke-width:0.25px;",
        colors: ["#f032e6", "#42d4f4", "#00cc00", "#f58231", "#4363d8", "#e6194B", "#009933", "#6600ff"],
        useFlatColors: false
      };
    }
    function _render(data, opts) {
      let privateOpts;
      if (opts !== undefined) {
        privateOpts = {
          ...opts
        };
      } else {
        privateOpts = _defaultOpts();
      }
      _applyDefaultOptions(privateOpts);
      let privateData = _validateData(data);
      if (privateData == null) {
        return;
      }
      privateOpts.pyramidLevels = privateData.pyramid.length;
      let oErrMsg = _validateOptions(privateOpts);
      if (oErrMsg) {
        console.error(oErrMsg);
        return;
      }
      let svg = getSVG(privateOpts);
      svg.setAttribute('width', privateOpts.width.toString());
      svg.setAttribute('height', privateOpts.height.toString());
      _renderDefs(privateOpts);
      if (privateOpts.showBanner) {
        renderBanner(privateOpts);
      }
      let pyramid = generatePyramid(privateData.pyramid, privateOpts);
      let context = generateContext(privateData.pyramid, privateOpts);
      let paths = generatePaths(pyramid, context, privateOpts);
      if (paths) {
        renderPaths(paths, privateOpts);
      }
      if (pyramid) {
        renderPyramid(pyramid, privateOpts);
      }
      if (context) {
        renderContext(context, privateOpts);
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
    function _validateData(data, _opts) {
      if (data === null) {
        console.error("Data cannot be null.");
        return null;
      }
      let privateData = {
        ...data
      };
      return privateData;
    }
    function _validateOptions(opts) {
      if (opts.container == null) {
        return 'You must set a container SVG tag using opts.container';
      }
      return null;
    }
    function _renderDefs(opts) {
      let svg = getSVG(opts);
      let defs = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
      svg.appendChild(defs);
      renderFilters(opts, defs);
    }

    exports.render = render;

}));
