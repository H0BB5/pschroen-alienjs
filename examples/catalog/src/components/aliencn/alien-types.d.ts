// Interim ambient declarations for @alienkitty/alien.js, which does not yet
// publish its own TypeScript declarations to npm. Only the surface used by
// the Aliencn components is declared. Delete this file once an
// @alienkitty/alien.js release ships bundled types.
declare module '@alienkitty/alien.js/three' {
  import type { Vector3 } from 'three';

  export class Wobble {
    constructor(position?: Vector3);
    scale: number;
    lerpSpeed: number;
    update(time: number): void;
  }
}
