import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useCarStore from '../../store/useCarStore';
import { CAR_DATA } from '../../data/carData';

// 🚀 1. TỪ ĐIỂN XE: Cấu hình riêng biệt cho từng mẫu xe
export const MODEL_REGISTRY = {
  'GT3 RS': { 
    glbPath: '/models/gt3rs.glb',
    paintableMaterials: ['material.005', 'material_0'], 
    accentMaterials: [
      'carbon1_material.001', 
      'carbon1_material.003', 
      'coloured_material.001'
    ]
  },
  'GT3': { 
    glbPath: '/models/gt3.glb',
    paintableMaterials: ['carpaint', 'body_color'],
    accentMaterials: ['hood', 'wing'] 
  },
  '911 TURBO S': { 
    glbPath: '/models/turbos.glb',
    paintableMaterials: ['coloured_material'],
    accentMaterials: [] 
  },
};

export default function AutoCenteredCar({ scale = 1 }) {
  const activeCar  = useCarStore((state) => state.activeCar) ?? 'GT3 RS';
  const carColor   = useCarStore((state) => state.carColor);
  const invalidate = useThree((state) => state.invalidate);
  const groupRef   = useRef();

  const modelInfo = MODEL_REGISTRY[activeCar] ?? MODEL_REGISTRY['GT3 RS'];
  const { scene } = useGLTF(modelInfo.glbPath);

  // ── Effect 1: Căn giữa xe + Đặt bánh xe chạm đất ──
  useEffect(() => {
    if (!scene || !groupRef.current) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());

    groupRef.current.position.set(-center.x, -box.min.y, -center.z);

    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = false; 
      
      const mat = child.material;
      if (!mat) return;
      if (mat.transmission > 0) {
        mat.transmission = 0;
        mat.transparent = false;
        mat.opacity = 1;
        mat.needsUpdate = true;
      }
      if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
        mat.envMapIntensity = 2.5;
        mat.needsUpdate = true;
      }
    });

    invalidate();
  }, [scene, invalidate]);

  // ── Effect 2: Sơn thân xe & Xử lý tương phản (Contrast Logic) ──
  useEffect(() => {
    if (!scene || !carColor) return;

    const targetColor = new THREE.Color(carColor);
    const carData = CAR_DATA[activeCar];
    const selectedColorData = carData?.colors.find(
      (c) => c.hex.toLowerCase() === carColor.toLowerCase()
    );

    const roughness  = selectedColorData?.roughness  ?? 0.22;
    const metalness  = selectedColorData?.metalness  ?? 0.6;
    const isMetallic = selectedColorData?.metallic   ?? false;

    // 🔥 Kích hoạt trạng thái "Xe Đen"
    const isBlackCar = carColor.toLowerCase() === '#000000' || carColor.toLowerCase() === '#111111';

    // Nhận diện thân xe chính
    const isPaintable = (matName) => {
      if (!matName) return false;
      const name = matName.toLowerCase();
      if (['carbon', 'glass', 'tire', 'window'].some(k => name.includes(k))) return false;
      return (modelInfo.paintableMaterials || []).some(allowed => name.includes(allowed.toLowerCase()));
    };

    // Nhận diện bộ phận tương phản
    const isAccent = (matName) => {
      if (!matName) return false;
      const name = matName.toLowerCase();
      if (['tire', 'wheel', 'brake', 'caliper', 'rim', 'glass'].some(k => name.includes(k))) return false;
      return (modelInfo.accentMaterials || []).some(a => name.includes(a.toLowerCase()));
    };

    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const matName = child.material.name;

      // 1. SƠN THÂN XE CHÍNH
      if (isPaintable(matName)) {
        const newMat = child.material.clone();
        newMat.map = null;
        newMat.roughnessMap = null;
        newMat.metalnessMap = null;
        newMat.vertexColors = false;

        newMat.color.set(targetColor);
        newMat.roughness  = roughness;
        newMat.metalness  = metalness;
        newMat.clearcoat = 1.0;
        newMat.clearcoatRoughness = isMetallic ? 0.12 : 0.04;
        newMat.envMapIntensity = 3.0;

        newMat.needsUpdate = true;
        child.material = newMat;
      } 
      
      // 2. SƠN BỘ PHẬN TƯƠNG PHẢN (NẮP CAPO/CÁNH GIÓ)
      else if (isAccent(matName)) {
        const newMat = child.material.clone();
        newMat.map = null;
        
        if (isBlackCar) {
          // Nắp capo chuyển Trắng bóng
          newMat.color.set('#ffffff');
          newMat.roughness = 0.2;
          newMat.metalness = 0.5;
        } else {
          // Nắp capo trả về Đen nhám Carbon
          newMat.color.set('#1a1a1a'); 
          newMat.roughness = 0.6;
          newMat.metalness = 0.3;
        }
        
        newMat.needsUpdate = true;
        child.material = newMat;
      }
    });

    invalidate();
  }, [scene, carColor, activeCar, invalidate, modelInfo]);

  // ── Click debug ──
  const handleClick = (e) => {
    e.stopPropagation();
    const mat = e.object.material;
    console.log('🎯 Mesh:', e.object.name, '| Material:', mat?.name, '| Type:', mat?.type);
  };

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={scene} onPointerDown={handleClick} />
    </group>
  );
}

Object.values(MODEL_REGISTRY).forEach((info) => {
  useGLTF.preload(info.glbPath);
});