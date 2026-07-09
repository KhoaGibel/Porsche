import { useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useCarStore from '../../store/useCarStore';
import { CAR_DATA } from '../../data/carData';

export const MODEL_REGISTRY = {
  'GT3 RS': {
    glbPath: '/models/gt3rs_opt.glb',
    scale: 1,
    rotationY: 0,
    positionOffset: [0, 0, 0],
    paintableMaterials: ['material.005', 'material_0'],
    accentMaterials:    ['carbon1_material.001', 'carbon1_material.003', 'coloured_material.001'],
  },
  'GT3': {
    glbPath: '/models/gt3_opt.glb',
    scale: 110,                 // Phóng to ~110 lần dựa trên tỷ lệ thật trong log của bạn (0.013m -> 1.43m)
    rotationY: -Math.PI / 2,    // Giúp mũi chiếc GT3 hướng thẳng ra phía trước
    positionOffset: [0, 0, 0],  // Khóa chặt tại tâm sân khấu
    paintableMaterials: ['coat', 'carpaint', 'body_color'],
    accentMaterials:    ['hood', 'wing'],
  },
  '911 TURBO S': {
    glbPath: '/models/turbos_opt.glb',
    scale: 110,                   // ⚠️ ĐÃ SỬA: Đưa về 1 (kích thước gốc file này đã là ~1.42m rồi, để 75 sẽ bị khổng lồ)
    rotationY: 0,
    positionOffset: [0, 0, 0],
    paintableMaterials: ['body_main'],
    accentMaterials:    [],
  },
};

export default function AutoCenteredCar() {
  const activeCar  = useCarStore((state) => state.activeCar) ?? 'GT3 RS';
  const carColor   = useCarStore((state) => state.carColor);
  const invalidate = useThree((state) => state.invalidate);

  const modelInfo = MODEL_REGISTRY[activeCar] ?? MODEL_REGISTRY['GT3 RS'];
  const { scene } = useGLTF(modelInfo.glbPath);

  // ── Bước 1: Tính toán tâm hình học thuần khiết (Chống hoàn toàn lỗi Cache khi chuyển Tab) ──
  const { center, minY } = useMemo(() => {
    if (!scene) return { center: new THREE.Vector3(), minY: 0 };

    // Khôi phục trạng thái nguyên bản của file 3D để đo chính xác, xóa vết lỗi cũ
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const c = box.getCenter(new THREE.Vector3());
    
    return { center: c, minY: box.min.y };
  }, [scene]);

  // ── Bước 2: Khử lỗi xuyên thấu vật liệu bề mặt ──
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow    = true;
      child.receiveShadow = false;
      const mat = child.material;
      if (!mat) return;
      if (mat.transmission > 0) {
        mat.transmission = 0;
        mat.transparent  = false;
        mat.opacity      = 1;
        mat.needsUpdate  = true;
      }
      if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
        mat.envMapIntensity = 2.5;
        mat.needsUpdate     = true;
      }
    });

    invalidate();
  }, [scene, invalidate]);

  // ── Bước 3: Đổi màu sơn vỏ xe ──
  useEffect(() => {
    if (!scene || !carColor) return;

    const targetColor = new THREE.Color(carColor);
    const carData     = CAR_DATA[activeCar];
    const colorData   = carData?.colors.find(
      (c) => c.hex.toLowerCase() === carColor.toLowerCase()
    );

    const roughness  = colorData?.roughness  ?? 0.22;
    const metalness  = colorData?.metalness  ?? 0.6;
    const isMetallic = colorData?.metallic   ?? false;
    const isBlackCar = ['#000000', '#0a0a0a', '#0d0d0d', '#111111']
      .includes(carColor.toLowerCase());

    const isPaintable = (matName) => {
      if (!matName) return false;
      const n = matName.toLowerCase();
      if (['carbon', 'glass', 'tire', 'window', 'wheel', 'rim']
        .some(k => n.includes(k))) return false;
      return (modelInfo.paintableMaterials ?? [])
        .some(p => n.includes(p.toLowerCase()));
    };

    const isAccent = (matName) => {
      if (!matName) return false;
      const n = matName.toLowerCase();
      if (['tire', 'wheel', 'brake', 'rim', 'glass']
        .some(k => n.includes(k))) return false;
      return (modelInfo.accentMaterials ?? [])
        .some(a => n.includes(a.toLowerCase()));
    };

    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const matName = child.material.name;

      if (isPaintable(matName)) {
        const m = child.material.clone();
        m.map                = null;
        m.roughnessMap       = null;
        m.metalnessMap       = null;
        m.vertexColors       = false;
        m.color.set(targetColor);
        m.roughness          = roughness;
        m.metalness          = metalness;
        m.clearcoat          = 1.0;
        m.clearcoatRoughness = isMetallic ? 0.12 : 0.04;
        m.envMapIntensity    = 3.0;
        m.needsUpdate        = true;
        child.material       = m;

      } else if (isAccent(matName)) {
        const m = child.material.clone();
        m.map = null;
        if (isBlackCar) {
          m.color.set('#ffffff'); m.roughness = 0.2; m.metalness = 0.5;
        } else {
          m.color.set('#1a1a1a'); m.roughness = 0.6; m.metalness = 0.3;
        }
        m.needsUpdate  = true;
        child.material = m;
      }
    });

    invalidate();
  }, [scene, carColor, activeCar, invalidate, modelInfo]);

  // ── Click debug ──
  const handleClick = (e) => {
    e.stopPropagation();
    console.log('🎯', e.object.name, '| Mat:', e.object.material?.name);
  };

  // ── Bước 4: Khung bọc khai báo (Declarative Group Wrapping) ──
  const offset = modelInfo.positionOffset || [0, 0, 0];

  return (
    <group scale={modelInfo.scale || 1} position={offset}>
      <group rotation={[0, modelInfo.rotationY || 0, 0]}>
        <primitive 
          object={scene} 
          position={[-center.x, -minY, -center.z]} 
          onPointerDown={handleClick} 
        />
      </group>
    </group>
  );
}

Object.values(MODEL_REGISTRY).forEach((info) => {
  useGLTF.preload(info.glbPath);
});