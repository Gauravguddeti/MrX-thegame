declare module '@react-three/fiber' {
  import { Camera, Scene, WebGLRenderer } from 'three';
  import { ReactNode } from 'react';

  export interface ThreeElements {
    mesh: any;
    boxGeometry: any;
    meshStandardMaterial: any;
    gridHelper: any;
    group: any;
    sphereGeometry: any;
    planeGeometry: any;
    ambientLight: any;
    directionalLight: any;
    orbitControls: any;
  }

  export interface RootState {
    gl: WebGLRenderer;
    scene: Scene;
    camera: Camera;
    size: { width: number; height: number };
  }

  export interface UseThree {
    (): RootState;
  }

  export interface CanvasProps {
    children: ReactNode;
    shadows?: boolean;
    className?: string;
  }

  export const Canvas: React.FC<CanvasProps>;
  export const useThree: UseThree;
  export function extend(objects: Record<string, any>): void;
}

declare module '@react-three/drei' {
  import { ReactNode } from 'react';
  import { Vector3 } from 'three';

  export interface PerspectiveCameraProps {
    makeDefault?: boolean;
    position?: Vector3 | [number, number, number];
    fov?: number;
    near?: number;
    far?: number;
  }

  export interface OrbitControlsProps {
    enableDamping?: boolean;
    dampingFactor?: number;
    rotateSpeed?: number;
    panSpeed?: number;
    zoomSpeed?: number;
    minDistance?: number;
    maxDistance?: number;
    maxPolarAngle?: number;
    minPolarAngle?: number;
  }

  export const PerspectiveCamera: React.FC<PerspectiveCameraProps>;
  export const OrbitControls: React.FC<OrbitControlsProps>;
} 