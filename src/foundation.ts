import type { FoundationOptions, FoundationData } from './foundation-utils';

import * as utils from './foundation-utils';
import { generatePyramid, renderPyramid } from './pyramid/object';
import { generateContext, renderContext } from './pyramid/context';
import { generatePaths, renderPaths } from './pyramid/paths';
import { renderFilters } from './foundation-filters';
import { renderBanner } from './foundation-banner';
import { generateRaceway, renderRaceway } from './raceway/object';

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
        width: 2000,
        height: 1500,
        padding: 5,

        pyramidWidth: 450,
        pyramidHeight: 500,
        bannerHeight: 90,
        maxTitleHeight: 50,
        pyramidColors: [
            "#f032e6",
            "#42d4f4",
            "#00ff00",
            "#f58231",
            "#4363d8",
            "#e6194B",
            "#009933",
            "#6600ff",
            //darkgreen
            '#006400',
            //red
            '#ff0000',
            //darkturquoise
            '#00ced1',
            //orange
            '#ffa500',
            //palegreen
            '#98fb98',
            //yellow
            //'#ffff00',
            //fuchsia
            '#ff00ff',
            //cornflower
            '#6495ed',
            //navy
            '#000080',
            //peachpuff
            '#ffdab9'
        ],
        pyramidLevels: 0,

        racewayOffset: 20,
        racewayTitleHeight: 50,
        racewaySpinnerHeight: 0,
        racewaySpinnerWidth: 0,
        racewayChevronDepth: 25,
        racewayRadius: 15,
        racewayLabel: '',
        racewayColors: [
            //darkslategray
            '#2f4f4f',
            //darkturquoise
            '#00ced1',
            //mediumvioletred
            '#c71585',
            //green
            '#00cc00',
            //blue
            '#0000ff',

        ],
        racewayLevels: 0,

        // tooltip: true,
        // tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /*  */,
        // click: true,
        // clickCallbackRenderer: _defaultClickCallbackRenderer /*  */,
        // hover: true,
        // hoverCallbackRenderer: _defaultHoverCallbackRenderer /*  */,
        showLabels: true,
        labelStyle: "fill:#ffffff;stroke:#000000;stroke-width:0px;",
        useFlatColors: false
    };
}

function _render(input_data:FoundationData, input_opts:FoundationOptions) {
    let opts:FoundationOptions;
    if (input_opts !== undefined) {
        opts = {...input_opts};
    } else {
        opts = _defaultOpts();
    }
    _applyDefaultOptions(opts);

    let data = _validateData(input_data, opts);
    if (data == null) { return; }

    opts.pyramidLevels = data.pyramid.length;
    opts.racewayLevels = data.raceway.length;
    
    let oErrMsg = _validateOptions(opts);
    if (oErrMsg) { console.error(oErrMsg); return; }
    
    let svg = utils.getSVG(opts);
    svg.setAttribute('width', opts.width.toString());
    svg.setAttribute('height', opts.height.toString());
    _renderDefs(opts);

    if (opts.showBanner) {
        renderBanner(opts);
    }

    let pyramidObj = generatePyramid(data.pyramid, opts);
    let pyramidContext = generateContext(data.pyramid, opts);
    let pyramidPaths = generatePaths(pyramidObj, pyramidContext, opts);

    // Render before pyramid for clean interface with pyramid's side
    if (pyramidPaths) {
        renderPaths(pyramidPaths, opts);
    }

    if (pyramidObj) {
        renderPyramid(pyramidObj, opts);
    }

    if (pyramidContext) {
        renderContext(pyramidContext, opts);
    }

    let padding = utils.getPadding(opts);
    let x0 = padding;
    let lastPContext = pyramidContext.bodies[pyramidContext.bodies.length - 1];
    let y0 = lastPContext.y + lastPContext.height + padding + opts.racewayOffset;

    let raceway = generateRaceway(data.raceway, opts, x0, y0);
    if (raceway) {
        renderRaceway(raceway, opts);
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
