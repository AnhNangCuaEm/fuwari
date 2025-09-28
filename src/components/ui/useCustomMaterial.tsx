import { useEffect } from 'react';
import { Object3D, Material } from 'three';

/**
 * Generic material replacement hook
 * @param scene - The scene loaded from GLTF
 * @param materialFactory - Receives the old material and returns a new material
 */
export function useCustomMaterial(
  scene: Object3D,
  materialFactory: (original: any) => Material
) {
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const original = child.material;
        child.material = materialFactory(original);
        child.castShadow = true;
        child.receiveShadow = true;

      }
    });
  }, [scene, materialFactory]);
}
