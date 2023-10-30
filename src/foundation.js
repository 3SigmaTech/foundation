import { getSVG, getPadding, getPyramidHeight, getPyramidWidth, getPathGutter, getPathWidth } from './foundation-utils';
import { mix_hexes_naive as mix_hexes } from './color-mixer';

import { generatePyramid, renderPyramid } from './foundation-pyramid';
import { generateContext, renderContext } from './foundation-context';
import { generatePaths, renderPaths } from './foundation-paths';
import { renderFilters } from './foundation-filters';
import { renderBanner } from './foundation-banner';

export function render(data, opts) {
  return _render(data, opts);
};


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

function _applyCallbacks(path, meta, opts) {
//     if (opts.tooltip) {
//         path
//             .on("mouseover.tt", opts.tooltipCallbackRenderer("mouseover", meta))
//             .on("mouseout.tt", opts.tooltipCallbackRenderer("mouseout", meta))
//             .on("mousemove.tt", opts.tooltipCallbackRenderer("mousemove", meta));
//
//     }
//     if (opts.click) {
//         path.on("click", opts.clickCallbackRenderer(meta));
//     }
//     if (opts.hover) {
//         path
//             .on("mouseover.h", opts.hoverCallbackRenderer("mouseover", meta))
//             .on("mouseout.h", opts.hoverCallbackRenderer("mouseout", meta));
//     }
}