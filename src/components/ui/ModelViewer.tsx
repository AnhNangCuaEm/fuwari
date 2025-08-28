'use client'

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { Box3, Vector3 } from 'three';

interface ModelViewerProps {
    modelPath: string;
    className?: string;
}

function Model({ modelPath }: { modelPath: string }) {
    const { scene } = useGLTF(modelPath);
    
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
                camera={{ 
                    position: [3,4,5], 
                    fov: 45,
                    near: 0.1,
                    far: 1000
                }}
            >
                {/* Ambient light for overall illumination */}
                <ambientLight intensity={0.4} />

                {/* Main light from above */}
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={0.8}
                    castShadow
                />
                
                {/* Fill light from the left */}
                <directionalLight 
                    position={[-5, 2, 5]} 
                    intensity={0.3}
                />
                
                {/* Back light */}
                <directionalLight 
                    position={[0, -5, -5]} 
                    intensity={0.2}
                />
                
                <Suspense fallback={<LoadingSpinner />}>
                    <Model modelPath={modelPath} />
                </Suspense>
                
                <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    autoRotate={true}
                    autoRotateSpeed={1}
                    minDistance={3}
                    maxDistance={12}
                    enableDamping={true} // Smooth motion
                    dampingFactor={0.05}
                    target={[0, 0, 0]}   // Camera always looks at center
                />
            </Canvas>
        </div>
    );
}