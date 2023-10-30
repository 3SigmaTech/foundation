import { mix_hexes_naive as mix_hexes } from "./color-mixer";


export function renderFilters(opts, defelement) {

    for (let i = 0; i < opts.colors.length; i++) {
        
        let innerGlow = _createInnerGlow(i, opts.colors[i]);
        defelement.appendChild(innerGlow);

        let faintOuterGlow = _createFaintOuterGlow(i, opts.colors[i]);
        defelement.appendChild(faintOuterGlow);

        let outerGlow = _createOuterGlow(i, opts.colors[i]);
        defelement.appendChild(outerGlow);
    }

    _appendOneOffs(opts, defelement);
}


function _createInnerGlow(index, color) {

    let innerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
    innerGlow.setAttribute('id', `inner-glow-${index}`);

    let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
    filter.setAttribute('flood-color', mix_hexes('#ffffff', color));
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

function _createFaintOuterGlow(index, color) {

    let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
    outerGlow.setAttribute('id', `faint-outer-glow-${index}`);

    let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
    filter.setAttribute('operator', "dilate");
    filter.setAttribute('radius', "1");
    filter.setAttribute('in', "SourceAlpha");
    filter.setAttribute('result', "thicken");
    outerGlow.appendChild(filter);
    
    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
    filter.setAttribute('in', 'thicken');
    filter.setAttribute('stdDeviation', '3');
    filter.setAttribute('result', 'blurred');
    outerGlow.appendChild(filter);

    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
    filter.setAttribute('flood-color', mix_hexes('#ffffff', color));
    filter.setAttribute('result', 'glowcolor');
    outerGlow.appendChild(filter);

    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
    filter.setAttribute('in', 'glowcolor');
    filter.setAttribute('in2', 'blurred');
    filter.setAttribute('operator', 'in');
    filter.setAttribute('result', 'colored_glow');
    outerGlow.appendChild(filter);

    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');

    let subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
    subfilter.setAttribute('in', 'colored_glow');
    filter.appendChild(subfilter);

    subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
    subfilter.setAttribute('in', 'SourceGraphic');
    filter.appendChild(subfilter);

    outerGlow.appendChild(filter);

    return outerGlow;
}

function _createOuterGlow(index, color) {

    let outerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
    outerGlow.setAttribute('id', `outer-glow-${index}`);

    let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMorphology');
    filter.setAttribute('operator', "dilate");
    filter.setAttribute('radius', "1");
    filter.setAttribute('in', "SourceAlpha");
    filter.setAttribute('result', "thicken");
    outerGlow.appendChild(filter);

    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feGaussianBlur');
    filter.setAttribute('in', 'thicken');
    filter.setAttribute('stdDeviation', '3');
    filter.setAttribute('result', 'blurred');
    outerGlow.appendChild(filter);

    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
    filter.setAttribute('flood-color', color);
    filter.setAttribute('result', 'glowcolor');
    outerGlow.appendChild(filter);

    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feComposite');
    filter.setAttribute('in', 'glowcolor');
    filter.setAttribute('in2', 'blurred');
    filter.setAttribute('operator', 'in');
    filter.setAttribute('result', 'colored_glow');
    outerGlow.appendChild(filter);

    filter = document.createElementNS("http://www.w3.org/2000/svg", 'feMerge');

    let subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
    subfilter.setAttribute('in', 'colored_glow');
    filter.appendChild(subfilter);

    subfilter = document.createElementNS("http://www.w3.org/2000/svg", 'feMergeNode');
    subfilter.setAttribute('in', 'SourceGraphic');
    filter.appendChild(subfilter);

    outerGlow.appendChild(filter);

    return outerGlow;
}

function _appendOneOffs(opts, defelement) {


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