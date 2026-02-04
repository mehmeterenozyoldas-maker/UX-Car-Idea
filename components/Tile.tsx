import React, { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { easing } from 'maath';
import { TileProps } from '../types';

const Tile: React.FC<TileProps> = ({ position, effectorRef, mode }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  const basePosition = useMemo(() => new THREE.Vector3(...position), [position]);

  // Mode Configuration
  const modeConfig = useMemo(() => {
    switch (mode) {
      case 'SPORT': return { 
        active: '#ff3300', glow: '#ff5500', base: '#1a0a05', roughness: 0.1, metalness: 0.8 
      };
      case 'ECO': return { 
        active: '#00ccff', glow: '#00ffff', base: '#001a22', roughness: 0.2, metalness: 0.6 
      };
      case 'COMFORT': default: return { 
        active: '#ffffff', glow: '#aaddff', base: '#111111', roughness: 0.05, metalness: 0.9 
      };
    }
  }, [mode]);

  useFrame((state, delta) => {
    if (!meshRef.current || !effectorRef.current) return;

    const effectorPos = effectorRef.current.position;
    const distance = basePosition.distanceTo(effectorPos);
    
    // Interaction Logic (Terrain Mapping)
    const influenceRadius = 3.0; 
    const maxDisplacement = 1.2;

    let targetZ = 0;
    if (distance < influenceRadius) {
      // Create a wave effect
      const intensity = Math.pow(1 - distance / influenceRadius, 3); 
      targetZ = intensity * maxDisplacement;
    }

    const hoverLift = hovered ? 0.2 : 0;
    const finalZ = targetZ + hoverLift; 

    // Smooth Movement
    easing.damp(meshRef.current.position, 'z', finalZ, 0.2, delta);
    
    // Tilt towards effector for "Magnetic" feel
    const tiltX = (effectorPos.y - basePosition.y) * targetZ * 0.1;
    const tiltY = -(effectorPos.x - basePosition.x) * targetZ * 0.1;
    
    easing.damp(meshRef.current.rotation, 'x', tiltX, 0.2, delta);
    easing.damp(meshRef.current.rotation, 'y', tiltY, 0.2, delta);

    // Scale damp
    easing.damp3(meshRef.current.scale, hovered || targetZ > 0.1 ? 1.05 : 1, 0.2, delta);

    // Dynamic Shadow
    if (shadowRef.current) {
        const shadowOpacity = Math.max(0, 0.6 - finalZ);
        easing.damp(shadowRef.current.material as THREE.MeshBasicMaterial, 'opacity', shadowOpacity, 0.1, delta);
    }

    // Material Animation (Crystal Glow)
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (material) {
        const isActive = targetZ > 0.1 || hovered;
        
        // Base color shift
        easing.dampC(material.color, isActive ? modeConfig.active : modeConfig.base, 0.1, delta);
        
        // Emissive Pulse
        const targetEmissive = isActive ? modeConfig.glow : '#000000';
        const pulse = isActive ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2 : 0;
        
        easing.dampC(material.emissive, targetEmissive, 0.1, delta);
        easing.damp(material, 'emissiveIntensity', isActive ? 0.8 + pulse : 0, 0.1, delta);
        
        // Physical properties shift based on mode
        easing.damp(material, 'roughness', modeConfig.roughness, 0.5, delta);
        easing.damp(material, 'metalness', modeConfig.metalness, 0.5, delta);
    }
  });

  return (
    <group position={position}>
      {/* Floor reflection/shadow */}
      <mesh ref={shadowRef} position={[0, 0, -0.1]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color={modeConfig.glow} transparent opacity={0.2} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Crystal Tile */}
      <RoundedBox
        ref={meshRef}
        args={[0.92, 0.92, 0.15]} 
        radius={0.02} 
        smoothness={2}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
      >
        <meshPhysicalMaterial 
          transparent
          thickness={1.5}
          transmission={1.0} // Glass-like
          ior={1.5}
          reflectivity={0.5}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </RoundedBox>
    </group>
  );
};

export default Tile;