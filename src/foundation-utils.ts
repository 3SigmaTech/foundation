
export type PyramidData = {
    label?: string;
    row?: number;
    contextWidth?: number;
    content?: FoundationContent;
}[];
export type RacewayData = {
    label: string;
    contextWidth?: number;
    content?: FoundationContent;
    [index: string]: any;
}[];
export type FoundationData = {
    pyramid: PyramidData;
    raceway: RacewayData;
}

export type FoundationContent = {
    svg?: string;
    svgFile?: string;
    html?: string;
    htmlFile?: string;
};

export type FoundationEmbeddedContent = {
    x: number;
    y: number;
    width: number;
    height: number
    svg: Element;
    content: FoundationContent;
    contextId: string;
};

export type FoundationText = {
    text: string;
    labelStyle?: string;
    style?: string;
}
export type FoundationOptions = {
    container: string;
    title: FoundationText | null;
    leftContext: FoundationEmbeddedContent | null;
    rightContext: FoundationEmbeddedContent | null;
    showBanner: boolean;
    width: number;
    height: number;
    padding: number;
    pyramidWidth: number;
    pyramidHeight: number;
    bannerHeight: number;
    maxTitleHeight: number;
    pyramidLabel: string;
    pyramidColors: string[];
    pyramidLevels: number; // set automatically

    racewayOffset: number;
    racewayTitleHeight: number;
    racewaySpinnerHeight: number;
    racewaySpinnerWidth: number;
    racewayChevronDepth: number;
    racewayRadius: number;
    racewayLabel: string;
    racewayColors: string[];
    racewayLevels: number; // set automatically
    //tooltip: boolean;
    //tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /*  */,
    //click: boolean;
    //clickCallbackRenderer: _defaultClickCallbackRenderer /*  */,
    //hover: boolean;
    //hoverCallbackRenderer: _defaultHoverCallbackRenderer /*  */,
    showLabels: boolean;
    labelStyle: string;
    useFlatColors: boolean;
    // Use start and end color to define a gradient for pyramid and raceway
    startColor: string;
    endColor: string;
    [index: string]: any;
};

var _SVG:Element|null = null;
export function getSVG(opts:FoundationOptions):Element {
    let svg:Element|null;
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

var _DEFS: Element | null = null;
export function getDefs(opts: FoundationOptions): Element {
    let defs: Element | null;
    let svg = getSVG(opts);
    if (_DEFS == null) {
        defs = svg.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'defs')[0];
        if (defs == null || defs == undefined) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svg.appendChild(defs);
        }
        _DEFS = defs;
    } else {
        defs = _DEFS;
    }
    return defs;
}


export function getPyramidHeight(opts:FoundationOptions) {
    if (opts.pyramidHeight >= opts.height) {
        return opts.height - 2 * opts.padding;
    }
    return opts.pyramidHeight;
}

export function getPathGutter(opts:FoundationOptions) {
    return getPyramidHeight(opts) / opts.pyramidLevels;
}

export function getPathWidth(opts:FoundationOptions) {
    //return 3;
    return Math.min(10, (opts.useFlatColors ? 0.8 : 0.5) * getPathGutter(opts) / opts.pyramidLevels - 2);
}

export function getPathChannel(opts:FoundationOptions) {
    return (getPathGutter(opts) / (opts.pyramidLevels + 1));
}
