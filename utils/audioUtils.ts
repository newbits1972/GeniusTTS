
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Creates a WAV file from PCM Int16 data
 */
export function createWavBlob(pcmData: Uint8Array, sampleRate: number): Blob {
  const header = new ArrayBuffer(44);
  const d = new DataView(header);

  // RIFF identifier
  d.setUint32(0, 0x52494646, false); // "RIFF"
  d.setUint32(4, 36 + pcmData.length, true);
  d.setUint32(8, 0x57415645, false); // "WAVE"

  // FMT chunk
  d.setUint32(12, 0x666d7420, false); // "fmt "
  d.setUint32(16, 16, true); // Size of fmt chunk
  d.setUint16(20, 1, true); // PCM format
  d.setUint16(22, 1, true); // Mono
  d.setUint32(24, sampleRate, true);
  d.setUint32(28, sampleRate * 2, true); // Byte rate
  d.setUint16(32, 2, true); // Block align
  d.setUint16(34, 16, true); // Bits per sample

  // Data chunk
  d.setUint32(36, 0x64617461, false); // "data"
  d.setUint32(40, pcmData.length, true);

  return new Blob([header, pcmData], { type: 'audio/wav' });
}
