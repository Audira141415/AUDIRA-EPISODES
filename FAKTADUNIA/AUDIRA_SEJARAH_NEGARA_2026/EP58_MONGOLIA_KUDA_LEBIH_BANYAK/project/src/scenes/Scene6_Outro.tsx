import React from "react";
import * as THREE from "three";

/**
 * Outro: Epilog Megah (85s – 92s)
 * WAJIB: Tampilkan visual hero yang mencerminkan apa yang diucapkan narator pada detik ini.
 * DILARANG: Membiarkan objek statis tanpa relevansi narasi.
 */
export const Scene6_Outro: React.FC<{ t: number }> = ({ t }) => {
  return (
    <group>
      {/* TODO: Letakkan hero asset (.glb), pencahayaan spesifik, dan environment babak ini */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
    </group>
  );
};
