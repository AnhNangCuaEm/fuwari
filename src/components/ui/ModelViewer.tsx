'use client'

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Box3, Vector3 } from 'three';

interface ModelViewerProps {
    modelPath: string;
    className?: string;
}

function Model({ modelPath }: { modelPath: string }) {
    const { scene } = useGLTF(modelPath);
    
    const { scale, center } = useMemo(() => {
        // Clone the scene to avoid modifying the original
        const clonedScene = scene.clone();
        const box = new Box3().setFromObject(clonedScene);
        const size = box.getSize(new Vector3());
        const center = box.getCenter(new Vector3());
        
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 3.5;
        const scale = targetSize / maxDimension;
        
        return { scale, center };
    }, [scene]);
    
    return (
        <primitive 
            object={scene.clone()} 
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
    const controlsRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    useEffect(() => {
        // Reset controls when component mounts or modelPath changes
        if (controlsRef.current) {
            // Reset to initial camera position
            controlsRef.current.object.position.set(3, 4, 5);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
    }, [modelPath]);

    return (
        <div className={className}>
            <Canvas 
                key={modelPath} // Force re-render when modelPath changes
                camera={{ 
                    position: [3,4,5], 
                    fov: 45,
                    near: 0.1,
                    far: 1000
                }}
                onCreated={(state) => {
                    // Ensure camera is positioned correctly on creation
                    state.camera.position.set(3, 4, 5);
                    state.camera.lookAt(0, 0, 0);
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
                    ref={controlsRef}
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
                    makeDefault // Make this the default controls
                />
            </Canvas>
        </div>
    );
}