import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrthographicCamera, Environment, OrbitControls, Stars } from '@react-three/drei';
import Tile from './Tile';
import Effector from './Effector';
import MouseTrail from './MouseTrail';
import { DriveMode } from '../types';

const GridManager: React.FC<{ effectorRef: React.MutableRefObject<THREE.Mesh | null>, mode: DriveMode }> = ({ effectorRef, mode }) => {
  const { viewport } = useThree();

  const grid = useMemo(() => {
    const items = [];
    const offset = 1; 
    const margin = 2; 
    
    const rawCols = Math.floor((viewport.width - margin) / offset);
    const rawRows = Math.floor((viewport.height - margin) / offset);
    
    const cols = Math.max(4, Math.min(rawCols, 24));
    const rows = Math.max(4, Math.min(rawRows, 24));

    const centerX = (cols - 1) / 2;
    const centerY = (rows - 1) / 2;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        items.push({
          id: `${x}-${y}`,
          position: [
            (x - centerX) * offset,
            (y - centerY) * offset,
            0 
          ] as [number, number, number]
        });
      }
    }
    return items;
  }, [viewport.width, viewport.height]);

  return (
    <group>
       {/* Dark Matte Background Floor */}
       <mesh position={[0, 0, -0.5]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#080808" roughness={0.8} metalness={0.2} />
        </mesh>

       {grid.map((tile) => (
          <Tile 
            key={tile.id} 
            position={tile.position} 
            effectorRef={effectorRef} 
            mode={mode}
          />
        ))}
    </group>
  );
};

const HapticScene: React.FC<{ mode: DriveMode }> = ({ mode }) => {
  const effectorRef = useRef<THREE.Mesh>(null);

  // Dynamic Lighting Colors based on mode
  const lightColors = {
    SPORT: { main: '#ffaa00', rim: '#ff0000' },
    COMFORT: { main: '#ffffff', rim: '#ccccff' },
    ECO: { main: '#00ffff', rim: '#0088ff' }
  };

  const currentLight = lightColors[mode];

  return (
    <Canvas shadows dpr={[1, 2]} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
      
      <OrthographicCamera 
        makeDefault 
        position={[20, 20, 20]} 
        zoom={40} 
        near={-50} 
        far={200}
      />
      
      <OrbitControls 
        makeDefault
        enableDamping 
        dampingFactor={0.05}
        minZoom={20}
        maxZoom={100}
        maxPolarAngle={Math.PI / 2.2} 
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      {/* Cinematic Lighting */}
      <ambientLight intensity={0.2} color={currentLight.rim} />
      
      {/* Key Light */}
      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color={currentLight.main}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Rim Light (Low angle) */}
      <pointLight position={[-10, 5, -10]} intensity={5} color={currentLight.rim} />
      
      {/* Grid Reflection Light */}
      <rectAreaLight width={20} height={20} intensity={1} position={[0, 10, 0]} color={currentLight.main} lookAt={() => new THREE.Vector3(0,0,0)} />

      <GridManager effectorRef={effectorRef} mode={mode} />
      
      <Effector ref={effectorRef} />
      
      <MouseTrail />

      {/* High-End Reflections */}
      <Environment preset="city" blur={0.8} background={false} />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <fog attach="fog" args={['#050505', 10, 60]} />

    </Canvas>
  );
};

export default HapticScene;