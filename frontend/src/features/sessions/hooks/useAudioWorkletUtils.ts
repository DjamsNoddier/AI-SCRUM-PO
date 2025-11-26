export function floatTo16BitPCM(float32Samples: Float32Array): Int16Array {
    const buffer = new Int16Array(float32Samples.length);
    for (let i = 0; i < float32Samples.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Samples[i]));
      buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buffer;
  }
  