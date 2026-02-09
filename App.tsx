
import React, { useState, useCallback, useRef } from 'react';
import { VOICES, ACCENTS, STYLES } from './constants';
import { TTSHistoryItem, TTSParameters, AccentType, StyleType } from './types';
import { generateSpeech } from './services/geminiTTS';
import { decode, createWavBlob } from './utils/audioUtils';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [accent, setAccent] = useState<AccentType>('España');
  const [style, setStyle] = useState<StyleType>('natural');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [history, setHistory] = useState<TTSHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Por favor, introduce algún texto.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params: TTSParameters = {
        text,
        voiceId: selectedVoice,
        accent,
        style,
        speed,
        pitch
      };

      const result = await generateSpeech(params);
      const audioBytes = decode(result.audioBase64);
      const wavBlob = createWavBlob(audioBytes, 24000);
      const audioUrl = URL.createObjectURL(wavBlob);

      const voiceName = VOICES.find(v => v.id === selectedVoice)?.name || 'Voz';

      const newItem: TTSHistoryItem = {
        id: Date.now().toString(),
        text: text.length > 50 ? text.substring(0, 47) + '...' : text,
        voice: voiceName,
        accent,
        style,
        audioUrl,
        blob: wavBlob,
        timestamp: new Date()
      };

      setHistory(prev => [newItem, ...prev]);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = speed;
        audioRef.current.play();
      }
    } catch (err: any) {
      setError(err.message || 'Error al generar el audio');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const insertTag = (tag: string) => {
    setText(prev => prev + ` [${tag}] `);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      <header className="py-8 flex flex-col items-center gap-2">
        <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight flex items-center gap-3">
          <i className="fas fa-wave-square"></i>
          VozGenius
        </h1>
        <p className="text-slate-600 font-medium">Transforma texto en voces humanas realistas</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
              <i className="fas fa-keyboard text-indigo-500"></i>
              Entrada de Texto
            </h2>
            <textarea
              className="w-full h-40 p-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none mb-4"
              placeholder="Escribe el texto que quieres convertir en voz... Prueba a usar etiquetas como [pausa], [risa], [grito] o [llanto]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-full mb-1">Etiquetas Rápidas</span>
              <button onClick={() => insertTag('pausa')} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center gap-2">
                <i className="fas fa-hourglass-half"></i> Pausa
              </button>
              <button onClick={() => insertTag('risa')} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center gap-2">
                <i className="fas fa-laugh-beam"></i> Risa
              </button>
              <button onClick={() => insertTag('grito')} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center gap-2">
                <i className="fas fa-volume-up"></i> Grito
              </button>
              <button onClick={() => insertTag('llanto')} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg text-sm font-semibold text-slate-700 transition-colors flex items-center gap-2">
                <i className="fas fa-sad-tear"></i> Llanto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">Voz</label>
                  <select 
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {VOICES.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">Acento</label>
                  <select 
                    value={accent}
                    onChange={(e) => setAccent(e.target.value as AccentType)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {ACCENTS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1">Estilo</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STYLES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id as StyleType)}
                        className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                          style === s.id 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <i className={`fas ${s.icon} text-lg mb-1`}></i>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800">Velocidad</label>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">{speed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" min="0.5" max="2.0" step="0.1" 
                  value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800">Tono (Pitch)</label>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold">
                    {pitch < 0.8 ? 'Muy Grave' : pitch < 1 ? 'Grave' : pitch === 1 ? 'Normal' : pitch < 1.3 ? 'Agudo' : 'Muy Agudo'}
                  </span>
                </div>
                <input 
                  type="range" min="0.5" max="1.5" step="0.05" 
                  value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              {error && (
                <div className="w-full p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <i className="fas fa-exclamation-circle text-red-500"></i>
                  {error}
                </div>
              )}
              
              <button
                disabled={isLoading}
                onClick={handleGenerate}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 ${
                  isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generando Voz...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Generar Speech
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full max-h-[850px] flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2 sticky top-0 bg-white py-1">
              <i className="fas fa-history text-indigo-500"></i>
              Historial
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <i className="fas fa-microphone-slash text-5xl mb-4 opacity-20"></i>
                  <p className="text-center font-medium opacity-60 text-slate-500">No hay audios generados aún</p>
                </div>
              ) : (
                history.map(item => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-all group">
                    <p className="text-sm font-medium text-slate-900 line-clamp-2 mb-3">"{item.text}"</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600 uppercase">{item.voice}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600 uppercase">{item.accent}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full uppercase">{item.style}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.src = item.audioUrl;
                            audioRef.current.play();
                          }
                        }}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <i className="fas fa-play-circle text-2xl"></i>
                      </button>
                      <a 
                        href={item.audioUrl} 
                        download={`vozgenius-${item.id}.wav`}
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                      >
                        <i className="fas fa-download"></i>
                        Descargar
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <audio ref={audioRef} className="hidden" />

      <footer className="mt-12 text-center text-slate-500 text-sm border-t border-slate-200 pt-8 flex flex-col items-center gap-3">
        <p>© 2024 VozGenius TTS. Impulsado por Gemini 2.5 Flash.</p>
        <a 
          href="https://github.com/newbits1972/GeniusTTS.git" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full font-bold text-xs hover:bg-slate-800 transition-all shadow-md active:scale-95"
        >
          <i className="fab fa-github text-base"></i>
          GitHub Repository
        </a>
      </footer>
    </div>
  );
};

export default App;
