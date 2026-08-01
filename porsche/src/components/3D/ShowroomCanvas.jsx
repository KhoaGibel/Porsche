import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { useIsMobile } from '../../hooks/useIsMobile';
import AutoCenteredCar from './AutoCenteredCar';

export default function ShowroomCanvas({ slideDir }) {
  const isMobile = useIsMobile();
  
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [5, 2.5, 7], fov: 42 }}
      dpr={isMobile ? [1, 1] : [1, 1.5]}
      performance={{ min: isMobile ? 0.3 : 0.5 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ powerPreference: "high-performance", antialias: true, stencil: false }}
    >
      <Suspense fallback={null}>
        <group position={[ slideDir === 'right' ? -3 : slideDir === 'left' ? 3 : 0, 0, 0 ]}>
          <AutoCenteredCar scale={1} />
        </group>
        <Environment files="https://res.cloudinary.com/dq8xgcqhk/raw/upload/v1783567347/grasslands_sunset_1k_lcveuv.hdr" background />
        <ContactShadows resolution={isMobile ? 256 : 512} frames={1} scale={14} blur={3} opacity={0.85} far={10} color="#000000" />
      </Suspense>
      <OrbitControls target={[0, 1, 0]} enableDamping dampingFactor={0.08} makeDefault minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} minDistance={3} maxDistance={12} enablePan={false} enableZoom={false} />
    </Canvas>
  );
}
