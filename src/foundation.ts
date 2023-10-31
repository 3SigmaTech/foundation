import type { FoundationOptions, FoundationData } from './foundation-utils';

import * as utils from './foundation-utils';
import { generatePyramid, renderPyramid } from './pyramid/object';
import { generateContext, renderContext } from './pyramid/context';
import { generatePaths, renderPaths } from './pyramid/paths';
import { renderFilters } from './foundation-filters';
import { renderBanner } from './foundation-banner';

export function render(data:FoundationData, opts: FoundationOptions) {
  return _render(data, opts);
};

function _defaultOpts():FoundationOptions {
    return {
        container: '',
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
        pyramidLevels: 0,
        // tooltip: true,
        // tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /*  */,
        // click: true,
        // clickCallbackRenderer: _defaultClickCallbackRenderer /*  */,
        // hover: true,
        // hoverCallbackRenderer: _defaultHoverCallbackRenderer /*  */,
        showLabels: true,
        labelStyle: "fill:#ffffff;stroke:#000000;stroke-width:0.25px;",
        colors: ["#f032e6", "#42d4f4", "#00cc00", "#f58231", "#4363d8", "#e6194B", "#009933", "#6600ff"],
        useFlatColors: false
    };
}

function _render(data:FoundationData, opts:FoundationOptions) {
    let privateOpts:FoundationOptions;
    if (opts !== undefined) {
        privateOpts = {...opts};
    } else {
        privateOpts = _defaultOpts();
    }
    _applyDefaultOptions(privateOpts);

    let privateData = _validateData(data, privateOpts);
    if (privateData == null) { return; }

    privateOpts.pyramidLevels = privateData.pyramid.length;
    
    let oErrMsg = _validateOptions(privateOpts);
    if (oErrMsg) { console.error(oErrMsg); return; }
    
    let svg = utils.getSVG(privateOpts);
    svg.setAttribute('width', privateOpts.width.toString());
    svg.setAttribute('height', privateOpts.height.toString());
    _renderDefs(privateOpts);

    if (privateOpts.showBanner) {
        renderBanner(privateOpts);
    }

    let pyramid = generatePyramid(privateData.pyramid, privateOpts);
    let context = generateContext(privateData.pyramid, privateOpts);
    let paths = generatePaths(pyramid, context, privateOpts);

    // Render before pyramid for clean interface with pyramid's side
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

function _applyDefaultOptions(opts:FoundationOptions) {
    let defaultOpts = _defaultOpts();
    for (let prop of Object.keys(defaultOpts)) {
        if (!opts.hasOwnProperty(prop)) {
            opts[prop] = defaultOpts[prop];
        }
    }
}

function _validateData(data:FoundationData, _opts:FoundationOptions):FoundationData|null {
    if (data === null) {
        console.error("Data cannot be null.");
        return null;
    }
    let privateData = {...data};
    
    return privateData;
}

function _validateOptions(opts:FoundationOptions):string|null {
    if (opts.container == null) {
        return 'You must set a container SVG tag using opts.container';
    }
    return null;
}

function _renderDefs(opts:FoundationOptions):void {

    let svg = utils.getSVG(opts);

    let defs = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
    svg.appendChild(defs);

    renderFilters(opts, defs);

}
