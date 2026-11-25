import React from "react";
import * as THREE from "three";

/**
 * Development: Arsitektur & Detail (35s – 60s)
 * WAJIB: Tampilkan visual hero yang mencerminkan apa yang diucapkan narator pada detik ini.
 * DILARANG: Membiarkan objek statis tanpa relevansi narasi.
 */
export const Scene3_Development: React.FC<{ t: number }> = ({ t }) => {
  return (
    <group>
      {/* TODO: Letakkan hero asset (.glb), pencahayaan spesifik, dan environment babak ini */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
    </group>
  );
};
