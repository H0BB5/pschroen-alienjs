'use client';

import * as React from 'react';
import type { ColorRepresentation } from 'three';

import { cn } from '{{utils}}/cn';

export interface ShaderCanvasProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  color?: ColorRepresentation;
  speed?: number;
  intensity?: number;
  label?: string;
}

export function ShaderCanvas({
  color = '#8f7cff',
  speed = 0.5,
  intensity = 0.75,
  label = 'Animated abstract shader',
  className,
  ...props
}: ShaderCanvasProps): React.JSX.Element {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import('three'), import('@alienkitty/alien.js/three')])
      .then(([three, alien]) => {
        if (disposed) return;
        const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        const scene = new three.Scene();
        const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        const geometry = new three.PlaneGeometry(2, 2);
        const uniforms = {
          uTime: { value: 0 },
          uColor: { value: new three.Color(color) },
          uIntensity: { value: intensity }
        };
        const material = new three.ShaderMaterial({
          uniforms,
          transparent: true,
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform float uIntensity;
            uniform vec3 uColor;
            varying vec2 vUv;
            void main() {
              vec2 p = vUv - 0.5;
              float radius = length(p);
              float wave = sin(radius * 22.0 - uTime * 2.4) * 0.5 + 0.5;
              float glow = smoothstep(0.72, 0.0, radius);
              float alpha = glow * mix(0.25, 1.0, wave) * uIntensity;
              gl_FragColor = vec4(uColor * (0.65 + wave * 0.55), alpha);
            }
          `
        });
        const mesh = new three.Mesh(geometry, material);
        scene.add(mesh);
        const wobble = new alien.Wobble(mesh.position);
        wobble.scale = 0.035;
        wobble.lerpSpeed = 0.04;

        host.replaceChildren(renderer.domElement);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = new three.Timer();
        timer.connect(document);
        let frame = 0;

        const resize = (): void => {
          const bounds = host.getBoundingClientRect();
          renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
          renderer.render(scene, camera);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(host);
        resize();

        const render = (timestamp: number): void => {
          timer.update(timestamp);
          const elapsed = timer.getElapsed() * speed;
          uniforms.uTime.value = elapsed;
          wobble.update(elapsed);
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };
        if (!reducedMotion) frame = requestAnimationFrame(render);

        cleanup = () => {
          cancelAnimationFrame(frame);
          observer.disconnect();
          timer.dispose();
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [color, intensity, speed]);

  return (
    <div
      {...props}
      ref={hostRef}
      className={cn('aliencn-shader', className)}
      role="img"
      aria-label={label}
    >
      {failed ? <span className="aliencn-shader__fallback">WebGL is unavailable.</span> : null}
    </div>
  );
}
