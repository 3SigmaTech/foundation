import type { FoundationOptions } from "./foundation-utils";

import { mix_hexes } from "./color-mixer";

export function renderFilters(opts:FoundationOptions, defelement:Element) {

    let innerGlow = _createInnerGlow(null, '#ffffff', null);
    defelement.appendChild(innerGlow);

    let faintOuterGlow = _createFaintOuterGlow(null, '#ffffff', null);
    defelement.appendChild(faintOuterGlow);

    for (let i = 0; i < opts.pyramidColors.length; i++) {
        
        // let innerGlow = _createInnerGlow(i, mix_hexes('#ffffff', opts.pyramidColors[i]) , 'pyramid');
        // defelement.appendChild(innerGlow);

        let faintOuterGlow = _createFaintOuterGlow(i, mix_hexes('#ffffff', opts.pyramidColors[i]), 'pyramid');
        defelement.appendChild(faintOuterGlow);

        // let outerGlow = _createOuterGlow(i, opts.pyramidColors[i], 'pyramid');
        // defelement.appendChild(outerGlow);
    }

    for (let i = 0; i < opts.racewayColors.length; i++) {

        // let innerGlow = _createInnerGlow(i, mix_hexes('#ffffff', opts.racewayColors[i]), 'raceway');
        // defelement.appendChild(innerGlow);

        let faintOuterGlow = _createFaintOuterGlow(i, mix_hexes('#ffffff', opts.racewayColors[i]), 'raceway');
        defelement.appendChild(faintOuterGlow);

        // let outerGlow = _createOuterGlow(i, opts.racewayColors[i], 'pyramid');
        // defelement.appendChild(outerGlow);
    }

    _appendOneOffs(opts, defelement);
}


// @ts-ignore
function _createInnerGlow(index:number|null, color:string, collection:string|null) {

    let innerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
    let id = `inner-glow`
           + (collection ? `-${collection}` : '')
           + (index || index == 0 ? `-${index}` : '') 
    innerGlow.setAttribute('id', id);
    innerGlow.setAttribute('color-interpolation-filters', 'sRGB');

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

function _createFaintOuterGlow(index: number|null, color: string, collection: string|null) {

    let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
    let id = `faint-outer-glow`
        + (collection ? `-${collection}` : '')
        + (index || index == 0 ? `-${index}` : '')
    outerGlow.setAttribute('id', id);
    outerGlow.setAttribute('color-interpolation-filters', 'sRGB');

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

// @ts-ignore
function _createOuterGlow(index: number, color: string, collection: string) {

    let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
    let id = `outer-glow`
        + (collection ? `-${collection}` : '')
        + (index || index == 0 ? `-${index}` : '')
    outerGlow.setAttribute('id', id);
    outerGlow.setAttribute('color-interpolation-filters', 'sRGB');

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

function _appendOneOffs(_opts:FoundationOptions, defelement:Element) {

    let blur = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        blur.setAttribute('id', `big-blur`);
        blur.setAttribute('color-interpolation-filters', 'sRGB');
        blur.setAttribute('x', `-75%`);
        blur.setAttribute('y', `-75%`);
        blur.setAttribute('width', `250%`);
        blur.setAttribute('height', `250%`);
    let feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceGraphic');
        feGaussianBlur.setAttribute('stdDeviation', `8`);
    blur.appendChild(feGaussianBlur);
    defelement.appendChild(blur);

    blur = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        blur.setAttribute('id', `glow-by-blur`);
        blur.setAttribute('color-interpolation-filters', 'sRGB');
    let feMorphology = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
        feMorphology.setAttribute('operator', "dilate");
        feMorphology.setAttribute('radius', "5");
        feMorphology.setAttribute('in', "SourceGraphic");
    blur.appendChild(feMorphology);
    feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '10');
    blur.appendChild(feGaussianBlur);
    let feComposite = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
        feComposite.setAttribute('operator', 'in');
        feComposite.setAttribute('in2', 'SourceGraphic');
    blur.appendChild(feComposite);
    defelement.appendChild(blur);


    defelement.appendChild(_defineEmboss());
}

function _defineEmboss() {
    let emboss = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
        emboss.setAttribute('id', 'emboss');
        emboss.setAttribute('color-interpolation-filters', 'sRGB');

    {
        let feFlood = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
            feFlood.setAttribute('flood-color', '#000000');
            feFlood.setAttribute('flood-opacity', '0.33');
            feFlood.setAttribute('result', 'blackFlood');
        let feComposite = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
            feComposite.setAttribute('in', 'blackFlood');
            feComposite.setAttribute('in2', 'SourceGraphic');
            feComposite.setAttribute('operator', 'in');
            feComposite.setAttribute('result', 'black');
        let feOffset = document.createElementNS("http://www.w3.org/2000/svg", 'feOffset');
            feOffset.setAttribute('in', 'black');
            feOffset.setAttribute('dx', '0');
            feOffset.setAttribute('dy', '0.5');
            feOffset.setAttribute('result', 'dark');
        let feComposite2 = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
            feComposite2.setAttribute('in', 'dark');
            feComposite2.setAttribute('in2', 'SourceGraphic');
            feComposite2.setAttribute('operator', 'out');
            feComposite2.setAttribute('result', 'darkshadow');
        
        emboss.appendChild(feFlood);
        emboss.appendChild(feComposite);
        emboss.appendChild(feOffset);
        emboss.appendChild(feComposite2);
    }

    {
        let feFlood = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
            feFlood.setAttribute('flood-color', '#ffffff');
            feFlood.setAttribute('flood-opacity', '0.33');
            feFlood.setAttribute('result', 'whiteFlood');
        let feComposite = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
            feComposite.setAttribute('in', 'whiteFlood');
            feComposite.setAttribute('in2', 'SourceGraphic');
            feComposite.setAttribute('operator', 'in');
            feComposite.setAttribute('result', 'white');
        let feOffset = document.createElementNS("http://www.w3.org/2000/svg", 'feOffset');
            feOffset.setAttribute('in', 'white');
            feOffset.setAttribute('dx', '0');
            feOffset.setAttribute('dy', '-0.5');
            feOffset.setAttribute('result', 'light');
        let feComposite2 = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
            feComposite2.setAttribute('in', 'light');
            feComposite2.setAttribute('in2', 'SourceGraphic');
            feComposite2.setAttribute('operator', 'out');
            feComposite2.setAttribute('result', 'lightshadow');
        
        emboss.appendChild(feFlood);
        emboss.appendChild(feComposite);
        emboss.appendChild(feOffset);
        emboss.appendChild(feComposite2);
    }


    let feMerge = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');

    let feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
        feMergeNode.setAttribute('in', 'darkshadow');
    // TODO: CREATE ANOTHER FILTER THAT OVERLAYS THE SOURCEGRAPHIC INSTEAD OF BACKGROUND
    let feMergeNode2 = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
        feMergeNode2.setAttribute('in', 'BackgroundImage');
    let feMergeNode3 = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
        feMergeNode3.setAttribute('in', 'lightshadow');
    
    feMerge.appendChild(feMergeNode);
    feMerge.appendChild(feMergeNode2);
    feMerge.appendChild(feMergeNode3);
    emboss.appendChild(feMerge);

    return emboss;
}