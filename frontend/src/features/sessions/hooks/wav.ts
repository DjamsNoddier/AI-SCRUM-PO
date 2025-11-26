export function floatTo16BitPCM(float32Samples: Float32Array): Int16Array {
    const len = float32Samples.length;
    const result = new Int16Array(len);
  
    for (let i = 0; i < len; i++) {
      let s = Math.max(-1, Math.min(1, float32Samples[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
  
    return result;
  }
  
  export function buildWavFileFromPCM(pcm: Int16Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + pcm.length * 2);
    const view = new DataView(buffer);
  
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
  
    writeString(0, "RIFF");
    view.setUint32(4, 36 + pcm.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
  
    writeString(36, "data");
    view.setUint32(40, pcm.length * 2, true);
  
    let offset = 44;
    for (let i = 0; i < pcm.length; i++, offset += 2) {
      view.setInt16(offset, pcm[i], true);
    }
  
    return new Blob([buffer], { type: "audio/wav" });
  }
  