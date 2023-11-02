var _SVG = null;
function getSVG(opts) {
  let svg;
  if (_SVG == null) {
    svg = document.querySelector(opts.container);
    if (svg == null || svg == undefined) {
      console.error('Container does not exist; creating one');
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      document.appendChild(svg);
    }
    _SVG = svg;
  } else {
    svg = _SVG;
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
  pathStr += `v-${opts.height - opts.radii[3] - opts.radii[0]} Z`;
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
  let shallow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!shallow) {
    if (clockwise) {
      return `q${radius},0 ${radius},${radius}`;
    } else {
      return `q0,-${radius} -${radius},-${radius}`;
    }
  } else {
    const m = 1;
    if (clockwise) {
      return `c ${m * radius},0 ${radius},${(1 - m) * radius} ${radius},${radius}`;
    } else {
      return `q0,-${radius} -${radius},-${radius}`;
    }
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
    styleStr += `fill:${opts.pyramidColors[i]};`;
    styleStr += `stroke:${mix_hexes_naive(opts.pyramidColors[i], "#000000")};`;
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
    let tBox = drawContainedText({
      svg: svg,
      text: pyramid.labels[i].text,
      x: pyramid.labels[i].x,
      y: pyramid.labels[i].y,
      textStyle: opts.labelStyle,
      padding: getPadding(opts)
    });
    tBox.background.setAttribute("fill", `${mix_hexes_naive(opts.pyramidColors[i], mix_hexes_naive(opts.pyramidColors[i], "#000000"))}`);
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
  let titleHeight = Math.min(pathGutter, opts.maxTitleHeight);
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
    let pathVerticalGutter = r == rowMeta.width.length ? 0 : pathChannelWidth * wrappingPaths;
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
    styleStr += `fill:${opts.pyramidColors[i]};`;
    styleStr += `stroke:${mix_hexes_naive(opts.pyramidColors[i], "#000000")};`;
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', pathStr);
    path.setAttribute('style', styleStr);
    if (!opts.useFlatColors) {
      path.setAttribute('filter', `url(#inner-glow-pyramid-${i})`);
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
    tBox.background.setAttribute("fill", `${mix_hexes_naive(opts.pyramidColors[i], mix_hexes_naive(opts.pyramidColors[i], "#000000"))}`);
    if (!opts.useFlatColors) {
      tBox.background.setAttribute('filter', `url(#big-blur)`);
    }
  }
  for (let i = 0; i < context.bodies.length; i++) {
    let styleStr = 'stroke-width:1;';
    styleStr += `fill:none;`;
    styleStr += `stroke:${mix_hexes_naive(opts.pyramidColors[i], "#000000")};`;
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
      let p2 = [opts.width - (opts.pyramidLevels - i) * channel, p1[1]];
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
    styleStr += `stroke:${opts.pyramidColors[i]};`;
    let poly = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
    poly.setAttribute('points', pointStr.trim());
    poly.setAttribute('style', styleStr);
    if (!opts.useFlatColors) {
      poly.setAttribute('filter', `url(#faint-outer-glow-pyramid-${i})`);
    }
    svg.appendChild(poly);
  }
}

function renderFilters(opts, defelement) {
  for (let i = 0; i < opts.pyramidColors.length; i++) {
    let innerGlow = _createInnerGlow(i, mix_hexes_naive('#ffffff', opts.pyramidColors[i]), 'pyramid');
    defelement.appendChild(innerGlow);
    let faintOuterGlow = _createFaintOuterGlow(i, mix_hexes_naive('#ffffff', opts.pyramidColors[i]), 'pyramid');
    defelement.appendChild(faintOuterGlow);
  }
  for (let i = 0; i < opts.racewayColors.length; i++) {
    let innerGlow = _createInnerGlow(i, mix_hexes_naive('#ffffff', opts.racewayColors[i]), 'raceway');
    defelement.appendChild(innerGlow);
    let faintOuterGlow = _createFaintOuterGlow(i, mix_hexes_naive('#ffffff', opts.racewayColors[i]), 'raceway');
    defelement.appendChild(faintOuterGlow);
  }
  _appendOneOffs(opts, defelement);
}
function _createInnerGlow(index, color, collection) {
  let innerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
  innerGlow.setAttribute('id', `inner-glow-${collection}-${index}`);
  let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
  filter.setAttribute('flood-color', color);
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
function _createFaintOuterGlow(index, color, collection) {
  let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
  outerGlow.setAttribute('id', `faint-outer-glow-${collection}-${index}`);
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

function generateRaceway(data, opts, x0, y0) {
  let padding = getPadding(opts);
  let lastChevronOffset = -1 * (opts.racewayTitleHeight / 2 - opts.racewayChevronDepth);
  let widthUnits = 0;
  for (let i = 0; i < opts.racewayLevels; i++) {
    widthUnits += data[i].contextWidth ?? 1;
  }
  let racewayHeight = opts.racewayTitleHeight;
  let racewayWidth = opts.width - 2 * padding - 2 * racewayHeight;
  let sectionWidth = racewayWidth / widthUnits;
  let sectionHeight = opts.height - y0 - 2 * racewayHeight - padding;
  let miterOffset = 0.5 / Math.sin(Math.atan(racewayHeight / (2 * opts.racewayChevronDepth)));
  let sections = [];
  let pt = [x0 + racewayHeight, y0];
  for (let i = 0; i < opts.racewayLevels; i++) {
    let myWidth = sectionWidth * (data[i].contextWidth ?? 1);
    let pts = [];
    pts.push([...pt]);
    pt[0] += myWidth;
    let nextP0 = [pt[0], pt[1]];
    pts.push([...pt]);
    pt[0] += opts.racewayChevronDepth;
    pt[1] += racewayHeight / 2;
    pts.push([...pt]);
    pt[0] -= opts.racewayChevronDepth;
    pt[1] += racewayHeight / 2;
    pts.push([...pt]);
    pt[0] -= myWidth;
    pts.push([...pt]);
    let bodypt = [...pt];
    pt[0] += opts.racewayChevronDepth;
    pt[1] -= racewayHeight / 2;
    pts.push([...pt]);
    if (i == data.length - 1) {
      pts[1][0] -= lastChevronOffset;
      pts[2][0] -= lastChevronOffset;
      pts[3][0] -= lastChevronOffset;
    }
    if (i > 0) {
      pts[0][0] += miterOffset;
      pts[4][0] += miterOffset;
      pts[5][0] += miterOffset;
    }
    pts[1][0] -= miterOffset;
    pts[2][0] -= miterOffset;
    pts[3][0] -= miterOffset;
    sections.push({
      text: data[i].label,
      cx: pts[0][0] + (pts[2][0] - pts[0][0]) / 2,
      cy: pts[1][1] + (pts[3][1] - pts[1][1]) / 2,
      points: [...pts],
      body: {
        content: {
          ...data[i].content
        },
        x: bodypt[0],
        y: bodypt[1],
        width: myWidth - 1,
        height: sectionHeight
      }
    });
    pt = [...nextP0];
  }
  let racetrackRadius = opts.racewayRadius;
  let track = [];
  pt = [opts.width - padding - racewayHeight - lastChevronOffset + (lastChevronOffset > 0 ? miterOffset : 0), y0];
  track.push([...pt]);
  pt[0] += lastChevronOffset + (racewayHeight - racetrackRadius);
  track.push([...pt]);
  pt[0] += racetrackRadius;
  pt[1] += racetrackRadius;
  track.push([...pt]);
  pt[1] += sectionHeight + 2 * (racewayHeight - racetrackRadius);
  track.push([...pt]);
  pt[0] -= racetrackRadius;
  pt[1] += racetrackRadius;
  track.push([...pt]);
  pt[0] = padding + racetrackRadius;
  track.push([...pt]);
  pt[0] -= racetrackRadius;
  pt[1] -= racetrackRadius;
  track.push([...pt]);
  pt[1] -= sectionHeight + 2 * (racewayHeight - racetrackRadius);
  track.push([...pt]);
  pt[0] += racetrackRadius - 1;
  pt[1] -= racetrackRadius;
  track.push([...pt]);
  pt[0] += racewayHeight - racetrackRadius;
  track.push([...pt]);
  pt[0] += opts.racewayChevronDepth;
  pt[1] += racewayHeight / 2;
  track.push([...pt]);
  pt[0] -= opts.racewayChevronDepth;
  pt[1] += racewayHeight / 2;
  track.push([...pt]);
  pt[1] += sectionHeight + 1;
  track.push([...pt]);
  pt[0] += racewayWidth + 1;
  track.push([...pt]);
  let wrapTop = 1;
  if (lastChevronOffset == 0) {
    wrapTop = 0;
  }
  pt[1] -= sectionHeight + 1 + wrapTop;
  track.push([...pt]);
  let insetMiterOffset = 1 / Math.tan(Math.atan(racewayHeight / (2 * opts.racewayChevronDepth)));
  if (lastChevronOffset == 0) {
    insetMiterOffset = 0;
  }
  if (lastChevronOffset > 0) {
    pt[0] -= lastChevronOffset - miterOffset - insetMiterOffset;
    track.push([...pt]);
  }
  pt[0] += opts.racewayChevronDepth - insetMiterOffset;
  pt[1] -= racewayHeight / 2 - wrapTop;
  track.push([...pt]);
  let gradient = [];
  let trackWidth = opts.width - 2 * padding;
  let cumulativeDist = racewayHeight;
  for (let i = 0; i < data.length; i++) {
    cumulativeDist += 0.5 * sectionWidth * (data[i].contextWidth ?? 1);
    gradient.push({
      color: opts.racewayColors[i],
      offset: 100 * (cumulativeDist / trackWidth)
    });
    cumulativeDist += 0.5 * sectionWidth * (data[i].contextWidth ?? 1);
  }
  let racewayLabels = [{
    cx: track[6][0] + (track[12][0] - track[6][0]) / 2,
    cy: track[7][1] + (track[6][1] - track[7][1]) / 2,
    text: opts.racewayLabel
  }, {
    cx: track[13][0] + (track[3][0] - track[13][0]) / 2,
    cy: track[2][1] + (track[3][1] - track[2][1]) / 2,
    text: opts.racewayLabel
  }];
  return {
    sections: sections,
    track: track,
    gradient: gradient,
    labels: racewayLabels
  };
}
function renderRaceway(raceway, opts) {
  let svg = getSVG(opts);
  let padding = getPadding(opts);
  let defs = svg.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'defs')[0];
  let linearGradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
  linearGradient.setAttribute('id', `raceway-gradient`);
  for (let i = 0; i < raceway.gradient.length; i++) {
    let stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
    stop.setAttribute('stop-color', `${raceway.gradient[i].color}`);
    stop.setAttribute('offset', `${raceway.gradient[i].offset}%`);
    linearGradient.appendChild(stop);
  }
  defs.appendChild(linearGradient);
  for (let i = raceway.sections.length - 1; i >= 0; i--) {
    let styleStr = 'stroke-width:1;';
    styleStr += `fill:none;`;
    styleStr += `stroke:${mix_hexes_naive(opts.racewayColors[i], "#000000")};`;
    let poly = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    poly.setAttribute('x', raceway.sections[i].body.x.toString());
    poly.setAttribute('y', raceway.sections[i].body.y.toString());
    poly.setAttribute('width', raceway.sections[i].body.width.toString());
    poly.setAttribute('height', raceway.sections[i].body.height.toString());
    poly.setAttribute('style', styleStr);
    svg.appendChild(poly);
    embedContent({
      x: raceway.sections[i].body.x + 0.5 * padding,
      y: raceway.sections[i].body.y + 0.5 * padding,
      width: raceway.sections[i].body.width - 1,
      height: raceway.sections[i].body.height,
      svg: svg,
      content: {
        ...raceway.sections[i].body.content
      },
      contextId: `racewayContext-${i}`
    });
    styleStr = 'stroke-width:1;';
    styleStr += `fill:${opts.racewayColors[i]};`;
    styleStr += `stroke:${mix_hexes_naive(opts.racewayColors[i], "#000000")};`;
    styleStr += `stroke-miterlimit:10;`;
    let pathStr = `M ${raceway.sections[i].points[0][0]} ${raceway.sections[i].points[0][1]} `;
    for (let j = 1; j < raceway.sections[i].points.length; j++) {
      pathStr += `L ${raceway.sections[i].points[j][0]} ${raceway.sections[i].points[j][1]} `;
    }
    pathStr += 'Z';
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', pathStr);
    path.setAttribute('style', styleStr);
    if (!opts.useFlatColors) {
      path.setAttribute('filter', `url(#inner-glow-raceway-${i})`);
    }
    svg.appendChild(path);
    styleStr = 'stroke-width:1;';
    styleStr += `fill:none;`;
    styleStr += `stroke:${mix_hexes_naive(opts.racewayColors[i], "#000000")};`;
    styleStr += `stroke-miterlimit:10;`;
    path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', pathStr);
    path.setAttribute('style', styleStr);
    svg.appendChild(path);
    let tBox = drawContainedText({
      svg: svg,
      text: raceway.sections[i].text,
      x: raceway.sections[i].cx,
      y: raceway.sections[i].cy,
      textStyle: opts.labelStyle,
      padding: getPadding(opts)
    });
    tBox.background.setAttribute("fill", `${mix_hexes_naive(opts.racewayColors[i], mix_hexes_naive(opts.racewayColors[i], "#000000"))}`);
    if (!opts.useFlatColors) {
      tBox.background.setAttribute('filter', `url(#big-blur)`);
    }
  }
  let racetrackRadius = opts.racewayRadius;
  let pathStr = `M ${raceway.track[0][0]} ${raceway.track[0][1]} `;
  for (let j = 1; j < raceway.track.length; j++) {
    if (j == 2) {
      pathStr += getTopRightRoundedNinety(racetrackRadius);
    }
    if (j == 4) {
      pathStr += getBottomRightRoundedNinety(racetrackRadius);
    }
    if (j == 6) {
      pathStr += getBottomLeftRoundedNinety(racetrackRadius);
    }
    if (j == 8) {
      pathStr += getTopLeftRoundedNinety(racetrackRadius);
    } else {
      pathStr += `L ${raceway.track[j][0]} ${raceway.track[j][1]} `;
    }
  }
  pathStr += 'Z';
  let styleStr = 'stroke-width:0;';
  styleStr += `fill:url(#raceway-gradient);`;
  styleStr += `stroke:${mix_hexes_naive('#999999', "#000000")};`;
  styleStr += `stroke-miterlimit:10;`;
  let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute('d', pathStr);
  path.setAttribute('style', styleStr);
  path.setAttribute('id', 'raceway-track');
  if (!opts.useFlatColors) {
    path.setAttribute('filter', 'url(#simple-blur)');
  }
  svg.appendChild(path);
  styleStr = 'stroke-width:1;';
  styleStr += `fill:none;`;
  styleStr += `stroke:url(#raceway-gradient-dark);`;
  styleStr += `stroke-miterlimit:10;`;
  path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.setAttribute('d', pathStr);
  path.setAttribute('style', styleStr);
  path.setAttribute('id', 'raceway-track-stroke');
  svg.appendChild(path);
  let rotations = [-90, 90];
  for (let i = 0; i < raceway.labels.length; i++) {
    let tBox = drawContainedText({
      svg: svg,
      text: raceway.labels[i].text,
      x: raceway.labels[i].cx,
      y: raceway.labels[i].cy,
      textStyle: opts.labelStyle,
      padding: getPadding(opts)
    });
    tBox.label.setAttribute("transform", `rotate(${rotations[i]} ${raceway.labels[i].cx} ${raceway.labels[i].cy})`);
    tBox.background.setAttribute("transform", `rotate(${rotations[i]} ${raceway.labels[i].cx} ${raceway.labels[i].cy})`);
    tBox.background.setAttribute("fill", `none`);
  }
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
    width: 2000,
    height: 1500,
    padding: 5,
    pyramidWidth: 450,
    pyramidHeight: 500,
    bannerHeight: 90,
    maxTitleHeight: 50,
    pyramidColors: ["#f032e6", "#42d4f4", "#00ff00", "#f58231", "#4363d8", "#e6194B", "#009933", "#6600ff", '#006400', '#ff0000', '#00ced1', '#ffa500', '#98fb98', '#ff00ff', '#6495ed', '#000080', '#ffdab9'],
    pyramidLevels: 0,
    racewayOffset: 20,
    racewayTitleHeight: 50,
    racewaySpinnerHeight: 0,
    racewaySpinnerWidth: 0,
    racewayChevronDepth: 25,
    racewayRadius: 15,
    racewayLabel: '',
    racewayColors: ['#2f4f4f', '#00ced1', '#c71585', '#00cc00', '#0000ff'],
    racewayLevels: 0,
    showLabels: true,
    labelStyle: "fill:#ffffff;stroke:#000000;stroke-width:0px;",
    useFlatColors: false
  };
}
function _render(input_data, input_opts) {
  let opts;
  if (input_opts !== undefined) {
    opts = {
      ...input_opts
    };
  } else {
    opts = _defaultOpts();
  }
  _applyDefaultOptions(opts);
  let data = _validateData(input_data);
  if (data == null) {
    return;
  }
  opts.pyramidLevels = data.pyramid.length;
  opts.racewayLevels = data.raceway.length;
  let oErrMsg = _validateOptions(opts);
  if (oErrMsg) {
    console.error(oErrMsg);
    return;
  }
  let svg = getSVG(opts);
  svg.setAttribute('width', opts.width.toString());
  svg.setAttribute('height', opts.height.toString());
  _renderDefs(opts);
  if (opts.showBanner) {
    renderBanner(opts);
  }
  let pyramidObj = generatePyramid(data.pyramid, opts);
  let pyramidContext = generateContext(data.pyramid, opts);
  let pyramidPaths = generatePaths(pyramidObj, pyramidContext, opts);
  if (pyramidPaths) {
    renderPaths(pyramidPaths, opts);
  }
  if (pyramidObj) {
    renderPyramid(pyramidObj, opts);
  }
  if (pyramidContext) {
    renderContext(pyramidContext, opts);
  }
  let padding = getPadding(opts);
  let x0 = padding;
  let lastPContext = pyramidContext.bodies[pyramidContext.bodies.length - 1];
  let y0 = lastPContext.y + lastPContext.height + padding + opts.racewayOffset;
  let raceway = generateRaceway(data.raceway, opts, x0, y0);
  if (raceway) {
    renderRaceway(raceway, opts);
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
  let defs = svg.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'defs');
  let defTag;
  if (defs.length > 0) {
    defTag = defs[0];
  } else {
    defTag = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
    svg.appendChild(defTag);
  }
  renderFilters(opts, defTag);
}

export { render };
