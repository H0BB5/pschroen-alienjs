'use client';

import * as React from 'react';
import type { ColorRepresentation } from 'three';

import { cn } from '@/lib/aliencn/cn';

export interface ShaderCanvasProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'children'> {
  color?: ColorRepresentation;
  speed?: number;
  intensity?: number;
  label?: string;
}

interface ShaderCanvasSettings {
  color: ColorRepresentation;
  speed: number;
  intensity: number;
}

export function ShaderCanvas({
  color = '#dfffee',
  speed = 0.5,
  intensity = 0.75,
  label = 'Animated abstract shader',
  className,
  ...props
}: ShaderCanvasProps): React.JSX.Element {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const settingsRef = React.useRef<ShaderCanvasSettings>({ color, speed, intensity });
  settingsRef.current = { color, speed, intensity };
  const applySettingsRef = React.useRef<((settings: ShaderCanvasSettings) => void) | null>(null);
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
        const scene = new three.Scene();
        const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        const geometry = new three.PlaneGeometry(2, 2);
        const wobblePosition = new three.Vector3();
        const uniforms = {
          uTime: { value: 0 },
          uColor: { value: new three.Color(settingsRef.current.color) },
          uIntensity: { value: settingsRef.current.intensity },
          uResolution: { value: new three.Vector2(1, 1) },
          uWobble: { value: wobblePosition }
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
            uniform vec2 uResolution;
            uniform vec3 uWobble;
            varying vec2 vUv;

            float hash21(vec2 p) {
              p = fract(p * vec2(123.34, 456.21));
              p += dot(p, p + 45.32);
              return fract(p.x * p.y);
            }

            float noise21(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              f = f * f * (3.0 - 2.0 * f);
              return mix(
                mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
                mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
                f.y
              );
            }

            float fbm(vec2 p) {
              float value = 0.0;
              float amplitude = 0.5;
              mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
              for (int i = 0; i < 4; i++) {
                value += amplitude * noise21(p);
                p = rotation * p * 2.03 + 13.7;
                amplitude *= 0.5;
              }
              return value;
            }

            void main() {
              vec2 p = vUv - 0.5 - uWobble.xy;
              p.x *= uResolution.x / max(uResolution.y, 1.0);

              float time = uTime * 0.22 + uWobble.z * 0.5;
              float low = fbm(p * 2.4 + vec2(time, -time * 0.7));
              vec2 warp = vec2(
                fbm(p * 3.1 + low + vec2(2.7, time)),
                fbm(p * 2.8 - low + vec2(-time, 7.4))
              );
              vec2 fieldPosition = p + (warp - 0.5) * 0.68;
              float field = fbm(fieldPosition * 3.6 - vec2(time * 1.4, 0.0));
              float filament = 1.0 - smoothstep(0.02, 0.26, abs(field - 0.52));
              float veil = 1.0 - smoothstep(0.08, 0.92, length(fieldPosition));
              float grain = hash21(gl_FragCoord.xy + floor(uTime * 4.0));

              vec3 cyan = vec3(0.15, 0.82, 0.72);
              vec3 ember = vec3(0.95, 0.18, 0.31);
              vec3 spectral = mix(cyan, ember, smoothstep(0.25, 0.82, warp.x));
              vec3 colorField = mix(uColor * 0.38, spectral, 0.34 + warp.y * 0.24);
              colorField *= 0.5 + filament * 1.18 + grain * 0.055;

              float alpha = veil * (0.08 + filament * 0.74 + field * 0.14) * uIntensity;
              gl_FragColor = vec4(colorField, alpha);
            }
          `
        });
        const mesh = new three.Mesh(geometry, material);
        scene.add(mesh);
        const wobble = new alien.Wobble(wobblePosition);
        wobble.scale = 0.06;
        wobble.lerpSpeed = 0.04;

        host.appendChild(renderer.domElement);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = new three.Timer();
        timer.connect(document);
        let frame = 0;

        const resize = (): void => {
          const bounds = host.getBoundingClientRect();
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          uniforms.uResolution.value.set(Math.max(1, bounds.width), Math.max(1, bounds.height));
          renderer.setSize(Math.max(1, bounds.width), Math.max(1, bounds.height), false);
          renderer.render(scene, camera);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(host);

        applySettingsRef.current = (settings) => {
          uniforms.uColor.value.set(settings.color);
          uniforms.uIntensity.value = settings.intensity;
          if (reducedMotion) renderer.render(scene, camera);
        };
        resize();

        let time = 0;
        const render = (timestamp: number): void => {
          timer.update(timestamp);
          time += timer.getDelta() * settingsRef.current.speed;
          uniforms.uTime.value = time;
          wobble.update(time);
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };
        if (!reducedMotion) frame = requestAnimationFrame(render);

        cleanup = () => {
          applySettingsRef.current = null;
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
  }, []);

  React.useEffect(() => {
    applySettingsRef.current?.({ color, speed, intensity });
  }, [color, intensity, speed]);

  return (
    <div
      {...props}
      ref={hostRef}
      className={cn('aliencn-shader', className)}
      role={failed ? undefined : 'img'}
      aria-label={failed ? undefined : label}
    >
      {failed ? (
        <span role="status" className="aliencn-shader__fallback">
          WebGL is unavailable.
        </span>
      ) : null}
    </div>
  );
}
