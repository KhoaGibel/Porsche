import { useRef } from 'react';
import { SpotLight } from '@react-three/drei';
import * as THREE from 'three';

export default function SpotlightRig() {
  const mainSpot = useRef();
  const rimSpot  = useRef();

  return (
    <>
      {/* ── KEY LIGHT — Đèn trần showroom ── */}
      <SpotLight
        ref={mainSpot}
        position={[0, 7, 6]}       
        target-position={[0, 0, 0]}
        intensity={400}            
        distance={25}
        angle={0.8}                
        penumbra={0.6}             
        color="#fff5e0"
        
        /* ── CHỈNH SỬA TẠI ĐÂY ── */
        castShadow = {false}
        shadow-mapSize={[2048, 2048]} // Giữ nguyên độ nét của bóng
        shadow-bias={-0.001}          // Tăng mức bù trừ âm để xóa vệt đen
        shadow-normalBias={0.05}      // 🔥 MAGIC BULLET: Xử lý dứt điểm mảng đen trên bề mặt cong
        /* ─────────────────────── */

        attenuation={4}            
        anglePower={2}             
      />

      {/* ── 🔥 FRONT FILL LIGHT (ĐÃ NÂNG CẤP) ── 
          Đổi PointLight thành DirectionalLight.
          Tia sáng song song sẽ quét sạch bóng tối ở mọi ngóc ngách hốc gió cản trước.
      */}
      <directionalLight
        position={[0, 2, 10]}       
        // DirectionalLight dùng thang đo cường độ nhỏ hơn rất nhiều (tầm 2-5 là cực sáng)
        intensity={3.5} 
        color="#ffffff"
      />

      {/* ── FILL LIGHT (Phải) ── */}
      <pointLight
        position={[6, 3, 4]}       
        intensity={100}            
        color="#c8d8ff"
        distance={15}
      />

      {/* ── FILL LIGHT (Trái) ── */}
      <pointLight
        position={[-6, 3, 4]}
        intensity={60}             
        color="#ffffff"
        distance={15}
      />

      {/* ── RIM LIGHT ── */}
      <SpotLight
        ref={rimSpot}
        position={[-4, 5, -6]}
        target-position={[0, 0.5, 0]}
        intensity={250}
        distance={20}
        angle={0.7}
        penumbra={0.5}
        color="#e0eeff"
        castShadow={false}
        attenuation={4}
        anglePower={2}
      />

      {/* ── GROUND BOUNCE ── */}
      <pointLight
        position={[0, -0.5, 2]}    
        intensity={8}              
        color="#ffffff"
        distance={6}
      />
    </>
  );
}