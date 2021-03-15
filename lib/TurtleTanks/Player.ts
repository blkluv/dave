import { fabric } from 'fabric';

import { loadImage } from './Utilities';
import { pickRandomItem } from '../Utilities';
import { faces, bodies } from './Avatar';

import {
    Coordinate,
} from './Types';

import {
    PIXELS_PER_TILE,
    AVATAR_SIZES,
    HIGHLIGHT_COLOR,
    HIGHLIGHT_OUTLINE_WIDTH,
} from './Constants';

export class Player {
    public userId: string;

    public coords: Coordinate;

    public bodyFilePath: string | undefined;
    public faceFilePath: string | undefined;

    private body: fabric.Image | undefined;
    private face: fabric.Image | undefined;
    private highlight: fabric.Circle | undefined;

    constructor(
        userId: string,
        coords: Coordinate,
        bodyFilePath?: string,
        faceFilePath?: string) {

        this.userId = userId;
        this.coords = coords;
        this.bodyFilePath = bodyFilePath;
        this.faceFilePath = faceFilePath;
    }

    private async init(canvas: fabric.StaticCanvas) {
        if (this.body && this.face && this.highlight) {
            return;
        }

        if (!this.bodyFilePath) {
            this.bodyFilePath = pickRandomItem(bodies);
        }

        if (!this.faceFilePath) {
            this.faceFilePath = pickRandomItem(faces);
        }

        const bodyPromise = loadImage(`bodies/${AVATAR_SIZES}/${this.bodyFilePath}`);
        const facePromise = loadImage(`faces/${AVATAR_SIZES}/${this.faceFilePath}`);

        this.body = await bodyPromise;
        this.face = await facePromise;
        this.highlight = new fabric.Circle({
            radius: (PIXELS_PER_TILE / 2) * 0.8,
            stroke: HIGHLIGHT_COLOR,
            strokeWidth: HIGHLIGHT_OUTLINE_WIDTH,
            fill: 'rgba(0,0,0,0)',
            originX: 'center',
            originY: 'center',
        });

        canvas.add(this.highlight);
        canvas.add(this.body);
        canvas.add(this.face);
    }

    public async render(
        canvas: fabric.StaticCanvas,
        widthOffset: number,
        heightOffset: number,
        highlightPlayer: boolean) {

        await this.init(canvas);

        this.body!.set({
            left: widthOffset + (PIXELS_PER_TILE * 0.5),
            top: heightOffset + (PIXELS_PER_TILE * 0.5),
            originX: 'center',
            originY: 'center',
        });

        this.face!.set({
            left: widthOffset + (PIXELS_PER_TILE * 0.5),
            top: heightOffset + (PIXELS_PER_TILE * 0.5),
            originX: 'center',
            originY: 'center',
        });

        if (highlightPlayer) {
            this.highlight!.set({
                left: widthOffset + (PIXELS_PER_TILE * 0.5),
                top: heightOffset + (PIXELS_PER_TILE * 0.5),
            });
        }

        this.highlight!.visible = highlightPlayer;
    }

    public dimensionsOnCanvas() {
        return {
            width: PIXELS_PER_TILE,
            height: PIXELS_PER_TILE,
        }
    }

    public remove(canvas: fabric.StaticCanvas) {
        if (this.face) {
            canvas.remove(this.face);
        }
        
        if (this.body) {
            canvas.remove(this.body);
        }

        if (this.highlight) {
            canvas.remove(this.highlight);
        }
    }
}