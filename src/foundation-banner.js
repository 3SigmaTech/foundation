import * as utils from './foundation-utils';
import { mix_hexes_naive as mix_hexes } from './color-mixer';

export function renderBanner(opts) {

    let svg = utils.getSVG(opts);

    let banner = _renderTitle(opts, svg);
    _renderLeftBox(opts, svg, banner);
    _renderRightBox(opts, svg, banner);
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