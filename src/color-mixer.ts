
type Number3 = [number, number, number];
type Number4 = [number, number, number, number];

export function mix_hexes_naive(...hexes: string[]) {
    const rgbs = hexes.map(hex => hex2dec(hex));
    const rgb = rgbs.reduce((acc:number[], cur) => {
        cur.forEach((e, i) => acc[i] = (acc[i] ? acc[i] + e : e));
        return acc;
    }, []).map(e => e / rgbs.length);
    const mixture = rgb2hex(...(rgb as Number3));
    return mixture;
}

function hex2dec(hex: string):Number3 {
    let breakdown = hex.replace('#', '').match(/.{2}/g);
    breakdown = (breakdown == null ? ['0', '0', '0'] : breakdown);
    let dec = breakdown.map(n => parseInt(n, 16));
    return dec as Number3;
}

function rgb2hex(r: number, g: number, b: number): string {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rgb2cmyk(r: number, g: number, b: number):Number4 {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    if (k != 1) {
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);
    } else {
        c = m = y = 0;
    }
    return [c, m, y, k];
}

function cmyk2rgb(c: number, m: number, y: number, k: number):Number3 {
    let r = c * (1 - k) + k;
    let g = m * (1 - k) + k;
    let b = y * (1 - k) + k;
    r = (1 - r) * 255 + .5;
    g = (1 - g) * 255 + .5;
    b = (1 - b) * 255 + .5;
    return [r, g, b];
}


function mix_cmyks(...cmyks: number[][]): Number4 {
    let c = cmyks.map(cmyk => cmyk[0]).reduce((a, b) => a + b, 0) / cmyks.length;
    let m = cmyks.map(cmyk => cmyk[1]).reduce((a, b) => a + b, 0) / cmyks.length;
    let y = cmyks.map(cmyk => cmyk[2]).reduce((a, b) => a + b, 0) / cmyks.length;
    let k = cmyks.map(cmyk => cmyk[3]).reduce((a, b) => a + b, 0) / cmyks.length;
    return [c, m, y, k];
}

export function mix_hexes(...hexes: string[]):string {
    let rgbs = hexes.map(hex => hex2dec(hex));
    let cmyks = rgbs.map(rgb => rgb2cmyk(...rgb));
    let mix_cmyk = mix_cmyks(...cmyks);
    let mix_rgb = cmyk2rgb(...mix_cmyk);
    let mix_hex = rgb2hex(...mix_rgb);
    return mix_hex;
}



export function gradient_rgb(rgb1:Number3, rgb2:Number3, numColors: number): Number3[] {
    let gradient:Number3[] = [];
    for (let i = 0; i < numColors; i++) {
        let newC: Number3 = [0, 0, 0];
        for (let c = 0; c < 3; c++) {
            newC[c] = rgb1[c] + i * (rgb2[c] - rgb1[c]) / (numColors - 1);
        }
        gradient.push([...newC]);
    }
    gradient[numColors - 1] = rgb2;
    return gradient;
}

export function hex_gradient_rgb(hex1:string, hex2:string, numColors:number):string[] {
    let rgb1 = hex2dec(hex1);
    let rgb2 = hex2dec(hex2);
    let grad = gradient_rgb(rgb1, rgb2, numColors);
    let gradient:string[] = [];
    for (let c = 0; c < grad.length; c++) {
        gradient.push(rgb2hex(...grad[c]));
    }
    gradient[numColors - 1] = hex2;
    return gradient;
}



export function hex_gradient_hsl(hex1: string, hex2: string, numColors: number): string[] {
    let rgb1 = hex2dec(hex1);
    let rgb2 = hex2dec(hex2);
    let hsl1 = rgb2hsl(...rgb1);
    let hsl2 = rgb2hsl(...rgb2);

    if (hsl1[1] === 0 || hsl2[1] === 0) {
        return hex_gradient_rgb(hex1, hex2, numColors);
    }

    let grad = gradient_hsv(hsl1, hsl2, numColors, 'long');
    let gradient: string[] = [];
    for (let c = 0; c < grad.length; c++) {
        gradient.push(rgb2hex(...hsl2rgb(...grad[c])));
    }
    gradient[numColors - 1] = hex2;
    return gradient;
}

function rgb2hsl(r: number, g: number, b: number): Number3 {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;
    return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2,
    ];
};

function hsl2rgb(h: number, s: number, l: number): Number3 {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
};

const HSV_MAX: Number3 = [360, 1, 1];

function gradient_hsv(start:Number3, end:Number3, numColors:number, mode:string = 'long'):Number3[] {

    var trigonometric;

    if (typeof mode === 'boolean') {
        trigonometric = mode;
    } else {
        var trigShortest = start[0] < end[0] && end[0] - start[0] < 180 || start[0] > end[0] && start[0] - end[0] > 180;
        trigonometric = mode === 'long' && trigShortest || mode === 'short' && !trigShortest;
    }

    let step: [number, number, number] = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
        step[k] = numColors === 0 ? 0 : (end[k] - start[k]) / (numColors - 1);
    }

    let gradient:Number3[] = [[...start]]; // recompute hue

    let diff;

    if (start[0] <= end[0] && !trigonometric || start[0] >= end[0] && trigonometric) {
        diff = end[0] - start[0];
    } else if (trigonometric) {
        diff = 360 - end[0] + start[0];
    } else {
        diff = 360 - start[0] + end[0];
    }

    step[0] = Math.pow(-1, trigonometric ? 1 : 0) * Math.abs(diff) / (numColors - 1);

    for (var i = 1; i < numColors; i++) {
        var color: Number3 = [0, 0, 0];
        for (let k = 0; k < 3; k++) {
            color[k] = step[k] * i + start[k];
            color[k] = color[k] < 0 ? color[k] + HSV_MAX[k] : HSV_MAX[k] !== 1 ? color[k] % HSV_MAX[k] : color[k];
        }

        gradient.push([...color]);
    }

    return gradient;
}