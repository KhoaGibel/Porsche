import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useCarStore from '../../store/useCarStore';
import { CAR_DATA } from '../../data/carData';

export const MODEL_REGISTRY = {
  'GT3 RS': { glbPath: '/models/gt3rs.glb' },
  // 'GT3':         { glbPath: '/models/gt3.glb' },
  // '911 TURBO S': { glbPath: '/models/turbos.glb' },
};

const isBodyMaterial = (matName) => {
  const n = (matName || '').toLowerCase();
  if (n.includes('carbon')) return false;
  if (n === 'material.005') return true;
  if (n.includes('coloured_material')) return true;
  return ['base_material', 'paint_material', 'carpaint', 'car_body']
    .some((kw) => n.includes(kw));
};

export default function AutoCenteredCar({ scale = 1 }) {
  const activeCar  = useCarStore((state) => state.activeCar) ?? 'GT3 RS';
  const carColor   = useCarStore((state) => state.carColor);
  const invalidate = useThree((state) => state.invalidate);
  const groupRef   = useRef();

  const modelInfo = MODEL_REGISTRY[activeCar] ?? MODEL_REGISTRY['GT3 RS'];
  const { scene } = useGLTF(modelInfo.glbPath);

  // ── Effect 1: center + fix transmission ──
  useEffect(() => {
    if (!scene) return;

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);

    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const mat = child.material;
      if (!mat) return;
      if (mat.transmission > 0) {
        mat.transmission = 0;
        mat.transparent = false;
        mat.opacity = 1;
        mat.needsUpdate = true;
      }
      // ✅ Tăng envMapIntensity cao hơn — ánh sáng môi trường rõ hơn
      if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
        mat.envMapIntensity = 2.5;
        mat.needsUpdate = true;
      }
    });

    invalidate();
  }, [scene, invalidate]);

  // ── Effect 2: sơn thân xe ──
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

    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      if (isBodyMaterial(child.material.name)) {
        const newMat = child.material.clone();

        // ✅ CHỈ lột map (base color texture) — KHÔNG lột normalMap
        // normalMap giữ lại để bề mặt xe có chiều sâu, không phẳng lì
        newMat.map = null;
        newMat.roughnessMap = null;
        newMat.metalnessMap = null;
        // newMat.normalMap = null  ← KHÔNG làm dòng này nữa
        newMat.vertexColors = false;

        newMat.color.set(targetColor);
        newMat.roughness  = roughness;
        newMat.metalness  = metalness;

        // ✅ Clearcoat — lớp phủ bóng kính đặc trưng sơn xe cao cấp
        newMat.clearcoat = 1.0;
        newMat.clearcoatRoughness = isMetallic ? 0.12 : 0.04;

        // ✅ Tăng envMapIntensity riêng cho material thân xe
        // để phản chiếu môi trường rõ hơn — tạo cảm giác sơn bóng sâu
        newMat.envMapIntensity = 3.0;

        newMat.needsUpdate = true;
        child.material = newMat;
      }
    });

    invalidate();
  }, [scene, carColor, activeCar, invalidate]);

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