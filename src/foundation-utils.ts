
export type PyramidData = {
    label?: string;
    row?: number;
    contextWidth?: number;
    content?: FoundationContent;
}[];
export type RacewayData = {
    [index:string]:any;
}
export type FoundationData = {
    pyramid: PyramidData;
    raceway: RacewayData
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
    pyramidWidth: number;
    pyramidHeight: number;
    bannerHeight: number;
    padding: number;
    pyramidLevels: number; // set automatically
    //tooltip: boolean;
    //tooltipCallbackRenderer: _defaultTooltipCallbackRenderer /*  */,
    //click: boolean;
    //clickCallbackRenderer: _defaultClickCallbackRenderer /*  */,
    //hover: boolean;
    //hoverCallbackRenderer: _defaultHoverCallbackRenderer /*  */,
    showLabels: boolean;
    labelStyle: string;
    colors: string[];
    useFlatColors: boolean;
    [index: string]: any;
};

export function getSVG(opts:FoundationOptions):Element {
    let svg = document.querySelector(opts.container);
    if (svg == null || svg == undefined) {
        console.error('Container does not exist; creating one');
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        document.appendChild(svg);
    }
    return svg;
}

export function getPadding(opts:FoundationOptions) {
    return opts.padding;
}

export function getBannerHeight(opts:FoundationOptions) {
    return opts.bannerHeight;
}

export function getPyramidHeight(opts:FoundationOptions) {
    if (opts.pyramidHeight >= opts.height) {
        return opts.height - 2 * getPadding(opts);
    }
    return opts.pyramidHeight;
}

export function getPyramidWidth(opts:FoundationOptions) {
    return opts.pyramidWidth;
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