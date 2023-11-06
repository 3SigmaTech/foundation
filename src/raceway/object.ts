import type { FoundationOptions, FoundationContent, RacewayData } from "../foundation-utils";
import * as utils from '../foundation-utils';
import * as svgutils from '../svg-utils';
import { mix_hexes } from "../color-mixer";


export type RacewaySection = {
    text: string;
    cx: number;
    cy: number;
    points: number[][];
    body: {
        content: FoundationContent;
        x: number;
        y: number;
        width: number;
        height: number;
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
    labels: {
        cx: number,
        cy: number,
        text: string
    }[]
};

export function generateRaceway(data:RacewayData, opts:FoundationOptions, x0: number, y0: number): RacewayObject {

    let padding = opts.padding;
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


    let racewayLabels = [{
        cx: track[6][0] + (track[12][0] - track[6][0]) / 2,
        cy: track[7][1] + (track[6][1] - track[7][1]) / 2,
        text: opts.racewayLabel
    }, {
        cx: track[13][0] + (track[3][0] - track[13][0]) / 2,
        cy: track[2][1] + (track[3][1] - track[2][1]) / 2,
        text: opts.racewayLabel
    }];

    return {sections: sections, track: track, gradient: gradient, labels: racewayLabels};

}


export function renderRaceway(raceway:RacewayObject, opts:FoundationOptions) {
    _renderRacewayGradient(raceway, opts);
    _renderRacewaySections(raceway, opts);
    _renderRacewayTrack(raceway, opts);
}


function _renderRacewayGradient(raceway: RacewayObject, opts: FoundationOptions) {
    let defs = utils.getDefs(opts);
    
    let linearGradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
    linearGradient.setAttribute('id', `raceway-gradient`);
    linearGradient.setAttribute('color-interpolation-filters', 'sRGB');

    for (let i = 0; i < raceway.gradient.length; i++) {
        let stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
        stop.setAttribute('stop-color', `${raceway.gradient[i].color}`);
        stop.setAttribute('offset', `${raceway.gradient[i].offset}%`);
        linearGradient.appendChild(stop);
    }
    defs.appendChild(linearGradient);


    linearGradient = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
    linearGradient.setAttribute('id', `raceway-gradient-dark`);
    linearGradient.setAttribute('color-interpolation-filters', 'sRGB');

    for (let i = 0; i < raceway.gradient.length; i++) {
        let stop = document.createElementNS("http://www.w3.org/2000/svg", 'stop');
        stop.setAttribute('stop-color', `${mix_hexes('#000000', raceway.gradient[i].color)}`);
        stop.setAttribute('offset', `${raceway.gradient[i].offset}%`);
        linearGradient.appendChild(stop);
    }
    defs.appendChild(linearGradient);
}

function _renderRacewaySections(raceway: RacewayObject, opts: FoundationOptions) {
    let svg = utils.getSVG(opts);
    let padding = opts.padding;

    // Render in reverse to clean up very small imperfection in drawing
    for (let i = raceway.sections.length - 1; i >= 0; i--) {
        let styleStr = 'stroke-width:1;';
        styleStr += `fill:none;`;
        styleStr += `stroke:${mix_hexes(opts.racewayColors[i], "#000000")};`;

        svgutils.drawRect({
            ...raceway.sections[i].body,
            style: styleStr,
            svg: svg
        });
        
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

        svgutils.drawFilledPath({
            path: pathStr,
            style: styleStr,
            useFlatColors: opts.useFlatColors,
            svg: svg
        });

        let tBox = svgutils.drawContainedText({
            svg: svg,
            text: raceway.sections[i].text,
            x: raceway.sections[i].cx,
            y: raceway.sections[i].cy,
            textStyle: opts.labelStyle,
            padding: opts.padding
        });
        tBox.background.setAttribute("fill", `${mix_hexes(opts.racewayColors[i], mix_hexes(opts.racewayColors[i], "#000000"))}`);
        if (!opts.useFlatColors) {
            tBox.background.setAttribute('filter', `url(#big-blur)`);
        }
    }
}

function _renderRacewayTrack(raceway: RacewayObject, opts: FoundationOptions) {
    let svg = utils.getSVG(opts);

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

    let styleStr = 'stroke-width:1;';
    styleStr += `fill:url(#raceway-gradient);`;
    styleStr += `stroke:url(#raceway-gradient-dark);`;
    styleStr += `stroke-miterlimit:10;`;

    svgutils.drawFilledPath({
        path: pathStr,
        style: styleStr,
        useFlatColors: opts.useFlatColors,
        svg: svg
    });



    // Renders embossed labels on the racetrack
    let rotations = [-90, 90];
    for (let i = 0; i < raceway.labels.length; i++) {

        styleStr = opts.labelStyle;
        styleStr += `letter-spacing:0.05em;`

        let tBox = svgutils.drawContainedText({
            svg: svg,
            text: raceway.labels[i].text,
            x: raceway.labels[i].cx,
            y: raceway.labels[i].cy,
            textStyle: styleStr,
            padding: opts.padding
        });
        tBox.group.setAttribute('filter', 'url(#emboss)');
        tBox.label.setAttribute("transform", `rotate(${rotations[i]} ${raceway.labels[i].cx} ${raceway.labels[i].cy})`);
        tBox.background.setAttribute("transform", `rotate(${rotations[i]} ${raceway.labels[i].cx} ${raceway.labels[i].cy})`);
        tBox.background.setAttribute("fill", `none`);

    }
}
