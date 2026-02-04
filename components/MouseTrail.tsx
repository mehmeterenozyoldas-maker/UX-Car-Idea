import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail } from '@react-three/drei';

const MouseTrail: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // Calculate responsive dimensions
  const responsiveWidth = Math.max(0.2, viewport.width * 0.02);
  const responsiveLength = Math.max(8, Math.round(viewport.width * 0.4));

  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -2);
  const target = new THREE.Vector3();

  // State for the pulsating color
  const [pulsingColor] = useState(() => new THREE.Color("#e0f2fe"));

  useFrame((state) => {
    if (!ref.current) return;
    
    // Update raycaster
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersection = state.raycaster.ray.intersectPlane(plane, target);
    
    if (intersection) {
      ref.current.position.copy(intersection);
    }

    // Breathing Animation
    const time = state.clock.getElapsedTime();
    // Oscillate lightness or emissive feel. 
    // Base HSL for #e0f2fe is roughly 200, 80%, 94%.
    // We want to pulse it towards white/bright blue.
    // Let's mix between white and the base color.
    const alpha = (Math.sin(time * 3) + 1) / 2; // 0 to 1
    
    // Interpolate color for the trail
    // Note: Trail component updates efficiently when color prop changes if it's a primitive,
    // but passing a mutated object might need forcing update.
    // However, Drei Trail recreates geometry often. A cleaner way is using frame-based color update on the Trail prop? 
    // Actually, simply mutating the object usually works in R3F loops if the consumer reads it.
    // Let's try adjusting the Hex string to ensure React update if needed, but for performance,
    // let's assume Trail reads color.
    
    // A robust way: Update the HSL of our state color object
    pulsingColor.setHSL(0.58, 1, 0.7 + alpha * 0.3); // Pulse lightness 0.7 -> 1.0
  });

  return (
    // Outer "Glow" Trail - Halo
    <Trail
      width={responsiveWidth * 2.5}
      length={responsiveLength}
      color={new THREE.Color("#0ea5e9")} 
      attenuation={(t) => t * t} 
    >
      {/* Inner "Core" Trail - Pulsating */}
      {/* We pass the mutable color object. React-three-fiber handles instance usage effectively */}
      <Trail
        width={responsiveWidth}
        length={responsiveLength}
        color={pulsingColor} 
        attenuation={(t) => t} 
      >
        <mesh ref={ref}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </Trail>
    </Trail>
  );
};

export default MouseTrail;