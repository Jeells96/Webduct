import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Product3DAssetDto } from '@webduct/shared';
import { buildDuctMesh } from './duct-geometry';

/**
 * 3D part/duct viewer (Three.js) — mirrors the original ordering-ui's WebGL
 * viewer. Renders a product's Product3DAsset: procedural duct geometry from the
 * asset `meta`, or (when present) a glTF model. All GPU resources are disposed
 * on destroy to avoid context leaks across SPA navigation.
 */
@Component({
  selector: 'wd-three-viewer',
  standalone: true,
  template: `<div #host class="viewer-host"></div>`,
  styles: [
    `
      .viewer-host {
        width: 100%;
        height: 320px;
        border-radius: 8px;
        overflow: hidden;
        background: linear-gradient(#eceff1, #cfd8dc);
        cursor: grab;
      }
      .viewer-host:active {
        cursor: grabbing;
      }
    `,
  ],
})
export class ThreeViewerComponent implements AfterViewInit, OnDestroy {
  @Input() asset: Product3DAssetDto | null | undefined;
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private controls?: OrbitControls;
  private frameId = 0;
  private resizeObserver?: ResizeObserver;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.init());
  }

  private init(): void {
    const el = this.host.nativeElement;
    const width = el.clientWidth || 600;
    const height = el.clientHeight || 320;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    this.camera.position.set(90, 60, 90);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    el.appendChild(this.renderer.domElement);

    // Lights.
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(60, 100, 60);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-60, 20, -40);
    this.scene.add(fill);

    // Duct geometry.
    const mesh = buildDuctMesh(this.asset?.meta ?? null);
    this.scene.add(mesh);

    // Orbit controls.
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(el);

    this.animate();
  }

  private animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    this.controls?.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private onResize(): void {
    const el = this.host.nativeElement;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h || !this.renderer || !this.camera) {
      return;
    }
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.controls?.dispose();
    this.scene?.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else if (mat) {
        mat.dispose();
      }
    });
    this.renderer?.dispose();
    if (this.renderer?.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
