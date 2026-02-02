import { Interface } from './Interface.js';
import { ticker } from '../tween/Ticker.js';

interface StageInstance extends Interface {
    root: HTMLElement | null;
    rootStyle: CSSStyleDeclaration | null;
    init: (element?: HTMLElement) => void;
}

export const Stage: StageInstance = new Interface(null, null) as unknown as StageInstance;

Stage.root = null;
Stage.rootStyle = null;

Stage.init = (element: HTMLElement = document.body) => {
    Stage.element = element;

    Stage.root = document.querySelector(':root');
    Stage.rootStyle = getComputedStyle(Stage.root!);

    ticker.start();
};
