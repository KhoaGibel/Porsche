import { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useCarStore from '../../store/useCarStore';
import { CAR_DATA } from '../../data/carData';

export const MODEL_REGISTRY = {
  'GT3 RS': {
    glbPath: '/models/gt3rs_opt.glb',
    scale: 2,
    rotationY: 0,
    positionOffset: [0, 0, 0],
    paintableMaterials: ['material.005', 'material_0'],
    accentMaterials:    ['carbon1_material.001', 'carbon1_material.003', 'coloured_material.001'],
  },
  'GT3': {
    glbPath: '/models/gt3_opt.glb',
    scale: 115,
    rotationY: -Math.PI / 2,
    positionOffset: [0, 0, 0],
    paintableMaterials: ['paint'],
    accentMaterials:    ['hood', 'wing'],
  },
  '911 TURBO S': {
    glbPath: '/models/turbos_opt.glb',
    scale: 150,
    rotationY: 0,
    positionOffset: [0, 0, 0],
    paintableMaterials: ['palettematerial005', 'regiona_1'],
    accentMaterials:    [],
  },
};

const DEFAULT_CAR = 'GT3 RS';

const cloneCache = new Map();
const bboxCache = new Map();

export default function AutoCenteredCar() {
  const activeCar   = useCarStore((state) => state.activeCar) ?? DEFAULT_CAR;
  const carColor    = useCarStore((state) => state.carColor);
  const setCarColor = useCarStore((state) => state.setCarColor);
  const invalidate  = useThree((state) => state.invalidate);

  const modelInfo = MODEL_REGISTRY[activeCar] ?? MODEL_REGISTRY[DEFAULT_CAR];

  const { scene: originalScene } = useGLTF(modelInfo.glbPath);

  // ── Cache clone theo từng xe — tránh clone lại + tính lại
  //    bounding box mỗi lần quay lại xe đã xem trước đó ──
  const scene = useMemo(() => {
    if (cloneCache.has(activeCar)) {
      return cloneCache.get(activeCar);
    }
    const cloned = originalScene.clone();
    cloneCache.set(activeCar, cloned);
    return cloned;
  }, [originalScene, activeCar]);

  // ── Tự động xoá màu khi chuyển xe khác ──
  useEffect(() => {
    if (setCarColor) setCarColor(null);
  }, [activeCar, setCarColor]);

  // ── Tính tâm hình học — cache theo activeCar, không tính lại
  //    khi quay lại xe cũ (scene đã cache nên box cũng không đổi) ──
  const { center, minY } = useMemo(() => {
    if (bboxCache.has(activeCar)) {
      return bboxCache.get(activeCar);
    }
    if (!scene) return { center: new THREE.Vector3(), minY: 0 };

    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const result = { center: box.getCenter(new THREE.Vector3()), minY: box.min.y };

    bboxCache.set(activeCar, result);
    return result;
  }, [scene, activeCar]);

  // ── Khử lỗi xuyên thấu vật liệu bề mặt ──
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

  // ── Đổi màu sơn vỏ xe ──
  useEffect(() => {
    if (!scene) return;

    const targetColor = carColor ? new THREE.Color(carColor) : null;
    const carData     = CAR_DATA[activeCar];
    const colorData   = carData?.colors.find(
      (c) => c.hex.toLowerCase() === (carColor || '').toLowerCase()
    );

    const roughness  = colorData?.roughness  ?? 0.22;
    const metalness  = colorData?.metalness  ?? 0.6;
    const isMetallic = colorData?.metallic   ?? false;
    const isBlackCar = carColor && ['#000000', '#0a0a0a', '#0d0d0d', '#111111']
      .includes(carColor.toLowerCase());

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

      if (!child.userData.originalMaterial) {
        child.userData.originalMaterial = child.material;
      }

      if (!carColor) {
        if (child.material !== child.userData.originalMaterial) {
          child.material.dispose();
          child.material = child.userData.originalMaterial;
        }
        return;
      }

      if (isPaintable(child)) {
        if (child.material !== child.userData.originalMaterial) {
          child.material.dispose();
        }

        const m = child.userData.originalMaterial.clone();
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

        child.material = m;

      } else if (isAccent(child)) {
        if (child.material !== child.userData.originalMaterial) {
          child.material.dispose();
        }

        const m = child.userData.originalMaterial.clone();
        m.map = null;
        if (isBlackCar) {
          m.color.set('#ffffff'); m.roughness = 0.2; m.metalness = 0.5;
        } else {
          m.color.set('#1a1a1a'); m.roughness = 0.6; m.metalness = 0.3;
        }
        m.needsUpdate = true;

        child.material = m;
      }
    });

    invalidate();
  }, [scene, carColor, activeCar, invalidate, modelInfo]);

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


useGLTF.preload(MODEL_REGISTRY[DEFAULT_CAR].glbPath);

if (typeof window !== 'undefined') {
  const scheduleIdle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1500));
  scheduleIdle(() => {
    Object.entries(MODEL_REGISTRY).forEach(([name, info]) => {
      if (name === DEFAULT_CAR) return; // đã preload ở trên rồi
      useGLTF.preload(info.glbPath);
    });
  });
}