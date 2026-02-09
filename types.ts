
export type AccentType = 'España' | 'México' | 'Argentina';
export type StyleType = 'alegre' | 'triste' | 'susurrar' | 'storyteller' | 'natural';
export type GenderType = 'Hombre' | 'Mujer';

export interface VoiceConfig {
  id: string;
  name: string;
  gender: GenderType;
  apiVoice: string; // Internal prebuiltVoiceConfig name
}

export interface TTSHistoryItem {
  id: string;
  text: string;
  voice: string;
  accent: AccentType;
  style: StyleType;
  audioUrl: string;
  timestamp: Date;
  blob: Blob;
}

export interface TTSParameters {
  text: string;
  voiceId: string;
  accent: AccentType;
  style: StyleType;
  speed: number;
  pitch: number;
}
