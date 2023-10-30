(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foundation = {}));
})(this, (function (exports) { 'use strict';

  function render(data, opts) {
    return _render(data, opts);
  }
  // var SUPPORTED_SIZES = [3, 5, 7];
  //
  // var INTERSECTIONS = {};
  // var PATHS = [];
  // var LABELS = [];
  // var DATA = [];
  // var OPTIONS = {};
  // var TOOLTIP = null;
  // var VENN = null;
  //
  // export function intersections() {
  //     return INTERSECTIONS;
  // }
  // export function paths() {
  //     return PATHS;
  // }
  // export function labels() {
  //     return LABELS;
  // }
  // export function data() {
  //     return DATA;
  // }
  // export function options() {
  //     return OPTIONS;
  // }
  // export function clear() {
  //     for (let i = 0; i < PATHS.length; i++) {
  //         document.getElementById(PATHS[i].attrs['id']).remove();
  //     }
  //     reset();
  // }
  // export function reset() {
  //     INTERSECTIONS = {};
  //     PATHS = [];
  //     LABELS = [];
  //     DATA = [];
  // }

  function _defaultOpts() {
      return {
          container: null,
          width: 2500,
          height: 500,
          tooltip: true,
          tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /*  */,
          click: true,
          clickCallbackRenderer: _defaultClickCallbackRenderer /*  */,
          hover: true,
          hoverCallbackRenderer: _defaultHoverCallbackRenderer /*  */,
          useEllipses: false,
          useDistinctAreas: false,
          showLabels: true,
          labelStyle: "stroke:#ffffff;fill:#000000;stroke-width:0.25px;",
          labels: [], // ["A", "B", "C", "D", "E", "F", "G"] - left empty for implementation reasons, but computed as commented
          colors: ["#6600ff", "#0099ff", "#00cc00", "#cc9900", "#ff0000", "#999999", "#009933"],
          style: "fill-opacity:0.05;stroke-width:1;stroke-opacity:1;stroke:#ffffff"
      };
  }

  function _render(data, opts) {
      if (opts === undefined) {
          OPTIONS = {};
      } else {
          OPTIONS = {...opts};
      }
      _applyDefaultOptions(OPTIONS);

      let dErrMsg = _validateData(data);
      if (dErrMsg) { console.error(dErrMsg); return; }

      OPTIONS.numLevels = DATA.length;
      
      let oErrMsg = _validateOptions(OPTIONS);
      if (oErrMsg) { console.error(oErrMsg); return; }
      
      PYRAMID = _generatePyramid(DATA, OPTIONS);
      CONTEXT = _generateContext(DATA, OPTIONS);
      PATHS = _generatePaths(PYRAMID, CONTEXT);

      return _drawFoundation(PYRAMID, PATHS, CONTEXT, OPTIONS);
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
              OPTIONS.labels.push(String.fromCharCode(65 + OPTIONS.labels.length));
          }
      }
      if (typeof data === 'object') {
          DATA = [];
          OPTIONS.datalabels = [];
          for (let prop of Object.keys(data)) {
              if (Array.isArray(data[prop])) {
                  DATA.push(data[prop]);
                  if (OPTIONS.labels.length < DATA.length) {
                      OPTIONS.labels.push(prop);
                  }
              }
          }
      }

      if (SUPPORTED_SIZES.indexOf(DATA.length) == -1) {
          return "Array sizes of [" + SUPPORTED_SIZES.toString() + '] are supported.';
      }
      return '';
  }

  function _validateOptions(opts) {
      if (opts.container == null) {
          return 'You must set a container SVG tag using opts.container';
      }
  }

  function _generatePyramid(data, opts) {

      let padding = 0.01 * opts.height;
      let pH = opts.height - 2 * padding;
      let pW = opts.height - 2 * padding;

      let p0 = [0.5 * pW + padding, padding];
      let p1 = [padding, pH + padding];
      let p2 = [pW + padding, pH + padding];

      let levels = {
          "test": [p0, p1, p2]
      };

      let labels = {
          "test": {
              text: "Test",
              x: p0[0],
              y: 0.5 * pH + padding
          }
      };

      return {levels: levels, labels: labels};
  }

  function _generateContext(data, opts) {
      let baseLabels = pathData();
      let labels = [];

      let base = 'S' + opts.numSets + (opts.useEllipses ? 'e' : '');
      let myBase = baseLabels[base];
      let meta = myBase['meta'];

      if (myBase['labels'] == undefined) { return []; }
      for (let label of Object.keys(myBase['labels'])) {

          let myLabel = myBase['labels'][label];

          let tag = 'text';

          let index = label.split(',');
          index.forEach((x, n) => { index[n] = parseInt(x); });

          for (let r = 0; r < opts.numSets; r++) {

              let el = { tag: tag, attrs: {} };
              // Rotate X and Y coordinates about the center
              let angle = ((2.0 * Math.PI * r) / opts.numSets);
              let sin = Math.sin(angle);
              let cos = Math.cos(angle);
              let myX = myLabel.x - meta.rx;
              let myY = myLabel.y - meta.ry;
              el.attrs.x = Math.round(myX * cos - myY * sin) + meta.rx;
              el.attrs.y = Math.round(myX * sin + myY * cos) + meta.ry;

              if (myLabel.offsets != undefined) {
                  if (myLabel.offsets[r] != undefined) {
                      if (myLabel.offsets[r].x != undefined) {
                          el.attrs.x += myLabel.offsets[r].x;
                      }
                      if (myLabel.offsets[r].y != undefined) {
                          el.attrs.y += myLabel.offsets[r].y;
                      }
                  }
              }
              let myIndex = [...index];
              for (let i = 0; i < myIndex.length; i++) {
                  myIndex[i] += r;
                  if (myIndex[i] % opts.numSets < myIndex[i]) {
                      myIndex[i] -= opts.numSets;
                  }
              }
              myIndex.sort();
              el.attrs['index'] = myIndex.toString();
              el.attrs['id'] = 'S' + myIndex.join('n') + 'Label';
              if (label == '-1') {
                  el.text = opts.labels[r];
              } else {
                  el.text = INTERSECTIONS['S' + myIndex.join('n')].size;
              }
              
              let myStyle = opts.labelStyle;
              myStyle += ';font-size:' + meta.fontSize + 'px';
              if (label == '-1') {
                  myStyle += `;fill:${opts.colors[r]}`;
                  myStyle += `;stroke:${opts.colors[r]}`;
              }
              el.attrs['style'] = myStyle;
              
              let myClass = (label == '-1' ? 'set-label' : 'intersection-label');
              el.attrs['class'] = myClass;

              labels.push(el);

              // Intersection of all sets is rotationally symmetric with itself
              if (index.length == opts.numSets) { break; }
          }
      }
      return labels;
  }

  function _generatePaths(pyramid, context) {
      let basePaths = pathData();
      let paths = [];

      let base = 'S' + opts.numSets + (opts.useEllipses ? 'e' : '');
      let myBase = basePaths[base];
      let meta = myBase['meta'];

      for (let path of Object.keys(myBase['sets'])) {

          let myPath = myBase['sets'][path];
          if (opts.useDistinctAreas) {
              myPath = myBase['areas'][path];
          }

          let tag = 'path';
          if (opts.numSets == 3 && path == '0' && typeof myPath === 'object') { tag = 'circle'; }
          if (opts.useEllipses && path == '0' && typeof myPath === 'object') { tag = 'ellipse'; }

          let index = path.split(',');
          index.forEach((x, n) => { index[n] = parseInt(x); });

          for (let r = 0; r < opts.numSets; r++) {

              let angle = (360 / opts.numSets) * r;

              let el = { tag: tag, attrs: {} };

              if (tag == 'path') {
                  el.attrs['d'] = myPath;
              } else {
                  for (let prop of Object.keys(myPath)) {
                      el.attrs[prop] = myPath[prop];
                  }
              }

              if (angle != 0) {
                  el.attrs['transform'] = `rotate(${angle} ${meta.rx} ${meta.ry})`;
              }

              let myIndex = [...index];
              for (let i = 0; i < myIndex.length; i++) {
                  myIndex[i] += r;
                  if (myIndex[i] % opts.numSets < myIndex[i]) {
                      myIndex[i] -= opts.numSets;
                  }
              }
              myIndex.sort();
              el.attrs['index'] = myIndex.toString();
              el.attrs['id'] = 'S' + myIndex.join('n');

              let myStyle = opts.style;
              if (path == '0' && opts.colors[r]) {
                  myStyle += `;fill:${opts.colors[r]}`;
                  myStyle += `;stroke:${opts.colors[r]}`;
              }
              el.attrs['style'] = myStyle;

              let myClass = (path == '0' ? 'set' : 'intersection');
              el.attrs['class'] = myClass;

              paths.push(el);

              // Intersection of all sets is rotationally symmetric with itself
              if (index.length == opts.numSets) { break; }
          }
      }
      return paths;
  }

  function _drawFoundation(pyramid, paths, context, opts) {


      if (pyramid) {
          _renderPyramid(pyramid, opts);
      }

      // VENN = selection.select("svg");
      // if (VENN._groups[0][0] == null) {
      //     VENN = selection.append("svg")
      //         .attr("width", OPTIONS.width)
      //         .attr("height", OPTIONS.height)
      // }
      //
      // if (TOOLTIP != null) {
      //     let el = document.getElementById(TOOLTIP.attr("id"));
      //     if (el == undefined) { TOOLTIP = null; }
      // }
      // if (TOOLTIP == null) {
      //     TOOLTIP = selection.append("div")
      //         .attr("id", "tooltip")
      //         .attr("class", "hypervenntooltip")
      //         .style("position", "absolute")
      //         .style("width", "120px")
      //         .style("height", "auto")
      //         .style("padding", "10px")
      //         .style("background-color", "white")
      //         .style("border-radius", "10px")
      //         .style("box-shadow", "4px 4px 10px rgba(0, 0, 0, 0.4)")
      //         .style("pointer-events", "none")
      //         .style("display", "none");
      // }
      //
      // for (let i = 0; i < PATHS.length; i++) {
      //     let mypath = VENN.append(PATHS[i].tag);
      //     for (let prop of Object.keys(PATHS[i].attrs)) {
      //         mypath.attr(prop, PATHS[i].attrs[prop]);
      //     }
      //     let mymeta = INTERSECTIONS[PATHS[i].attrs.id];
      //     _applyCallbacks(mypath, mymeta, OPTIONS);
      // }
      //
      // for (let i = 0; i < LABELS.length; i++) {
      //     let mylabel = VENN.append(LABELS[i].tag);
      //     for (let prop of Object.keys(LABELS[i].attrs)) {
      //         mylabel.attr(prop, LABELS[i].attrs[prop]);
      //     }
      //     mylabel.text(LABELS[i].text);
      //
      //     // Offset placement to account for text size
      //     let rect = mylabel.node().getBoundingClientRect();
      //     mylabel.attr('x', LABELS[i].attrs.x - rect.width / 2);
      //     mylabel.attr('y', LABELS[i].attrs.y + rect.height / 2);
      // }
  }

  function _renderPyramid(pyramid, opts) {

      let svg = document.querySelector(opts.container);
      if (svg == null || svg == undefined) {
          console.error('Container does not exist');
      }

      for (let prop of Object.keys(pyramid.levels)) {
          if (!pyramid.levels.hasOwnProperty(prop)) {
              continue;
          }

          debugger;
          
          let pointStr = '';
          for (pt of pyramid.levels[prop]) {
              pointStr += ` ${pt[0]},${pt[1]}`;
          }

          let poly = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
          poly.setAttribute('points', pointStr.trim());
          path1.setAttribute('style', 'fill:lime;stroke:purple;stroke-width:1');

          svg.appendChild(poly);
      }
  }

  exports.render = render;

}));
