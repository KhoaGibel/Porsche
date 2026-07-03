

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import path from 'path';
import fs from 'fs';

const inputPath = process.argv[2];

if (!inputPath) {
  console.error('❌ Thiếu đường dẫn file. Dùng: node analyze-glb.js model.glb');
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error(`❌ Không tìm thấy file: ${inputPath}`);
  process.exit(1);
}

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

/**
 * Quy tắc phân loại — áp dụng được cho MỌI model GLB, không hardcode tên.
 * Dựa thuần vào THUỘC TÍNH VẬT LÝ của material, vì tên mesh do mỗi
 * tool export (Blender/Maya/3ds Max) sinh ra rất khác nhau và không đáng tin.
 */
function classifyMaterial(mat, meshName) {
  const name = (mat.getName() || meshName || '').toLowerCase();
  const baseColorTexture = mat.getBaseColorTexture();
  const metallic = mat.getMetallicFactor();
  const roughness = mat.getRoughnessFactor();
  const alpha = mat.getAlpha();
  const transmission = mat.getExtension?.('KHR_materials_transmission');
  const transmissionFactor = transmission?.getTransmissionFactor?.() ?? 0;

  const hasTextureNameHint =
    name.includes('glass') || name.includes('window') || name.includes('windshield');

  const isGlassLike =
    hasTextureNameHint ||
    transmissionFactor > 0 ||
    (alpha < 0.95 && alpha > 0);

  const isMetalTrim =
    !isGlassLike &&
    metallic >= 0.3 &&
    metallic < 0.95; // kim loại "phụ" như viền, ốc — không phải sơn chính

  const isPureMetalBody =
    !isGlassLike &&
    metallic >= 0.95 &&
    roughness >= 0.95; // sơn xe thường full metallic + full roughness trong PBR

  let category = 'unclassified';
  if (isGlassLike) category = 'glass';
  else if (isPureMetalBody) category = 'paintable_body';
  else if (isMetalTrim) category = 'trim_metal';
  else category = 'other';

  return {
    materialName: mat.getName() || '(unnamed)',
    category,
    metallic: round(metallic),
    roughness: round(roughness),
    alpha: round(alpha),
    transmission: round(transmissionFactor),
    hasBaseColorTexture: !!baseColorTexture,
    textureWarning: !!baseColorTexture
      ? '⚠️ Có texture map — đổi color sẽ chỉ TINT (nhân màu) lên texture gốc, không thay thế hoàn toàn. Nếu texture tối, kết quả sẽ tối dù chọn màu sáng.'
      : null,
  };
}

function round(n) {
  if (n === undefined || n === null) return n;
  return Math.round(n * 1000) / 1000;
}

async function analyze() {
  console.log(`\n🔍 Đang phân tích: ${inputPath}\n`);

  const doc = await io.read(inputPath);
  const root = doc.getRoot();
  const meshes = root.listMeshes();

  const report = [];
  const summary = {
    totalMeshes: 0,
    paintableCount: 0,
    glassCount: 0,
    trimCount: 0,
    otherCount: 0,
    meshesWithTexture: 0,
  };

  for (const mesh of meshes) {
    const meshName = mesh.getName() || '(unnamed mesh)';
    const primitives = mesh.listPrimitives();

    for (const prim of primitives) {
      const mat = prim.getMaterial();
      if (!mat) continue;

      summary.totalMeshes++;
      const classified = classifyMaterial(mat, meshName);

      if (classified.category === 'paintable_body') summary.paintableCount++;
      if (classified.category === 'glass') summary.glassCount++;
      if (classified.category === 'trim_metal') summary.trimCount++;
      if (classified.category === 'other') summary.otherCount++;
      if (classified.hasBaseColorTexture) summary.meshesWithTexture++;

      report.push({
        meshName,
        ...classified,
      });
    }
  }

  // In ra console, gọn gàng, dễ đọc
  console.log('─'.repeat(70));
  console.log('TỔNG QUAN');
  console.log('─'.repeat(70));
  console.log(`Tổng số mesh:               ${summary.totalMeshes}`);
  console.log(`  → Sơn được (paintable):   ${summary.paintableCount}`);
  console.log(`  → Kính (glass):           ${summary.glassCount}`);
  console.log(`  → Kim loại phụ (trim):    ${summary.trimCount}`);
  console.log(`  → Khác (other):           ${summary.otherCount}`);
  console.log(`  → Có texture map:         ${summary.meshesWithTexture}  ${summary.meshesWithTexture > 0 ? '⚠️ XEM CẢNH BÁO BÊN DƯỚI' : '✅'}`);
  console.log('─'.repeat(70));

  if (summary.meshesWithTexture > 0) {
    console.log('\n⚠️  CẢNH BÁO QUAN TRỌNG:');
    console.log('Một số mesh "paintable" có texture map. Khi đổi carColor,');
    console.log('màu sẽ NHÂN (multiply) với texture, không thay thế hoàn toàn.');
    console.log('Nếu texture tối/đen → xe vẫn trông tối dù chọn màu sáng.');
    console.log('→ Khắc phục: trong code, set material.map = null trước khi');
    console.log('  set màu, HOẶC dùng overlay tint thay vì color multiply.\n');
  }

  const paintableMeshes = report
    .filter((r) => r.category === 'paintable_body')
    .map((r) => r.meshName);

  const outputConfig = {
    sourceFile: path.basename(inputPath),
    generatedAt: new Date().toISOString(),
    summary,
    paintableMeshNames: paintableMeshes,
    fullReport: report,
  };

  const outPath = inputPath.replace(/\.glb$/i, '.paintconfig.json');
  fs.writeFileSync(outPath, JSON.stringify(outputConfig, null, 2));

  console.log(`✅ Đã ghi config: ${outPath}`);
  console.log(`\nDanh sách mesh sẽ được sơn (${paintableMeshes.length} mesh):`);
  paintableMeshes.forEach((n) => console.log(`  - ${n}`));
}

analyze().catch((err) => {
  console.error('❌ Lỗi khi phân tích:', err.message);
  process.exit(1);
});