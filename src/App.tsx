import React, { useState, useRef, useEffect } from 'react'
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

// Orientation Prompt Component
const OrientationPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

    useEffect(() => {
        const handleOrientationChange = () => {
            const portrait = window.innerHeight > window.innerWidth;
            setIsPortrait(portrait);
            if (portrait && window.innerWidth < 768) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        if (isPortrait && window.innerWidth < 768) {
            setShowPrompt(true);
        }

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, [isPortrait]);

    if (!showPrompt || !isPortrait || window.innerWidth >= 768) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 border border-purple-500 rounded-3xl p-8 text-center max-w-sm mx-auto">
                <h2 className="text-2xl font-black mb-4">Rotate Your Device</h2>
                <p className="text-lg mb-6">For the best double deck experience, please rotate your device to landscape mode 🎛️</p>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="px-8 py-3 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all w-full"
                >
                    Got It!
                </button>
            </div>
        </div>
    );
};

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
    const [showSettings, setShowSettings] = useState(false);
    const [backgroundTheme, setBackgroundTheme] = useState<'psychedelic' | 'dark' | 'light'>('psychedelic');
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

    // Render background based on theme
    const renderBackground = () => {
        if (backgroundTheme === 'psychedelic') {
            return (
                <>
                    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 opacity-20 animate-pulse-slow pointer-events-none" />
                    <div className="fixed inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                        <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                        <div className="absolute bottom-0 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
                    </div>
                </>
            );
        } else if (backgroundTheme === 'dark') {
            return <div className="fixed inset-0 bg-[#0a0a0a] pointer-events-none" />;
        } else if (backgroundTheme === 'light') {
            return (
                <>
                    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 pointer-events-none" />
                    <div className="fixed inset-0 pointer-events-none opacity-30">
                        <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                        <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
                        <div className="absolute bottom-0 left-1/3 w-48 h-48 sm:w-96 sm:h-96 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
                    </div>
                </>
            );
        }
    };

    const getTextColorClass = () => {
        return backgroundTheme === 'light' ? 'text-gray-900' : 'text-white';
    };

    const getHeaderSubtextClass = () => {
        return backgroundTheme === 'light' ? 'text-gray-500' : 'text-zinc-500';
    };

    return (
        <div className={`min-h-screen ${backgroundTheme === 'light' ? 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200' : 'bg-gradient-to-br from-purple-900 via-pink-800 to-blue-900'} ${getTextColorClass()} p-4 sm:p-8 font-sans selection:bg-red-500/30 relative flex flex-col`}>
            {/* Background Layers */}
            {renderBackground()}
            <div className="relative z-10 flex flex-col">
                {/* Settings Modal */}
                {showSettings && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
                        <div className={`${backgroundTheme === 'light'
                            ? 'bg-white border-gray-300'
                            : 'bg-gradient-to-br from-zinc-900 to-black border-zinc-700'
                            } border rounded-3xl p-8 max-w-md w-full`}>
                            <h2 className="text-2xl font-black mb-6">Visualization Settings</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setBackgroundTheme('psychedelic');
                                        setShowSettings(false);
                                    }}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-bold ${backgroundTheme === 'psychedelic'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : backgroundTheme === 'light'
                                            ? 'border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-100'
                                            : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500" />
                                        <div>
                                            <p>Psychedelic</p>
                                            <p className="text-xs font-normal opacity-70">Animated blobs & colors</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        setBackgroundTheme('dark');
                                        setShowSettings(false);
                                    }}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-bold ${backgroundTheme === 'dark'
                                        ? 'border-orange-500 bg-orange-500/10'
                                        : backgroundTheme === 'light'
                                            ? 'border-gray-300 bg-gray-50 text-gray-900 hover:bg-gray-100'
                                            : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-[#0a0a0a] border border-zinc-700" />
                                        <div>
                                            <p>Dark</p>
                                            <p className="text-xs font-normal opacity-70">Classic dark mode</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        setBackgroundTheme('light');
                                        setShowSettings(false);
                                    }}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left font-bold ${backgroundTheme === 'light'
                                        ? 'border-orange-500 bg-orange-500/10 text-gray-900'
                                        : 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-300" />
                                        <div>
                                            <p>Light</p>
                                            <p className="text-xs font-normal opacity-70">Eye-friendly with gray tones</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowSettings(false)}
                                className={`w-full mt-6 p-3 rounded-xl font-bold transition-all ${backgroundTheme === 'light'
                                    ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                    }`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {showExportToast && (
                    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce flex items-center gap-2">
                        <Download className="w-[18px] h-[18px]" /> MIXDOWN DOWNLOADED
                    </div>
                )}

                <header className="mb-4 sm:mb-12 flex justify-between items-start sm:items-center group flex-shrink-0">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-5xl font-black tracking-normal bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent italic animate-gradient">
                            THE SoNo MiXeR
                        </h1>
                        <div className="hidden sm:flex items-center gap-4 mt-2">
                            <p className={`${getHeaderSubtextClass()} uppercase tracking-widest text-sm flex items-center gap-2`}>
                                <span className={`w-8 h-[1px] ${backgroundTheme === 'light' ? 'bg-gray-300' : 'bg-zinc-800'} group-hover:w-12 transition-all`}></span>
                                Professional Studio Deck
                            </p>
                            <div className={`px-3 py-1 rounded-full flex items-center gap-2 border ${backgroundTheme === 'light'
                                ? 'bg-gray-200 border-gray-300'
                                : 'bg-zinc-900 border-zinc-800'
                                }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${engineStatus.includes('Error') ? 'bg-red-500 animate-pulse' : engineStatus !== 'Ready' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                                <span className={`text-[10px] font-black uppercase ${getHeaderSubtextClass()}`}>{engineStatus}</span>
                            </div>
                        </div>
                        <div className="sm:hidden flex items-center gap-2 mt-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${engineStatus.includes('Error') ? 'bg-red-500 animate-pulse' : engineStatus !== 'Ready' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className={`text-[10px] font-black uppercase ${getHeaderSubtextClass()}`}>{engineStatus}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setShowSettings(!showSettings)} className={`p-2 sm:p-2 rounded-full transition-colors ${backgroundTheme === 'light'
                            ? 'bg-gray-200 border border-gray-300 hover:bg-gray-300 text-gray-600 hover:text-gray-900'
                            : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}>
                            <Settings className="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 flex-1">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                        {/* Vocal Booth */}
                        <section className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl relative overflow-hidden group border transition-all ${backgroundTheme === 'light'
                            ? 'bg-white/80 border-gray-400'
                            : 'bg-zinc-900/50 border-zinc-800'
                            }`}>
                            <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-6 flex items-center gap-2">
                                <Mic className={isRecording ? "text-red-500 animate-pulse" : "text-red-500"} />
                                Studio Booth
                            </h2>

                            <div className={`h-24 sm:h-32 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden p-2 sm:p-4 border transition-all ${backgroundTheme === 'light'
                                ? 'bg-gray-200 border-gray-400'
                                : 'bg-zinc-950 border-zinc-800/50'
                                }`}>
                                {(isPlayingA || isPlayingB || isRecording) ? (
                                    <LiveVisualizer analyser={analyser} />
                                ) : (
                                    <div className={`font-mono text-[8px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] ${backgroundTheme === 'light' ? 'text-gray-600' : 'text-zinc-700'}`}>Mic Ready</div>
                                )}
                            </div>

                            <div className="mt-4 sm:mt-8 flex items-center justify-between gap-2">
                                <div className="flex gap-2 sm:gap-4 flex-wrap">
                                    {isRecording ? (
                                        <button onClick={stopRecording} className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 rounded-full font-black text-sm sm:text-base transition-all ${backgroundTheme === 'light'
                                            ? 'bg-gray-400 text-white hover:bg-gray-500'
                                            : 'bg-white text-black hover:bg-gray-100'
                                            }`}><Square size={14} fill="currentColor" /> STOP</button>
                                    ) : (
                                        <button onClick={startRecording} className="flex items-center gap-1 sm:gap-2 bg-red-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full font-black text-sm sm:text-base hover:bg-red-700 transition-all"><Mic size={14} /> RECORD</button>
                                    )}
                                    <button onClick={handlePreview} disabled={!recordedBlobUrl} className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 rounded-full font-black text-sm sm:text-base disabled:opacity-30 transition-all ${backgroundTheme === 'light'
                                        ? 'bg-gray-400 text-white hover:bg-gray-500'
                                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                        }`}><Play size={14} /> PREVIEW</button>
                                </div>
                            </div>
                        </section>

                        {/* 3rd Channel (Mic) & Decks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_1fr] gap-4 items-center flex-shrink-0 transition-all">
                            {/* Deck A */}
                            <div className={`p-3 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${selectedDeck === 'A' ? backgroundTheme === 'light' ? 'bg-orange-100 border-orange-400' : 'bg-orange-500/10 border-orange-500' : backgroundTheme === 'light' ? 'bg-white/70 border-gray-300' : 'bg-zinc-900/50 border-zinc-800'}`} onClick={() => setSelectedDeck('A')}>
                                <div className="flex justify-between items-center mb-2 sm:mb-4">
                                    <span className="text-[10px] sm:text-xs font-black uppercase text-orange-500 tracking-tighter">Deck A</span>
                                    {isLoading.A && <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>}
                                </div>
                                <div className={`h-16 sm:h-24 rounded-lg sm:rounded-xl mb-2 sm:mb-4 flex flex-col items-center justify-center border relative overflow-hidden ${backgroundTheme === 'light'
                                    ? 'bg-gray-300 border-gray-400'
                                    : 'bg-zinc-950 border-zinc-800/50'
                                    }`}>
                                    <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-widest relative z-10 ${backgroundTheme === 'light' ? 'text-gray-700' : 'text-zinc-600'
                                        }`}>{lastLoadedA || "Empty"}</span>
                                    {lastLoadedA && (
                                        <Disc className={`absolute text-white/5 w-12 h-12 sm:w-20 sm:h-20 -right-4 -bottom-4 ${isPlayingA ? 'animate-spin-slow' : ''}`} />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <Volume2 className="w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] text-zinc-500 flex-shrink-0" />
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
                                    <button onClick={(e) => { e.stopPropagation(); togglePlay('A'); }} className={`w-full py-2 sm:py-4 rounded-lg sm:rounded-xl font-black flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base transition-all ${isPlayingA
                                        ? backgroundTheme === 'light' ? 'bg-gray-400 text-white' : 'bg-zinc-800 text-white'
                                        : backgroundTheme === 'light' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white text-black hover:bg-gray-100'
                                        }`}>
                                        {isPlayingA ? <Pause className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" /> : <Play className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" />} {isPlayingA ? "STOP" : "PLAY A"}
                                    </button>
                                </div>
                            </div>

                            {/* Mic Channel (3rd Fader) */}
                            <div className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all lg:order-2 order-3 ${backgroundTheme === 'light'
                                ? 'bg-white/70 border-gray-300'
                                : 'bg-zinc-900/30 border-zinc-800/50'
                                }`}>
                                <span className={`text-[10px] font-black ${backgroundTheme === 'light' ? 'text-gray-600' : 'text-zinc-500'}`}>VOICE</span>
                                <div className={`h-40 w-12 rounded-full border flex items-center justify-center relative py-4 ${backgroundTheme === 'light'
                                    ? 'bg-gray-200 border-gray-400'
                                    : 'bg-zinc-950 border-zinc-800'
                                    }`}>
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
                                    className={`p-3 rounded-full transition-all ${isMicActive
                                        ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                        : backgroundTheme === 'light' ? 'bg-gray-400 text-white' : 'bg-zinc-800 text-zinc-500'
                                        }`}
                                >
                                    <Mic size={18} />
                                </button>
                            </div>

                            {/* Crossfader */}
                            <div className="flex flex-col items-center gap-2 lg:order-3 order-4">
                                <span className={`text-[10px] font-black rotate-90 ${backgroundTheme === 'light' ? 'text-gray-600' : 'text-zinc-500'}`}>FADE</span>
                                <div className={`h-48 w-12 rounded-full border flex items-center justify-center relative py-4 ${backgroundTheme === 'light'
                                    ? 'bg-gray-200 border-gray-400'
                                    : 'bg-zinc-900 border-zinc-800'
                                    }`}>
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
                                <span className={`text-[10px] font-black ${backgroundTheme === 'light' ? 'text-gray-600' : 'text-zinc-500'}`}>CROSS</span>
                            </div>

                            {/* Deck B */}
                            <div className={`p-3 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all lg:order-4 order-2 ${selectedDeck === 'B' ? backgroundTheme === 'light' ? 'bg-red-100 border-red-400' : 'bg-red-500/10 border-red-500' : backgroundTheme === 'light' ? 'bg-white/70 border-gray-300' : 'bg-zinc-900/50 border-zinc-800'}`} onClick={() => setSelectedDeck('B')}>
                                <div className="flex justify-between items-center mb-2 sm:mb-4">
                                    <span className="text-[10px] sm:text-xs font-black uppercase text-red-500 tracking-tighter">Deck B</span>
                                    {isLoading.B && <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>}
                                </div>
                                <div className={`h-16 sm:h-24 rounded-lg sm:rounded-xl mb-2 sm:mb-4 flex flex-col items-center justify-center border relative overflow-hidden ${backgroundTheme === 'light'
                                    ? 'bg-gray-300 border-gray-400'
                                    : 'bg-zinc-950 border-zinc-800/50'
                                    }`}>
                                    <span className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-widest relative z-10 ${backgroundTheme === 'light' ? 'text-gray-700' : 'text-zinc-600'
                                        }`}>{lastLoadedB || "Empty"}</span>
                                    {lastLoadedB && (
                                        <Disc className={`absolute text-white/5 w-12 h-12 sm:w-20 sm:h-20 -right-4 -bottom-4 ${isPlayingB ? 'animate-spin-slow' : ''}`} />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <Volume2 className={`w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] flex-shrink-0 ${backgroundTheme === 'light' ? 'text-gray-600' : 'text-zinc-500'}`} />
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
                                    <button onClick={(e) => { e.stopPropagation(); togglePlay('B'); }} className={`w-full py-2 sm:py-4 rounded-lg sm:rounded-xl font-black flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base transition-all ${isPlayingB
                                        ? backgroundTheme === 'light' ? 'bg-gray-400 text-white' : 'bg-zinc-800 text-white'
                                        : backgroundTheme === 'light' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-gray-100'
                                        }`}>
                                        {isPlayingB ? <Pause className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" /> : <Play className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px]" />} {isPlayingB ? "STOP" : "PLAY B"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <section className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl border transition-all ${backgroundTheme === 'light'
                            ? 'bg-white/80 border-gray-400'
                            : 'bg-zinc-900/50 border-zinc-800'
                            }`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-6 gap-2">
                                <h2 className="text-base sm:text-xl font-bold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">Beat Library <span className={`text-[8px] sm:text-[10px] font-normal uppercase ${backgroundTheme === 'light' ? 'text-gray-600' : 'text-zinc-500'}`}>Load to {selectedDeck}</span></h2>
                                <button onClick={() => fileInputRef.current?.click()} className={`text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all ${backgroundTheme === 'light'
                                    ? 'bg-gray-400 text-white hover:bg-gray-500'
                                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                    }`}><Upload className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" /> UPLOAD</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="audio/*" />
                            </div>


                            <div className="max-h-48 sm:max-h-64 overflow-y-auto pr-2 grid grid-cols-2 gap-2 sm:gap-3 scrollbar-hide">
                                {SAMPLE_BEATS.map((beat) => (
                                    <button
                                        key={beat.id}
                                        onClick={() => handleBeatSelect(beat)}
                                        className={`p-2 sm:p-4 border rounded-lg sm:rounded-2xl text-left transition-all group ${backgroundTheme === 'light'
                                            ? 'bg-gray-200 border-gray-400 hover:border-gray-500'
                                            : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-500'
                                            }`}
                                    >
                                        <p className={`text-[7px] sm:text-[8px] uppercase font-bold tracking-widest ${backgroundTheme === 'light' ? 'text-gray-600' : 'text-zinc-500'}`}>{beat.genre}</p>
                                        <p className="font-bold text-xs sm:text-sm group-hover:text-orange-500 transition-colors">{beat.name}</p>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-4 sm:space-y-8">
                        {/* Effects Table */}
                        <section className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl border transition-all ${backgroundTheme === 'light'
                            ? 'bg-white/80 border-gray-400'
                            : 'bg-zinc-900/50 border-zinc-800'
                            }`}>
                            <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-6">Master FX</h2>
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                {(Object.keys(effects) as Array<keyof typeof effects>).map((fx) => (
                                    <button
                                        key={fx}
                                        onClick={() => toggleEffect(fx)}
                                        className={`w-full p-2 sm:p-4 rounded-lg sm:rounded-2xl border flex justify-between items-center transition-all ${effects[fx]
                                            ? 'bg-orange-500/20 border-orange-500'
                                            : backgroundTheme === 'light' ? 'bg-gray-200 border-gray-400' : 'bg-zinc-950 border-zinc-800'
                                            }`}
                                    >
                                        <span className="font-bold capitalize text-xs sm:text-base">{fx}</span>
                                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${effects[fx]
                                            ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'
                                            : backgroundTheme === 'light' ? 'bg-gray-400' : 'bg-zinc-800'
                                            }`}></div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Export */}
                        <section className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-xl text-center border transition-all ${backgroundTheme === 'light'
                            ? 'bg-gradient-to-br from-red-100 to-orange-100 border-orange-300'
                            : 'bg-gradient-to-br from-red-600/20 to-orange-600/20 border-orange-500/20'
                            }`}>
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-3 sm:mb-4">Export Result</h3>
                            <button onClick={handleExport} className={`w-full font-black py-3 sm:py-5 rounded-lg sm:rounded-2xl flex items-center justify-center gap-1 sm:gap-2 transition-all text-xs sm:text-base ${backgroundTheme === 'light'
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-white text-black hover:bg-orange-500 hover:text-white'
                                }`}>
                                <Save size={14} /> {recordedBlobUrl ? "DOWNLOAD MIXDOWN" : "RECORD FIRST"}
                            </button>
                        </section>
                    </div>
                </main>
            </div>
            <OrientationPrompt />
        </div>
    )
}

export default App
