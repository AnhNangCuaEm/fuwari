'use client'

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { Box3, Vector3, MeshToonMaterial, MeshNormalMaterial } from 'three';
import { useCustomMaterial } from './useCustomMaterial'; 
import { EffectComposer, Bloom, Vignette ,Outline,HueSaturation} from '@react-three/postprocessing';
import { BlendFunction, ShaderPass } from 'postprocessing';

interface ModelViewerProps {
  modelPath: string;
  className?: string;
}

function Model({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);

  // ✅ Switch material here
  useCustomMaterial(scene, (original) => {
    // // 👉 Toon
    return new MeshToonMaterial({
      map: original.map || null,
      color: original.color,  
        emissive: 0x222222,   // Add some soft glow
        emissiveIntensity: 0.2,
    });

    // 👉 Or Normal Debug
    // return new MeshNormalMaterial();
  });

  // ✅ Auto scale & center
  const { scale, center } = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    const maxDimension = Math.max(size.x, size.y, size.z);
    const targetSize = 3.5;
    const scale = targetSize / maxDimension;

    return { scale, center };
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={[scale, scale, scale]}
      position={[-center.x * scale, -center.y * scale, -center.z * scale]}
    />
  );
}

function LoadingSpinner() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="lightblue" />
    </mesh>
  );
}

export function ModelViewer({ modelPath, className = "w-full h-96" }: ModelViewerProps) {
  return (
    <div className={className}>
      <Canvas
        shadows
        camera={{
          position: [3, 4, 5],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
      >
        {/* Basic lights */}
       <ambientLight intensity={1.1} />
       <hemisphereLight
            skyColor={"#ffeedd"}
            groundColor={"#ffeeee"}
            intensity={0.4}
        />

        <directionalLight
            position={[5, 8, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
        />
        {/* <directionalLight position={[-5, 2, 5]} intensity={0.3}  castShadow /> */}
        {/* <directionalLight position={[0, -5, -5]} intensity={0.2}  castShadow/> */}
   

        <Suspense fallback={<LoadingSpinner />}>
          <Model modelPath={modelPath} />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate
          autoRotateSpeed={1}
          minDistance={3}
          maxDistance={12}
          enableDamping
          dampingFactor={0.05}
          target={[0, 0, 0]}
        />
    <EffectComposer>
    <Bloom
      intensity={0.8}          // Bloom intensity
      luminanceThreshold={0.1} // Bloom luminance threshold
    />
    
    {/* <Vignette
      eskil={false}
      offset={0.1}
      darkness={0.9}
      blendFunction={BlendFunction.NORMAL}
    /> */}
    
    <Outline
      edgeStrength={3}   // Outline thickness
      visibleEdgeColor={0x000000} // Outline color
    />
     {/* <HueSaturation hue={0} saturation={-1} /> */}


  </EffectComposer>
      </Canvas>
    </div>
  );
}
