import { useEffect, useMemo } from 'react';
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
    scale: 110,                 
    rotationY: -Math.PI / 2,    
    positionOffset: [0, 0, 0],  
    paintableMaterials: ['paint'], // 🎯 Đã áp dụng từ khóa bắn tỉa chuẩn
    accentMaterials:    ['hood', 'wing'],
  },
  '911 TURBO S': {
    glbPath: '/models/turbos_opt.glb',
    scale: 110,                   
    rotationY: 0,
    positionOffset: [0, 0, 0],  
    paintableMaterials: ['palettematerial005', 'regiona_1'], // 🎯 Đã áp dụng từ khóa bắn tỉa chuẩn
    accentMaterials:    [],
  },
};

export default function AutoCenteredCar() {
  const activeCar   = useCarStore((state) => state.activeCar) ?? 'GT3 RS';
  const carColor    = useCarStore((state) => state.carColor);
  
  // Lấy thêm hàm setCarColor từ store để có thể reset màu
  const setCarColor = useCarStore((state) => state.setCarColor); 
  const invalidate  = useThree((state) => state.invalidate);

  const modelInfo = MODEL_REGISTRY[activeCar] ?? MODEL_REGISTRY['GT3 RS'];
  
  // ── Bước 0: CLONE (NHÂN BẢN) ĐỂ GIỮ NGUYÊN MÀU GỐC ──
  // Thay vì dùng thẳng bản gốc, chúng ta copy ra một bản để nếu carColor = null, nó sẽ hiện bản gốc này!
  const { scene: originalScene } = useGLTF(modelInfo.glbPath);
  const scene = useMemo(() => originalScene.clone(), [originalScene]);

  // ── MỚI: TỰ ĐỘNG XÓA MÀU KHI CHUYỂN XE KHÁC ──
  useEffect(() => {
    if (setCarColor) {
      setCarColor(null); // Trả carColor về null để hiển thị màu gốc
    }
  }, [activeCar, setCarColor]);

  // ── Bước 1: Tính toán tâm hình học thuần khiết ──
  const { center, minY } = useMemo(() => {
    if (!scene) return { center: new THREE.Vector3(), minY: 0 };
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    return { center: box.getCenter(new THREE.Vector3()), minY: box.min.y };
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
    // 💡 ĐIỂM QUAN TRỌNG: Nếu chưa chọn màu (carColor = null), code sẽ DỪNG LẠI TẠI ĐÂY
    // Lúc này chiếc xe đang là bản clone nên nó sẽ giữ 100% texture và màu gốc!
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

    // Đã phục hồi hàm kiểm tra CHUẨN XÁC soi cả Mesh Name và Mat Name để bảo vệ bánh xe
    const isPaintable = (child) => {
      const meshName = (child.name || '').toLowerCase();
      const matName  = (child.material?.name || '').toLowerCase();
      
      const blackList = [
        'tire', 'wheel', 'rim', 'brake', 'caliper', 'disc', 'alloy', 'rubber',
        'carbon', 'plastic', 'grill', 'mesh', 'black_matte', 
        'glass', 'window', 'mirror', 'light', 'lamp', 'lens',
        'logo', 'badge', 'interior', 'seat', 'engine', 'exhaust'
      ];

      if (blackList.some(k => meshName.includes(k) || matName.includes(k))) return false;
      
      if (modelInfo.paintableMaterials?.includes('*')) return true;

      return (modelInfo.paintableMaterials ?? [])
        .some(p => matName.includes(p.toLowerCase()) || meshName.includes(p.toLowerCase()));
    };

    const isAccent = (child) => {
      const meshName = (child.name || '').toLowerCase();
      const matName  = (child.material?.name || '').toLowerCase();
      if (['tire', 'wheel', 'brake', 'rim', 'glass', 'window']
        .some(k => meshName.includes(k) || matName.includes(k))) return false;
      return (modelInfo.accentMaterials ?? [])
        .some(a => matName.includes(a.toLowerCase()) || meshName.includes(a.toLowerCase()));
    };

    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      if (isPaintable(child)) {
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

      } else if (isAccent(child)) {
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

  // ── Bước 4: Khung bọc khai báo ──
  const offset = modelInfo.positionOffset || [0, 0, 0];

  return (
    <group scale={modelInfo.scale || 1} position={offset}>
      <group rotation={[0, modelInfo.rotationY || 0, 0]}>
        <primitive 
          object={scene} 
          position={[-center.x, -minY, -center.z]} 
        />
      </group>
    </group>
  );
}

Object.values(MODEL_REGISTRY).forEach((info) => {
  useGLTF.preload(info.glbPath);
});