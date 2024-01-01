
import type { FoundationEmbeddedContent } from "./foundation-utils";

export function embedContent(opts: FoundationEmbeddedContent) {
    let fx = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    fx.setAttribute('x', opts.x.toString());
    fx.setAttribute('y', opts.y.toString());
    fx.setAttribute('width', opts.width.toString());
    fx.setAttribute('height', opts.height.toString());
    fx.setAttribute('id', opts.contextId);

    if (!opts.content) { return; }

    if (opts.content.htmlFile) {
        fetch(opts.content.htmlFile)
            .then((response) => { return (response.ok ? response.text() : ''); })
            .then((html) => {
                fx.innerHTML = html;
                opts.svg.appendChild(fx);
            });
    } else if (opts.content.svgFile) {
        fetch(opts.content.svgFile)
            .then((response) => { return response.text() })
            .then((data) => {
                opts.svg.insertAdjacentHTML('beforeend', `<g id="${opts.contextId}">${data}</g>`);
                setTimeout(() => {
                    // @ts-ignore
                    let lcg = opts.svg.getElementById(opts.contextId);
                    let lcgBB = lcg.getBBox();
                    let vOffset = (opts.height - lcgBB.height) / 2;
                    let hOffset = (opts.width - lcgBB.width) / 2;
                    lcg.setAttribute('transform', `translate(${hOffset} ${vOffset})`);
                }, 500);
            });
    } else if (opts.content.html) {
        fx.innerHTML = opts.content.html;
        opts.svg.appendChild(fx);
    } else if (opts.content.svg) {
        opts.svg.insertAdjacentHTML('beforeend', opts.content.svg);
    }
}

export type RectPathOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    radii: [number, number, number, number];
}
export function roundedRectPath(opts:RectPathOptions) {
    let pathStr = `M${opts.x},${opts.y + opts.radii[0]} `;
    pathStr += getTopLeftRoundedNinety(opts.radii[0]);
    pathStr += `h${opts.width - opts.radii[0] - opts.radii[1]} `;
    pathStr += getTopRightRoundedNinety(opts.radii[1]);
    pathStr += `v${opts.height - opts.radii[1] - opts.radii[2]} `;
    pathStr += getBottomRightRoundedNinety(opts.radii[2]);
    pathStr += `h-${opts.width - opts.radii[2] - opts.radii[3]} `;
    pathStr += getBottomLeftRoundedNinety(opts.radii[3]);
    pathStr += `v-${opts.height - opts.radii[3] - opts.radii[0]} Z`;
    return pathStr;
}

export function getTopLeftRoundedNinety(radius:number, clockwise = true) {
    if (clockwise) {
        return `q0,-${radius} ${radius},-${radius}`;
    } else {
        return `q-${radius},0 -${radius},${radius}`;
    }
}

export function getTopRightRoundedNinety(radius: number, clockwise = true) {
    if (clockwise) {
        return `q${radius},0 ${radius},${radius}`;
    } else {
        return `q0,-${radius} -${radius},-${radius}`;
    }
}
export function getBottomLeftRoundedNinety(radius: number, clockwise = true) {
    if (clockwise) {
        return `q-${radius},0 -${radius},-${radius}`;
    } else {
        return `q0,${radius} ${radius},${radius}`;
    }
}
export function getBottomRightRoundedNinety(radius: number, clockwise = true) {
    if (clockwise) {
        return `q0,${radius} -${radius},${radius}`;
    } else {
        return `q${radius},0 ${radius},-${radius}`;
    }
}



export type ContainedTextOptions = {
    svg: Element;
    text: string;
    x: number;
    y: number;
    textStyle: string;
    padding: number;
    centered?: boolean;
    [index:string]:any;
};
export function drawContainedText(opts: ContainedTextOptions):{label:Element,background:Element,group:Element} {

    let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');

    let text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    text.setAttribute('x', opts.x.toString());
    text.setAttribute('y', opts.y.toString());
    text.setAttribute('style', opts.textStyle);
    if (opts.centered !== undefined && !opts.centered) {
        text.setAttribute('class', 'uncentered');
    }

    var textNode = document.createTextNode(opts.text);
    text.appendChild(textNode);

    g.appendChild(text);
    opts.svg.appendChild(g);

    let textRect = text.getBBox();
    let padding = opts.padding;
    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", (textRect.x - padding).toString());
    rect.setAttribute("y", (textRect.y - padding).toString());
    rect.setAttribute("rx", padding.toString());
    rect.setAttribute("ry", padding.toString());
    rect.setAttribute("width", (textRect.width + 2 * padding).toString());
    rect.setAttribute("height", (textRect.height + 2 * padding).toString());
    
    g.insertBefore(rect, text);

    return {
        label: text,
        background: rect,
        group: g
    };
}

export type RectOptions = {
    x: number;
    y: number;
    width: number;
    height: number;
    style?: string;
    svg: Element;
    [index:string]: any;
};
export function drawRect(opts:RectOptions):Element {
    let poly = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    poly.setAttribute('x', opts.x.toString());
    poly.setAttribute('y', opts.y.toString());
    poly.setAttribute('width', opts.width.toString());
    poly.setAttribute('height', opts.height.toString());
    if (opts.style) {
        poly.setAttribute('style', opts.style);
    }
    opts.svg.appendChild(poly);
    return poly;
}


export type FilledPathOptions = {
    path:string;
    style:string;
    useFlatColors?:boolean;
    svg:Element;
};
export function drawFilledPath(opts:FilledPathOptions) {
    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', opts.path);
    path.setAttribute('style', opts.style + 'stroke-width:0;');
    if (!opts.useFlatColors) {
        //path.setAttribute('filter', `url(#inner-glow-pyramid-${i})`);
        path.setAttribute('filter', 'url(#glow-by-blur)');
    }
    opts.svg.appendChild(path);

    // Re-render path to get dark stroke (which is affected by filter on first path)
    path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', opts.path);
    path.setAttribute('style', opts.style + 'fill:none;');
    opts.svg.appendChild(path);
}