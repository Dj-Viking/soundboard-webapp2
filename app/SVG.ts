export interface ISvg {
    el: SVGElement;
}

export interface IKnob extends ISvg {
    circle: SVGElement,
    rect1: SVGElement,
    rect2: SVGElement,
    rect3: SVGElement,
    rect4: SVGElement,
    path1: SVGPathElement,
}
export interface IFader extends ISvg {
    gRect1: SVGElement,
    gRect2: SVGElement,
    gRect3: SVGElement,
}

export function moveFaderSvgFromMessage(
    fader: IFader, 
    intensity: number, 
    utilsModule: typeof import("./Utils.js")
): void {
    fader.gRect1.setAttribute("y", `${utilsModule.calcPositionFromRange(intensity, 70, 1, 0, 127)}`);
    fader.gRect2.setAttribute("y", `${utilsModule.calcPositionFromRange(intensity, 70, 1, 0, 127)}`);
    fader.gRect3.setAttribute("y", `${utilsModule.calcPositionFromRange(intensity, 70, 1, 0, 127)}`);
}

export function translateKnobRect(
    utilsModule: typeof import("./Utils.js"),
    intensity: number,
): string {
    const rotationPercentage = utilsModule.calcPositionFromRange(intensity, 0, 100, 0, 127);

    const angle = utilsModule.calcPositionFromRange(rotationPercentage, -140, 137, 0, 100);

    const vec2 = { x: 45, y: 62 };

    return `rotate(${angle}, ${vec2.x}, ${vec2.y})`;
}

export function moveSvgFromMessage(
    svgModule: typeof import("./SVG.js"),
    utilsModule: typeof import("./Utils.js"),
    intensity: number,
    knob: IKnob
): void {
    knob.rect1.setAttribute("transform", `${svgModule.translateKnobRect(utilsModule, intensity)}`);
}

export function handleShow(svg: ISvg, isUsing: boolean): void {
    if (isUsing) {
        svg.el.style.display = "block";
    } else {
        svg.el.style.display = "none";
    }
}

abstract class MySVG {
    public el: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    public handleShow(isUsing: boolean) {
        if (isUsing) {
            this.el.style.display = "block";
        } else {
            this.el.style.display = "none";
        }
    }
    // to be overriden
    public moveSvgFromMessage(_intensity: number): void {}
}

export function createFader(): IFader {
    const fader: IFader = {} as any;

    fader.el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    fader.gRect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
    fader.gRect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
    fader.gRect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    
    
    // <svg width="28" height="106" viewBox="0 0 28 106" fill="none" xmlns="http://www.w3.org/2000/svg">
    fader.el.setAttribute("width", "28");
    fader.el.setAttribute("height", "106");
    fader.el.setAttribute("viewBox", "0 0 28 106");
    fader.el.setAttribute("fill", "none");
    fader.el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    fader.el.style.display = "none";

    //  <rect x="11.5" y="0.5" width="5" height="105" stroke="white"/>
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "11.5");
    rect.setAttribute("y", "0.5");
    rect.setAttribute("width", "5");
    rect.setAttribute("height", "105");
    rect.setAttribute("stroke", "white");
    fader.el.appendChild(rect);

    // defs
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    fader.el.appendChild(defs);

    // defs > filter  <filter id="filter0_d_101_2" x="0" y="0" width="28" height="500" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "filter0_d_101_2");
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", "28");
    filter.setAttribute("height", "500");
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    defs.appendChild(filter);

    const feFlood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
    feFlood.setAttribute("flood-opacity", "0");
    feFlood.setAttribute("result", "BackgroundImageFix");
    filter.appendChild(feFlood);

    const feColorMatrix1 = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
    feColorMatrix1.setAttribute("in", "SourceAlpha");
    feColorMatrix1.setAttribute("type", "matrix");
    feColorMatrix1.setAttribute("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
    feColorMatrix1.setAttribute("result", "hardAlpha");
    filter.appendChild(feColorMatrix1);

    const feOffset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset");
    feOffset.setAttribute("dy", "4");
    filter.appendChild(feOffset);

    const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    feGaussianBlur.setAttribute("stdDeviation", "2");
    filter.appendChild(feGaussianBlur);

    const feColorMatrix2 = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
    feColorMatrix2.setAttribute("type", "matrix");
    feColorMatrix2.setAttribute("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0");
    filter.appendChild(feColorMatrix2);

    const feBlend1 = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
    feBlend1.setAttribute("mode", "normal");
    feBlend1.setAttribute("in2", "BackgroundImageFix");
    feBlend1.setAttribute("result", "effect1_dropShadow_101_2");
    filter.appendChild(feBlend1);

    const feBlend2 = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
    feBlend2.setAttribute("mode", "normal");
    feBlend2.setAttribute("in", "SourceGraphic");
    feBlend2.setAttribute("in2", "effect1_dropShadow_101_2");
    feBlend2.setAttribute("result", "shape");
    filter.appendChild(feBlend2);

    // g both fader background and border and middle rect of fader
    // <g filter="url(#filter0_d_101_2)">
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("filter", "url(#filter0_d_101_2)");

    fader.gRect1.setAttribute("x", "4");
    // Y will be modified by the midi controller  - initialize 0 for now i guess
    fader.gRect1.setAttribute("y", "0");
    fader.gRect1.setAttribute("width", "20");
    fader.gRect1.setAttribute("height", "37");
    fader.gRect1.setAttribute("rx", "5");
    fader.gRect1.setAttribute("fill", "black");

    fader.gRect2.setAttribute("x", "5");
    fader.gRect2.setAttribute("y", "0");
    fader.gRect2.setAttribute("width", "18");
    fader.gRect2.setAttribute("height", "37");
    fader.gRect2.setAttribute("rx", "4");
    fader.gRect2.setAttribute("stroke", "white");
    fader.gRect2.setAttribute("stroke-width", "2");

    fader.gRect3.setAttribute("x", "6");
    fader.gRect3.setAttribute("y", "0");
    fader.gRect3.setAttribute("width", "16");
    fader.gRect3.setAttribute("height", "2");
    fader.gRect3.setAttribute("fill", "white");
    fader.gRect3.setAttribute("transform", "translate(0, 16)");
    g.append(fader.gRect1, fader.gRect2, fader.gRect3);

    fader.el.appendChild(g);

    return fader;
}
export function createKnob(
    svgModule: typeof import("./SVG.js"),
    utilsModule: typeof import("./Utils.js")
): IKnob {
    const knob: IKnob = {} as any;

    knob.el = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    knob.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
    knob.rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
    knob.rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
    knob.rect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
    knob.rect4 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
    knob.path1 = document.createElementNS("http://www.w3.org/2000/svg", "path")

    // <svg width="91" height="106" viewBox="0 0 91 136" fill="none" xmlns="http://www.w3.org/2000/svg">
    knob.el.setAttribute("width", "40");
    knob.el.setAttribute("height", "106");
    knob.el.setAttribute("viewBox", "0 0 91 106");
    knob.el.setAttribute("fill", "none");
    knob.el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    knob.el.style.display = "none";
    knob.el.style.marginLeft = "10px";

    knob.circle.setAttribute("cx", "45.5");
    knob.circle.setAttribute("cy", "61.5");
    knob.circle.setAttribute("r", "32.5");
    knob.circle.setAttribute("fill", "white");
    knob.el.appendChild(knob.circle);

    knob.rect1.setAttribute("x", "45");
    knob.rect1.setAttribute("y", "29");
    knob.rect1.setAttribute("width", "4");
    knob.rect1.setAttribute("height", "21");
    knob.rect1.setAttribute("transform", `${svgModule.translateKnobRect(utilsModule, 0)}`);
    knob.rect1.setAttribute("fill", `black`);
    knob.el.appendChild(knob.rect1);

    knob.rect2.setAttribute("x", "44");
    knob.rect2.setAttribute("width", "4");
    knob.rect2.setAttribute("height", "16");
    knob.rect2.setAttribute("fill", "white");
    knob.el.appendChild(knob.rect2);

    knob.rect3.setAttribute("x", "3.75283");
    knob.rect3.setAttribute("y", "108.214");
    knob.rect3.setAttribute("width", "4");
    knob.rect3.setAttribute("height", "16");
    knob.rect3.setAttribute("transform", "rotate(-134.99 3.75283 108.214)");
    knob.rect3.setAttribute("fill", "white");
    knob.el.appendChild(knob.rect3);

    knob.rect4.setAttribute("width", "4");
    knob.rect4.setAttribute("height", "16");
    knob.rect4.setAttribute("transform", "matrix(0.731235 -0.682126 -0.682126 -0.731235 85.9912 109.357)");
    knob.rect4.setAttribute("fill", "white");
    knob.el.appendChild(knob.rect4);

    knob.path1.setAttribute(
        "d",
        "M90.5 62C90.5 87.6967 70.3377 108.5 45.5 108.5C20.6623 108.5 0.5 87.6967 0.5 62C0.5 36.3033 20.6623 15.5 45.5 15.5C70.3377 15.5 90.5 36.3033 90.5 62Z"
    );
    knob.path1.setAttribute("stroke", "white");
    knob.el.appendChild(knob.path1);

    return knob;
}