import { useEffect } from 'react';
import { Object3D, Material } from 'three';

/**
 * 通用材質替換 Hook
 * @param scene - GLTF 載入後的 scene
 * @param materialFactory - 接收舊的材質，回傳新的材質
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
