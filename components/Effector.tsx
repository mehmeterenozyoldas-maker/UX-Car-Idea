import React, { forwardRef, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const Effector = forwardRef<THREE.Mesh, {}>((props, ref) => {
  const lightRef = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const mesh = (ref as React.MutableRefObject<THREE.Mesh>).current;
    
    if (mesh) {
      // Figure-8 Motion to simulate vehicle path
      const t = time * 0.8;
      mesh.position.x = Math.cos(t) * 4;
      mesh.position.y = Math.sin(t * 2) * 2.5;
      mesh.position.z = 0.8; // Hovering above tiles
      
      // Rotate mesh to follow path
      mesh.rotation.z = Math.atan2(Math.cos(t * 2) * 5, -Math.sin(t) * 4) + Math.PI / 2;
      mesh.rotation.x = Math.PI / 2; // Flat orientation
      mesh.rotation.y += 0.02; // Subtle spin

      // Update Light target to look ahead
      if (lightRef.current) {
        lightRef.current.target.position.set(
            mesh.position.x + Math.cos(mesh.rotation.z) * 3,
            mesh.position.y + Math.sin(mesh.rotation.z) * 3,
            0
        );
        lightRef.current.target.updateMatrixWorld();
      }
    }
  });

  return (
    <group>
        <mesh ref={ref} castShadow receiveShadow>
        {/* Diamond / Sensor Shape */}
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
            color="white" 
            emissive="white"
            emissiveIntensity={2}
            roughness={0}
            metalness={1}
        />
        
        {/* Headlights / Scanner Beam */}
        <spotLight
            ref={lightRef}
            color="white"
            intensity={20}
            angle={0.6}
            penumbra={0.5}
            distance={8}
            castShadow
        />
        
        {/* Halo Glow */}
        <pointLight intensity={2} distance={2} color="white" decay={2} />
        </mesh>
    </group>
  );
});

Effector.displayName = 'Effector';
export default Effector;