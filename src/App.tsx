import React, { useState, useRef } from 'react'
import { Mic, Music, Play, Pause, Square, Save, Settings, Volume2, Waves, Download, Upload, Disc } from 'lucide-react'
import { useAudioEngine } from './hooks/useAudioEngine'
import LiveVisualizer from './components/LiveVisualizer'

const SAMPLE_BEATS = [
    // Custom Samples
    { id: 'c1', name: 'Oriental Instrumental 1', url: '/sample/Untitled Instrumental Collection (1).mp3', genre: 'Oriental' },
    { id: 'c2', name: 'Oriental Instrumental 2', url: '/sample/Untitled Instrumental Collection (2).mp3', genre: 'Oriental' },
    { id: 'c3', name: 'Oriental Instrumental 3', url: '/sample/Untitled Instrumental Collection (3).mp3', genre: 'Oriental' },
    { id: 'c4', name: 'Oriental Instrumental 4', url: '/sample/Untitled Instrumental Collection (4).mp3', genre: 'Oriental' },
    { id: 'c5', name: 'Oriental Instrumental Full', url: '/sample/Untitled Instrumental Collection.mp3', genre: 'Oriental' },
    { id: 'c6', name: 'Whiskey in the Wind 1', url: '/sample/Whiskey in the Wind (1).mp3', genre: 'Acoustic' },
    { id: 'c7', name: 'Whiskey in the Wind 2', url: '/sample/Whiskey in the Wind (2).mp3', genre: 'Acoustic' },
    { id: 'c8', name: 'Whiskey in the Wind 3', url: '/sample/Whiskey in the Wind (3).mp3', genre: 'Acoustic' },
    { id: 'c9', name: 'Whiskey in the Wind 4', url: '/sample/Whiskey in the Wind (4).mp3', genre: 'Acoustic' },
    { id: 'c10', name: 'Whiskey in the Wind 5', url: '/sample/Whiskey in the Wind (5).mp3', genre: 'Acoustic' },
    { id: 'c11', name: 'Whiskey in the Wind Full', url: '/sample/Whiskey in the Wind.mp3', genre: 'Acoustic' },
    { id: 'c12', name: 'Whiskey in the Wind2 (1)', url: '/sample/Whiskey in the Wind2 (1).mp3', genre: 'Acoustic' },
    { id: 'c13', name: 'Whiskey in the Wind2 (2)', url: '/sample/Whiskey in the Wind2 (2).mp3', genre: 'Acoustic' },
    { id: 'c14', name: 'Whiskey in the Wind2 (3)', url: '/sample/Whiskey in the Wind2 (3).mp3', genre: 'Acoustic' },
    { id: 'c15', name: 'Whiskey in the Wind2 Full', url: '/sample/Whiskey in the Wind2.mp3', genre: 'Acoustic' },
    { id: 'c16', name: 'Whispers of the Sand 1', url: '/sample/Whispers 45of the Sand (1).mp3', genre: 'Ethereal' },
    { id: 'c17', name: 'Whispers of the Sand Full', url: '/sample/Whispers 45of the Sand.mp3', genre: 'Ethereal' },
    { id: 'c18', name: 'Whispers of the Past', url: '/sample/Whispers of the Past.mp3', genre: 'Ethereal' },
    { id: 'c19', name: 'Whispers of the Sand v2', url: '/sample/Whispers of78 the Sand.mp3', genre: 'Ethereal' },
    { id: 'c20', name: 'Desert Gravity', url: '/sample/trip hop orientalDesert Gravity.mp3', genre: 'Trip Hop' },
    { id: 'c21', name: 'أصوات الظلال 1', url: '/sample/أصوات الظلال (1).mp3', genre: 'Ambient' },
    { id: 'c22', name: 'أصوات الظلال كاملة', url: '/sample/أصوات الظلال.mp3', genre: 'Ambient' },
    { id: 'c23', name: 'رعب في الشوارع 1', url: '/sample/رعب في الشوارع (1).mp3', genre: 'Cinematic' },
    { id: 'c24', name: 'رعب في الشوارع 2', url: '/sample/رعب في الشوارع (2).mp3', genre: 'Cinematic' },
    { id: 'c25', name: 'رعب في الشوارع 3', url: '/sample/رعب في الشوارع (3).mp3', genre: 'Cinematic' },
    { id: 'c26', name: 'رعب في الشوارع كاملة', url: '/sample/رعب في الشوارع.mp3', genre: 'Cinematic' },
];

function App() {
    const {
        isRecording,
        isPlayingA,
        isPlayingB,
        isMicActive,
        crossfade,
        deckGains,
        micGain,
        startRecording,
        stopRecording,
        loadBeat,
        effects,
        toggleEffect,
        togglePlay,
        setCrossfade,
        setDeckGain,
        setMicGain,
        toggleMic,
        recordedBlobUrl,
        isLoading,
        analyser,
        engineStatus
    } = useAudioEngine();

    const [selectedDeck, setSelectedDeck] = useState<'A' | 'B'>('A');
    const [lastLoadedA, setLastLoadedA] = useState<string | null>(null);
    const [lastLoadedB, setLastLoadedB] = useState<string | null>(null);
    const [showExportToast, setShowExportToast] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLAudioElement | null>(null);

    const handleBeatSelect = (beat: typeof SAMPLE_BEATS[0]) => {
        loadBeat(selectedDeck, beat.url);
        if (selectedDeck === 'A') setLastLoadedA(beat.name);
        else setLastLoadedB(beat.name);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            loadBeat(selectedDeck, file);
            if (selectedDeck === 'A') setLastLoadedA(file.name);
            else setLastLoadedB(file.name);
        }
    };


    const handlePreview = () => {
        if (recordedBlobUrl) {
            if (previewRef.current) previewRef.current.pause();
            previewRef.current = new Audio(recordedBlobUrl);
            previewRef.current.play();
        }
    };

    const handleExport = () => {
        if (recordedBlobUrl) {
            const link = document.createElement('a');
            link.href = recordedBlobUrl;
            link.download = `mixed-studio-track-${Date.now()}.webm`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setShowExportToast(true);
            setTimeout(() => setShowExportToast(false), 3000);
        } else {
            alert("No recording available. Drop some bars first! 🎤");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans selection:bg-red-500/30">
            {/* Toast Notification */}
            {showExportToast && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce flex items-center gap-2">
                    <Download size={18} /> MIXDOWN DOWNLOADED
                </div>
            )}

            <header className="mb-12 flex justify-between items-center group">
                <div>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent italic animate-gradient">
                        THE SoNo MiXeR
                    </h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-zinc-500 uppercase tracking-widest text-sm flex items-center gap-2">
                            <span className="w-8 h-[1px] bg-zinc-800 group-hover:w-12 transition-all"></span>
                            Professional Studio Deck
                        </p>
                        <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${engineStatus.includes('Error') ? 'bg-red-500 animate-pulse' : engineStatus !== 'Ready' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-[10px] font-black uppercase text-zinc-500">{engineStatus}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="p-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Vocal Booth */}
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Mic className={isRecording ? "text-red-500 animate-pulse" : "text-red-500"} />
                            Studio Booth
                        </h2>

                        <div className="h-32 bg-zinc-950 rounded-2xl border border-zinc-800/50 flex items-center justify-center relative overflow-hidden p-4">
                            {(isPlayingA || isPlayingB || isRecording) ? (
                                <LiveVisualizer analyser={analyser} />
                            ) : (
                                <div className="text-zinc-700 font-mono text-xs uppercase tracking-[0.5em]">Mic Ready</div>
                            )}
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <div className="flex gap-4">
                                {isRecording ? (
                                    <button onClick={stopRecording} className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-black"><Square size={18} fill="currentColor" /> STOP</button>
                                ) : (
                                    <button onClick={startRecording} className="flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-full font-black"><Mic size={18} /> RECORD</button>
                                )}
                                <button onClick={handlePreview} disabled={!recordedBlobUrl} className="flex items-center gap-2 bg-zinc-800 px-8 py-3 rounded-full font-black disabled:opacity-30"><Play size={18} /> PREVIEW</button>
                            </div>
                        </div>
                    </section>

                    {/* 3rd Channel (Mic) & Decks */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_1fr] gap-4 items-center">
                        {/* Deck A */}
                        <div className={`p-6 rounded-3xl border transition-all ${selectedDeck === 'A' ? 'bg-orange-500/10 border-orange-500' : 'bg-zinc-900/50 border-zinc-800'}`} onClick={() => setSelectedDeck('A')}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-black uppercase text-orange-500 tracking-tighter">Deck A</span>
                                {isLoading.A && <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}
                            </div>
                            <div className="h-24 bg-zinc-950 rounded-xl mb-4 flex flex-col items-center justify-center border border-zinc-800/50 relative overflow-hidden">
                                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest relative z-10">{lastLoadedA || "Empty"}</span>
                                {lastLoadedA && (
                                    <Disc className={`absolute text-white/5 w-20 h-20 -right-4 -bottom-4 ${isPlayingA ? 'animate-spin-slow' : ''}`} />
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <Volume2 size={12} className="text-zinc-500" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={deckGains.A}
                                        onChange={(e) => setDeckGain('A', parseFloat(e.target.value))}
                                        className="w-full h-1 accent-orange-500"
                                    />
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); togglePlay('A'); }} className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 ${isPlayingA ? 'bg-zinc-800' : 'bg-white text-black'}`}>
                                    {isPlayingA ? <Pause size={18} /> : <Play size={18} />} {isPlayingA ? "STOP" : "PLAY A"}
                                </button>
                            </div>
                        </div>

                        {/* Mic Channel (3rd Fader) */}
                        <div className="flex flex-col items-center gap-2 p-4 bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
                            <span className="text-[10px] font-black text-zinc-500">VOICE</span>
                            <div className="h-40 w-12 bg-zinc-950 rounded-full border border-zinc-800 flex items-center justify-center relative py-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={micGain}
                                    onChange={(e) => setMicGain(parseFloat(e.target.value))}
                                    className="appearance-none bg-transparent w-32 h-1 cursor-pointer -rotate-90 absolute accent-white"
                                />
                            </div>
                            <button
                                onClick={toggleMic}
                                className={`p-3 rounded-full transition-all ${isMicActive ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-zinc-800 text-zinc-500'}`}
                            >
                                <Mic size={18} />
                            </button>
                        </div>

                        {/* Crossfader */}
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-black text-zinc-500 rotate-90">FADE</span>
                            <div className="h-48 w-12 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center relative py-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={crossfade}
                                    onChange={(e) => setCrossfade(parseFloat(e.target.value))}
                                    className="appearance-none bg-transparent w-40 h-1 cursor-pointer -rotate-90 absolute accent-orange-500"
                                />
                            </div>
                            <span className="text-[10px] font-black text-zinc-500">CROSS</span>
                        </div>

                        {/* Deck B */}
                        <div className={`p-6 rounded-3xl border transition-all ${selectedDeck === 'B' ? 'bg-red-500/10 border-red-500' : 'bg-zinc-900/50 border-zinc-800'}`} onClick={() => setSelectedDeck('B')}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-black uppercase text-red-500 tracking-tighter">Deck B</span>
                                {isLoading.B && <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>}
                            </div>
                            <div className="h-24 bg-zinc-950 rounded-xl mb-4 flex flex-col items-center justify-center border border-zinc-800/50 relative overflow-hidden">
                                <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest relative z-10">{lastLoadedB || "Empty"}</span>
                                {lastLoadedB && (
                                    <Disc className={`absolute text-white/5 w-20 h-20 -right-4 -bottom-4 ${isPlayingB ? 'animate-spin-slow' : ''}`} />
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <Volume2 size={12} className="text-zinc-500" />
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={deckGains.B}
                                        onChange={(e) => setDeckGain('B', parseFloat(e.target.value))}
                                        className="w-full h-1 accent-red-500"
                                    />
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); togglePlay('B'); }} className={`w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 ${isPlayingB ? 'bg-zinc-800' : 'bg-white text-black'}`}>
                                    {isPlayingB ? <Pause size={18} /> : <Play size={18} />} {isPlayingB ? "STOP" : "PLAY B"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">Beat Library <span className="text-[10px] font-normal text-zinc-500 uppercase">Load to {selectedDeck}</span></h2>
                            <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full"><Upload size={14} /> UPLOAD</button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="audio/*" />
                        </div>


                        <div className="max-h-64 overflow-y-auto pr-2 grid grid-cols-2 gap-3 scrollbar-hide">
                            {SAMPLE_BEATS.map((beat) => (
                                <button
                                    key={beat.id}
                                    onClick={() => handleBeatSelect(beat)}
                                    className="p-4 bg-zinc-950/50 border border-zinc-800 hover:border-zinc-500 rounded-2xl text-left transition-all group"
                                >
                                    <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">{beat.genre}</p>
                                    <p className="font-bold text-sm group-hover:text-orange-500 transition-colors">{beat.name}</p>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Effects Table */}
                    <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
                        <h2 className="text-xl font-bold mb-6">Master FX</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {(Object.keys(effects) as Array<keyof typeof effects>).map((fx) => (
                                <button
                                    key={fx}
                                    onClick={() => toggleEffect(fx)}
                                    className={`w-full p-4 rounded-2xl border flex justify-between items-center transition-all ${effects[fx] ? 'bg-orange-500/20 border-orange-500' : 'bg-zinc-950 border-zinc-800'}`}
                                >
                                    <span className="font-bold capitalize">{fx}</span>
                                    <div className={`w-3 h-3 rounded-full ${effects[fx] ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-zinc-800'}`}></div>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Export */}
                    <section className="bg-gradient-to-br from-red-600/20 to-orange-600/20 border border-orange-500/20 rounded-3xl p-8 backdrop-blur-xl text-center">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Export Result</h3>
                        <button onClick={handleExport} className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-all">
                            <Save size={20} /> {recordedBlobUrl ? "DOWNLOAD MIXDOWN" : "RECORD FIRST"}
                        </button>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default App
