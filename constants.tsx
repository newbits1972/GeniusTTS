
import { VoiceConfig } from './types';

// Usamos las voces predefinidas confirmadas: Puck, Charon, Kore, Fenrir, Zephyr.
export const VOICES: VoiceConfig[] = [
  { id: 'v1', name: 'Alejandro', gender: 'Hombre', apiVoice: 'Puck' },
  { id: 'v2', name: 'Mateo', gender: 'Hombre', apiVoice: 'Charon' },
  { id: 'v3', name: 'Santiago', gender: 'Hombre', apiVoice: 'Fenrir' },
  { id: 'v4', name: 'Hugo', gender: 'Hombre', apiVoice: 'Puck' },
  { id: 'v5', name: 'Javier', gender: 'Hombre', apiVoice: 'Charon' },
  { id: 'v6', name: 'Lucía', gender: 'Mujer', apiVoice: 'Kore' },
  { id: 'v7', name: 'Elena', gender: 'Mujer', apiVoice: 'Zephyr' },
  { id: 'v8', name: 'Sofía', gender: 'Mujer', apiVoice: 'Kore' },
  { id: 'v9', name: 'Martina', gender: 'Mujer', apiVoice: 'Zephyr' },
  { id: 'v10', name: 'Valeria', gender: 'Mujer', apiVoice: 'Kore' },
];

export const ACCENTS = ['España', 'México', 'Argentina'] as const;
export const STYLES = [
  { id: 'alegre', label: 'Alegre', icon: 'fa-smile' },
  { id: 'triste', label: 'Triste', icon: 'fa-sad-tear' },
  { id: 'susurrar', label: 'Susurrar', icon: 'fa-comment-dots' },
  { id: 'storyteller', label: 'Storyteller', icon: 'fa-book-open' },
  { id: 'natural', label: 'Natural', icon: 'fa-leaf' },
] as const;
