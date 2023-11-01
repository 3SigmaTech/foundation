import type { FoundationOptions, FoundationContent, RacewayData } from "../foundation-utils";
import * as utils from '../foundation-utils';
import * as svgutils from '../svg-utils';
import { mix_hexes_naive as mix_hexes } from '../color-mixer';

export type RacewaySection = {
    text: string;
    cx: number;
    cy: number;
    points: number[][];
    body: {
        content: FoundationContent;
        //cx: number;
        //cy: number;
        x: number;
        y: number;
        width: number;
        height: number;
        //row: number;
    }
};
export type GradientStop = {
    color: string;
    offset: number;
};
export type RacewayObject = {
    sections: RacewaySection[];
    track: number[][];
    gradient: GradientStop[];
};

export function generateRaceway(data:RacewayData, opts:FoundationOptions, x0: number, y0: number): RacewayObject {

    let padding = utils.getPadding(opts);
    let lastChevronOffset = -1 * (opts.racewayTitleHeight/2 - opts.racewayChevronDepth);

    let widthUnits = 0;
    for (let i = 0; i < opts.racewayLevels; i++) {
        widthUnits += (data[i].contextWidth ?? 1);
    }

    let racewayHeight = opts.racewayTitleHeight;
    let racewayWidth = opts.width - 2 * padding - 2 * racewayHeight;
    let sectionWidth = racewayWidth / widthUnits;
    
    let sectionHeight = opts.height - y0 - 2 * racewayHeight - padding;
    let miterOffset = 0.5 / Math.sin(Math.atan(racewayHeight / (2 * opts.racewayChevronDepth)));

    let sections:RacewaySection[] = [];

    let pt = [x0 + racewayHeight, y0];

    for (let i = 0; i < opts.racewayLevels; i++) {

        let myWidth = sectionWidth * (data[i].contextWidth ?? 1);
        let pts:number[][] = [];

        // Start in the upper left corner of the section and go clockwise
        pts.push([...pt]);

        // Top right corner
        pt[0] += myWidth;
        let nextP0 = [pt[0], pt[1]];
        pts.push([...pt]);

        // Right chevron point
        pt[0] += opts.racewayChevronDepth;
        pt[1] += racewayHeight / 2;
        pts.push([...pt]);

        // Bottom right corner
        pt[0] -= opts.racewayChevronDepth;
        pt[1] += racewayHeight / 2;
        pts.push([...pt]);
        
        // Bottom left corner
        pt[0] -= myWidth;
        pts.push([...pt]);
        let bodypt = [...pt];

        // Left chevron point
        pt[0] += opts.racewayChevronDepth;
        pt[1] -= racewayHeight / 2;
        pts.push([...pt]);

        // Inset the last chevron a bit
        if (i == data.length - 1) {
            pts[1][0] -= lastChevronOffset;
            pts[2][0] -= lastChevronOffset;
            pts[3][0] -= lastChevronOffset;
        }

        // Update x-coords to account for stroke
        // Otherwise there is a strange looking offset at high zooms
        if (i > 0) {
            pts[0][0] += miterOffset;
            pts[4][0] += miterOffset;
            pts[5][0] += miterOffset;
        }
        pts[1][0] -= miterOffset;
        pts[2][0] -= miterOffset;
        pts[3][0] -= miterOffset;


        sections.push({
            text: data[i].label,
            cx: pts[0][0] + (pts[2][0] - pts[0][0]) / 2,
            cy: pts[1][1] + (pts[3][1] - pts[1][1]) / 2,
            points: [...pts],
            body: {
                content: {...data[i].content},
                x: bodypt[0],
                y: bodypt[1],
                width: myWidth - 1,
                height: sectionHeight
            }
        });

        pt = [...nextP0];
    }

    let racetrackRadius = opts.racewayRadius;

    let track:number[][] = [];
    // 0
    pt = [
        opts.width - padding - racewayHeight - lastChevronOffset + (lastChevronOffset > 0 ? miterOffset : 0),
        y0
    ];
    track.push([...pt]);

    // 1
    pt[0] += lastChevronOffset + (racewayHeight - racetrackRadius);
    track.push([...pt]);

    // 2
    pt[0] += racetrackRadius;
    pt[1] += racetrackRadius;
    track.push([...pt]);

    // 3
    pt[1] += sectionHeight + 2 * (racewayHeight - racetrackRadius);
    track.push([...pt]);

    // 4
    pt[0] -= racetrackRadius;
    pt[1] += racetrackRadius;
    track.push([...pt]);

    // 5
    pt[0] = padding + racetrackRadius;
    track.push([...pt]);

    // 6
    pt[0] -= racetrackRadius;
    pt[1] -= racetrackRadius;
    track.push([...pt]);

    // 7
    pt[1] -= (sectionHeight + 2 * (racewayHeight - racetrackRadius));
    track.push([...pt]);

    // 8
    pt[0] += racetrackRadius - 1;
    pt[1] -= racetrackRadius;
    track.push([...pt]);

    // 9
    pt[0] += (racewayHeight - racetrackRadius);
    track.push([...pt]);

    // 10
    pt[0] += opts.racewayChevronDepth;
    pt[1] += racewayHeight / 2;
    track.push([...pt]);

    // 11
    pt[0] -= opts.racewayChevronDepth;
    pt[1] += racewayHeight / 2;
    track.push([...pt]);

    // 12
    pt[1] += sectionHeight + 1;
    track.push([...pt]);

    // 13
    pt[0] += racewayWidth + 1;
    track.push([...pt]);

    // To fully inset stroke
    let wrapTop = 1;
    if (lastChevronOffset == 0) {
        wrapTop = 0;
    }

    // 14
    pt[1] -= (sectionHeight + 1 + wrapTop);
    track.push([...pt]);

    // To fully inset the stroke
    let insetMiterOffset = 1/Math.tan(Math.atan(racewayHeight / (2 * opts.racewayChevronDepth)));
    if (lastChevronOffset == 0) {
        insetMiterOffset = 0;
    }

    // 15
    if (lastChevronOffset > 0) {
        pt[0] -= (lastChevronOffset - miterOffset - insetMiterOffset);
        track.push([...pt]);
    }

    // 16
    pt[0] += (opts.racewayChevronDepth - insetMiterOffset);
    pt[1] -= (racewayHeight / 2 - wrapTop);
    track.push([...pt]);


    let gradient:GradientStop[] = [];

    let trackWidth = opts.width - 2 * padding;

    let cumulativeDist = racewayHeight;
    for (let i = 0; i < data.length; i++) {
        cumulativeDist += 0.5 * sectionWidth * (data[i].contextWidth ?? 1);
        
        gradient.push({
            color: opts.racewayColors[i],
            offset: 100 * (cumulativeDist / trackWidth)
        });

        cumulativeDist += 0.5 * sectionWidth * (data[i].contextWidth ?? 1);
    }

    return {sections: sections, track: track, gradient: gradient};

}


export function renderRaceway(raceway:RacewayObject, opts:FoundationOptions) {

    let svg = utils.getSVG(opts);
    let padding = utils.getPadding(opts);

    let defs = svg.getElementsByTagNameNS("http://www.w3.org/2000/svg", 'defs')[0];

    let linearGradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
    linearGradient.setAttribute('id', `raceway-gradient`);
    for (let i = 0; i < raceway.gradient.length; i++) {
        let stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
        stop.setAttribute('stop-color', `${raceway.gradient[i].color}`);
        stop.setAttribute('offset', `${raceway.gradient[i].offset}%`);
        linearGradient.appendChild(stop);
    }
    defs.appendChild(linearGradient);

    linearGradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
    linearGradient.setAttribute('id', `raceway-gradient-light`);
    for (let i = 0; i < raceway.gradient.length; i++) {
        let stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
        stop.setAttribute('stop-color', `${mix_hexes("#ffffff", mix_hexes("#ffffff", raceway.gradient[i].color))}`);
        stop.setAttribute('offset', `${raceway.gradient[i].offset}%`);
        linearGradient.appendChild(stop);
    }
    defs.appendChild(linearGradient);


    linearGradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
    linearGradient.setAttribute('id', `raceway-gradient-dark`);
    for (let i = 0; i < raceway.gradient.length; i++) {
        let stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
        stop.setAttribute('stop-color', `${mix_hexes("#000000", raceway.gradient[i].color)}`);
        stop.setAttribute('offset', `${raceway.gradient[i].offset}%`);
        linearGradient.appendChild(stop);
    }
    defs.appendChild(linearGradient);


    let innerGlow = document.createElementNS("http://www.w3.org/2000/svg", 'filter');
    innerGlow.setAttribute('id', `inner-glow-raceway`);

    let filter = document.createElementNS("http://www.w3.org/2000/svg", 'feFlood');
    filter.setAttribute('flood-color', 'url(#raceway-gradient-light)');
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

    defs.appendChild(innerGlow);









    // Render in reverse to clean up very small imperfect in drawing
    for (let i = raceway.sections.length - 1; i >= 0; i--) {
        let styleStr = 'stroke-width:1;';
        styleStr += `fill:none;`;
        styleStr += `stroke:${mix_hexes(opts.racewayColors[i], "#000000")};`;

        let poly = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
        poly.setAttribute('x', raceway.sections[i].body.x.toString());
        poly.setAttribute('y', raceway.sections[i].body.y.toString());
        poly.setAttribute('width', raceway.sections[i].body.width.toString());
        poly.setAttribute('height', raceway.sections[i].body.height.toString());
        poly.setAttribute('style', styleStr);
        svg.appendChild(poly);

        svgutils.embedContent({
            x: raceway.sections[i].body.x + 0.5 * padding,
            y: raceway.sections[i].body.y + 0.5 * padding,
            width: raceway.sections[i].body.width - 1,
            height: raceway.sections[i].body.height,
            svg: svg,
            content: { ...raceway.sections[i].body.content },
            contextId: `racewayContext-${i}`
        });

        styleStr = 'stroke-width:1;';
        styleStr += `fill:${opts.racewayColors[i]};`;
        styleStr += `stroke:${mix_hexes(opts.racewayColors[i], "#000000")};`;
        styleStr += `stroke-miterlimit:10;`;

        let pathStr = `M ${raceway.sections[i].points[0][0]} ${raceway.sections[i].points[0][1]} `;
        for (let j = 1; j < raceway.sections[i].points.length; j++) {
            pathStr += `L ${raceway.sections[i].points[j][0]} ${raceway.sections[i].points[j][1]} `;
        }
        pathStr += 'Z';

        let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', pathStr);
        path.setAttribute('style', styleStr);
        if (!opts.useFlatColors) {
            path.setAttribute('filter', `url(#inner-glow-raceway-${i})`);
            //path.setAttribute('filter', 'url(#simple-blur)');

        }
        svg.appendChild(path);

        // Render again to get proper stroke colors
        styleStr = 'stroke-width:1;';
        styleStr += `fill:none;`;
        styleStr += `stroke:${mix_hexes(opts.racewayColors[i], "#000000")};`;
        styleStr += `stroke-miterlimit:10;`;
        
        path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        path.setAttribute('d', pathStr);
        path.setAttribute('style', styleStr);
        svg.appendChild(path);

        let tBox = svgutils.drawContainedText({
            svg: svg,
            text: raceway.sections[i].text,
            x: raceway.sections[i].cx,
            y: raceway.sections[i].cy,
            textStyle: opts.labelStyle,
            padding: utils.getPadding(opts)
        });
        tBox.background.setAttribute("fill", `${mix_hexes(opts.racewayColors[i], mix_hexes(opts.racewayColors[i], "#000000"))}`);
        if (!opts.useFlatColors) {
            tBox.background.setAttribute('filter', `url(#big-blur)`);
        }
    }

    let racetrackRadius = opts.racewayRadius;

    let pathStr = `M ${raceway.track[0][0]} ${raceway.track[0][1]} `;
    for (let j = 1; j < raceway.track.length; j++) {
        if (j == 2) {
            pathStr += svgutils.getTopRightRoundedNinety(racetrackRadius);
        }
        if (j == 4) {
            pathStr += svgutils.getBottomRightRoundedNinety(racetrackRadius);
        }
        if (j == 6) {
            pathStr += svgutils.getBottomLeftRoundedNinety(racetrackRadius);
        }
        if (j == 8) {
            pathStr += svgutils.getTopLeftRoundedNinety(racetrackRadius);
        } else {
            pathStr += `L ${raceway.track[j][0]} ${raceway.track[j][1]} `;
        }
    }
    pathStr += 'Z';

    let styleStr = 'stroke-width:0;';
    styleStr += `fill:url(#raceway-gradient);`;
    styleStr += `stroke:${mix_hexes('#999999', "#000000")};`;
    styleStr += `stroke-miterlimit:10;`;

    let path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', pathStr);
    path.setAttribute('style', styleStr);
    path.setAttribute('id', 'raceway-track');
    if (!opts.useFlatColors) {
        path.setAttribute('filter', 'url(#simple-blur)');
        //path.setAttribute('filter', `url(#inner-glow)`);
        //path.setAttribute('filter', `url(#inner-glow-raceway)`);
    }
    svg.appendChild(path);

    styleStr = 'stroke-width:1;';
    styleStr += `fill:none;`;
    styleStr += `stroke:url(#raceway-gradient-dark);`;
    styleStr += `stroke-miterlimit:10;`;

    path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    path.setAttribute('d', pathStr);
    path.setAttribute('style', styleStr);
    path.setAttribute('id', 'raceway-track-stroke');
    svg.appendChild(path);
}