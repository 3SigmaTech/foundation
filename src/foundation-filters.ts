import type { FoundationOptions } from "./foundation-utils";

import { mix_hexes_naive as mix_hexes } from "./color-mixer";

export function renderFilters(opts:FoundationOptions, defelement:Element) {

    for (let i = 0; i < opts.pyramidColors.length; i++) {
        
        let innerGlow = _createInnerGlow(i, mix_hexes('#ffffff', opts.pyramidColors[i]) , 'pyramid');
        defelement.appendChild(innerGlow);

        let faintOuterGlow = _createFaintOuterGlow(i, mix_hexes('#ffffff', opts.pyramidColors[i]), 'pyramid');
        defelement.appendChild(faintOuterGlow);

        // let outerGlow = _createOuterGlow(i, opts.pyramidColors[i], 'pyramid');
        // defelement.appendChild(outerGlow);
    }

    for (let i = 0; i < opts.racewayColors.length; i++) {

        let innerGlow = _createInnerGlow(i, mix_hexes('#ffffff', opts.racewayColors[i]), 'raceway');
        defelement.appendChild(innerGlow);

        let faintOuterGlow = _createFaintOuterGlow(i, mix_hexes('#ffffff', opts.racewayColors[i]), 'raceway');
        defelement.appendChild(faintOuterGlow);

        // let outerGlow = _createOuterGlow(i, opts.racewayColors[i], 'pyramid');
        // defelement.appendChild(outerGlow);
    }

    _appendOneOffs(opts, defelement);
}


function _createInnerGlow(index:number, color:string, collection:string) {

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

function _createFaintOuterGlow(index: number, color: string, collection: string) {

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

// function _createOuterGlow(index: number, color: string, collection: string) {
//
//     let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
//     outerGlow.setAttribute('id', `outer-glow-${collection}-${index}`);
//
//     let feMorphology = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
//     feMorphology.setAttribute('operator', "dilate");
//     feMorphology.setAttribute('radius', "1");
//     feMorphology.setAttribute('in', "SourceAlpha");
//     feMorphology.setAttribute('result', "thicken");
//     outerGlow.appendChild(feMorphology);
//
//     let feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
//     feGaussianBlur.setAttribute('in', 'thicken');
//     feGaussianBlur.setAttribute('stdDeviation', '3');
//     feGaussianBlur.setAttribute('result', 'blurred');
//     outerGlow.appendChild(feGaussianBlur);
//
//     let feFlood = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
//     feFlood.setAttribute('flood-color', color);
//     feFlood.setAttribute('result', 'glowcolor');
//     outerGlow.appendChild(feFlood);
//
//     let feComposite = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
//     feComposite.setAttribute('in', 'glowcolor');
//     feComposite.setAttribute('in2', 'blurred');
//     feComposite.setAttribute('operator', 'in');
//     feComposite.setAttribute('result', 'colored_glow');
//     outerGlow.appendChild(feComposite);
//
//     let feMerge = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');
//
//     let feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
//     feMergeNode.setAttribute('in', 'colored_glow');
//     feMerge.appendChild(feMergeNode);
//
//     feMergeNode = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
//     feMergeNode.setAttribute('in', 'SourceGraphic');
//     feMerge.appendChild(feMergeNode);
//
//     outerGlow.appendChild(feMerge);
//
//     return outerGlow;
// }

function _appendOneOffs(_opts:FoundationOptions, defelement:Element) {


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