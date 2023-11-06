import type { FoundationOptions } from './foundation-utils';

import * as utils from './foundation-utils';
import * as svgutils from './svg-utils';

export function renderBanner(opts: FoundationOptions) {

    let svg = utils.getSVG(opts);

    _renderTitle(opts, svg);
    _renderLeftBox(opts, svg);
    _renderRightBox(opts, svg);
}

function _renderTitle(opts:FoundationOptions, svg:Element) {

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
    text.setAttribute('letter-spacing', (-2.5 * stretch).toString()); // Set to 1.5 for Nunito
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

function _renderLeftBox(opts:FoundationOptions, svg:Element) {
    if (opts.leftContext == null) {
        return;
    }

    svgutils.embedContent({
        x: opts.padding,
        y: 0,
        width: opts.leftContext.width ?? 0,
        height: opts.bannerHeight,
        svg: svg,
        content: opts.leftContext.content,
        contextId: 'leftBannerContext'
    });
}


function _renderRightBox(opts:FoundationOptions, svg:Element) {
    if (opts.rightContext == null) {
        return;
    }

    svgutils.embedContent({
        x: opts.width - (opts.rightContext.width ?? 0) - opts.padding,
        y: 0,
        width: opts.rightContext.width ?? 0,
        height: opts.bannerHeight,
        svg: svg,
        content: opts.rightContext.content,
        contextId: 'rightBannerContext'
    });
}