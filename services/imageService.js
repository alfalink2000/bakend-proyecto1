// services/imageService.js - VERSIÓN MÁXIMA COMPRESIÓN
const axios = require("axios");
const sharp = require("sharp");

const uploadToImgBB = async (fileBuffer) => {
  try {
    console.log("🔄 Optimizando imagen con compresión máxima...");

    // OBTENER METADATOS PARA DECIDIR ESTRATEGIA
    const metadata = await sharp(fileBuffer).metadata();
    console.log(
      "📐 Imagen original:",
      `${metadata.width}x${metadata.height}`,
      `- Formato: ${metadata.format}`
    );

    // ESTRATEGIA DE COMPRESIÓN MÁXIMA
    const optimizedImage = await sharp(fileBuffer)
      .resize(600, 400, {
        // ← MÁS PEQUEÑO
        fit: "inside",
        withoutEnlargement: true,
        fastShrinkOnLoad: true, // ← MÁS RÁPIDO
      })
      .jpeg({
        quality: 65, // ← CALIDAD MÁS BAJA
        mozjpeg: true, // ← COMPRESIÓN AVANZADA
        chromaSubsampling: "4:2:0", // ← COMPRESIÓN CROMÁTICA
        optimiseScans: true, // ← OPTIMIZACIÓN EXTRA
        trellisQuantisation: true, // ← CUANTIZACIÓN TRELLIS
        overshootDeringing: true, // ← REDUCE ARTEFACTOS
        optimiseCoding: true, // ← CODIFICACIÓN ÓPTIMA
      })
      .toBuffer();

    // VERIFICAR TAMAÑO COMPRIMIDO
    const originalSizeKB = Math.round(fileBuffer.length / 1024);
    const compressedSizeKB = Math.round(optimizedImage.length / 1024);
    const reduction = Math.round((1 - compressedSizeKB / originalSizeKB) * 100);

    console.log(
      `📊 Compresión: ${originalSizeKB}KB → ${compressedSizeKB}KB (${reduction}% reducido)`
    );

    // SUBIR A IMGBB
    console.log("📤 Subiendo a ImgBB...");
    const base64Image = optimizedImage.toString("base64");

    const apiKey = process.env.IMGBB_API_KEY || "tu_api_key_aqui";

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      `image=${encodeURIComponent(base64Image)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 30000,
      }
    );

    if (response.data.success) {
      console.log("✅ Imagen subida exitosamente a:", response.data.data.url);
      return response.data.data.url;
    } else {
      throw new Error(
        response.data.error?.message || "Error desconocido de ImgBB"
      );
    }
  } catch (error) {
    console.error("❌ Error en uploadToImgBB:", error);
    throw error;
  }
};

module.exports = {
  uploadToImgBB,
};
