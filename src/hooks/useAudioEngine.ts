import { useState, useRef, useCallback, useEffect } from 'react';

export interface EffectsConfig {
    reverb: boolean;
    delay: boolean;
    bitcrusher: boolean;
    distortion: boolean;
    filter: boolean;
    chorus: boolean;
    phaser: boolean;
}

export const useAudioEngine = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPlayingA, setIsPlayingA] = useState(false);
    const [isPlayingB, setIsPlayingB] = useState(false);
    const [isMicActive, setIsMicActive] = useState(false);
    const [crossfade, setCrossfadeState] = useState(0.5);
    const [deckGains, setDeckGains] = useState({ A: 0.8, B: 0.8 });
    const [micGain, setMicGainState] = useState(0.8);
    const [effects, setEffects] = useState<EffectsConfig>({
        reverb: false,
        delay: false,
        bitcrusher: false,
        distortion: false,
        filter: false,
        chorus: false,
        phaser: false,
    });
    const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<{ A: boolean, B: boolean }>({ A: false, B: false });
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
    const [engineStatus, setEngineStatus] = useState<string>('Ready');

    // Core Audio Context
    const audioContext = useRef<AudioContext | null>(null);
    const masterVocalGain = useRef<GainNode | null>(null);
    const mainOutput = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const recordingDestination = useRef<MediaStreamAudioDestinationNode | null>(null);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const recordedChunks = useRef<Blob[]>([]);

    // Mastering Chain Nodes
    const masterCompressor = useRef<DynamicsCompressorNode | null>(null);
    const masterLimiter = useRef<WaveShaperNode | null>(null);
    const masterEQHigh = useRef<BiquadFilterNode | null>(null);
    const masterEQLow = useRef<BiquadFilterNode | null>(null);

    // Dynamic Effects Nodes
    const reverbNode = useRef<ConvolverNode | null>(null);
    const reverbGain = useRef<GainNode | null>(null);
    const delayNode = useRef<DelayNode | null>(null);
    const delayFeedback = useRef<GainNode | null>(null);
    const delayGain = useRef<GainNode | null>(null);
    const bitcrusherNode = useRef<any>(null);
    const bitcrusherGain = useRef<GainNode | null>(null);
    const distortionNode = useRef<WaveShaperNode | null>(null);
    const distortionGain = useRef<GainNode | null>(null);
    const djFilterNode = useRef<BiquadFilterNode | null>(null);
    const djFilterGain = useRef<GainNode | null>(null);
    const chorusNode = useRef<DelayNode | null>(null);
    const chorusLFO = useRef<OscillatorNode | null>(null);
    const chorusGain = useRef<GainNode | null>(null);
    const phaserNode = useRef<BiquadFilterNode[]>([]);
    const phaserLFO = useRef<OscillatorNode | null>(null);
    const phaserGain = useRef<GainNode | null>(null);

    // Deck Buffers
    const deckBuffers = useRef<{ A: AudioBuffer | null, B: AudioBuffer | null }>({ A: null, B: null });
    const deckSources = useRef<{ A: AudioBufferSourceNode | null, B: AudioBufferSourceNode | null }>({ A: null, B: null });
    const deckGainsRef = useRef<{ A: GainNode | null, B: GainNode | null }>({ A: null, B: null });
    const deckIndividGainsRef = useRef<{ A: GainNode | null, B: GainNode | null }>({ A: null, B: null });

    // Vocal FX Nodes
    const sourceNode = useRef<MediaStreamAudioSourceNode | null>(null);
    const micStream = useRef<MediaStream | null>(null);

    const updateCrossfade = useCallback((value: number) => {
        setCrossfadeState(value);
        if (!deckGainsRef.current.A || !deckGainsRef.current.B) return;
        const gainA = Math.cos(value * 0.5 * Math.PI);
        const gainB = Math.sin(value * 0.5 * Math.PI);
        const now = audioContext.current?.currentTime || 0;
        deckGainsRef.current.A.gain.setTargetAtTime(gainA, now, 0.02);
        deckGainsRef.current.B.gain.setTargetAtTime(gainB, now, 0.02);
    }, []);

    const initAudio = useCallback(() => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ latencyHint: 'playback' });
        }
        if (audioContext.current.state === 'suspended') {
            audioContext.current.resume();
        }
        if (!mainOutput.current) {
            const ctx = audioContext.current;

            // 1. Final Output & Analyser
            mainOutput.current = ctx.createGain();
            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 256;

            // 2. Effects Setup
            // Reverb
            reverbNode.current = ctx.createConvolver();
            reverbGain.current = ctx.createGain();
            reverbGain.current.gain.value = 0;
            // Simple synthesized impulse
            const rate = ctx.sampleRate;
            const length = rate * 2;
            const impulse = ctx.createBuffer(2, length, rate);
            for (let i = 0; i < 2; i++) {
                const chan = impulse.getChannelData(i);
                for (let j = 0; j < length; j++) chan[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
            }
            reverbNode.current.buffer = impulse;

            // Delay
            delayNode.current = ctx.createDelay(1.0);
            delayNode.current.delayTime.value = 0.4;
            delayFeedback.current = ctx.createGain();
            delayFeedback.current.gain.value = 0.4;
            delayGain.current = ctx.createGain();
            delayGain.current.gain.value = 0;
            delayNode.current.connect(delayFeedback.current);
            delayFeedback.current.connect(delayNode.current);

            // Distortion
            distortionNode.current = ctx.createWaveShaper();
            distortionGain.current = ctx.createGain();
            distortionGain.current.gain.value = 0;
            const distCurve = new Float32Array(44100);
            for (let i = 0; i < 44100; i++) {
                const x = (i * 2) / 44100 - 1;
                distCurve[i] = (Math.PI + 100) * x / (Math.PI + 100 * Math.abs(x));
            }
            distortionNode.current.curve = distCurve;

            // Bitcrusher (using ScriptProcessor for simplicity in this demo, though deprecated)
            // Bitcrusher
            const bc = ctx.createScriptProcessor(4096, 1, 1);
            bitcrusherNode.current = bc;
            bitcrusherGain.current = ctx.createGain();
            bitcrusherGain.current.gain.value = 0;
            bc.onaudioprocess = (e: any) => {
                const input = e.inputBuffer.getChannelData(0);
                const output = e.outputBuffer.getChannelData(0);
                const bits = 4;
                const norm = Math.pow(2, bits - 1);
                for (let i = 0; i < input.length; i++) {
                    output[i] = Math.round(input[i] * norm) / norm;
                }
            };

            // DJ Filter
            djFilterNode.current = ctx.createBiquadFilter();
            djFilterNode.current.type = 'lowpass';
            djFilterNode.current.frequency.value = 20000;
            djFilterNode.current.Q.value = 5;
            djFilterGain.current = ctx.createGain();
            djFilterGain.current.gain.value = 1; // Filter is always in chain but fully open

            // Chorus
            chorusNode.current = ctx.createDelay();
            chorusNode.current.delayTime.value = 0.03;
            chorusGain.current = ctx.createGain();
            chorusGain.current.gain.value = 0;
            chorusLFO.current = ctx.createOscillator();
            const chorusLFOGain = ctx.createGain();
            chorusLFOGain.gain.value = 0.01;
            chorusLFO.current.frequency.value = 1.5;
            chorusLFO.current.connect(chorusLFOGain);
            chorusLFOGain.connect(chorusNode.current.delayTime);
            chorusLFO.current.start();

            // Phaser
            phaserGain.current = ctx.createGain();
            phaserGain.current.gain.value = 0;
            const stages = 4;
            phaserNode.current = [];
            for (let i = 0; i < stages; i++) {
                const stage = ctx.createBiquadFilter();
                stage.type = 'allpass';
                stage.frequency.value = 1000 * (i + 1);
                phaserNode.current.push(stage);
            }
            phaserLFO.current = ctx.createOscillator();
            const phaserLFOGain = ctx.createGain();
            phaserLFOGain.gain.value = 500;
            phaserLFO.current.frequency.value = 0.5;
            phaserLFO.current.connect(phaserLFOGain);
            phaserNode.current.forEach(node => phaserLFOGain.connect(node.frequency));

            for (let i = 0; i < stages - 1; i++) phaserNode.current[i].connect(phaserNode.current[i + 1]);
            phaserNode.current[stages - 1].connect(phaserGain.current);
            phaserLFO.current.start();

            // 3. Setup Mastering Chain
            masterEQLow.current = ctx.createBiquadFilter();
            masterEQLow.current.type = 'lowshelf';
            masterEQLow.current.frequency.value = 100;
            masterEQLow.current.gain.value = 3;

            masterEQHigh.current = ctx.createBiquadFilter();
            masterEQHigh.current.type = 'highshelf';
            masterEQHigh.current.frequency.value = 8000;
            masterEQHigh.current.gain.value = 4;

            masterCompressor.current = ctx.createDynamicsCompressor();
            masterLimiter.current = ctx.createWaveShaper();
            const limitCurve = new Float32Array(44100);
            for (let i = 0; i < 44100; i++) {
                const x = (i * 2) / 44100 - 1;
                limitCurve[i] = Math.tanh(x * 1.2);
            }
            masterLimiter.current.curve = limitCurve;

            // 4. Connect Chain
            // Pre-Master Gain -> FX Chain (Parallel Mix) -> Mastering -> Out
            const fxInput = ctx.createGain();
            const fxOutput = ctx.createGain();

            // Connect dry path
            fxInput.connect(fxOutput);

            // Connect wet paths
            fxInput.connect(reverbNode.current).connect(reverbGain.current).connect(fxOutput);
            fxInput.connect(delayNode.current).connect(delayGain.current).connect(fxOutput);
            fxInput.connect(distortionNode.current).connect(distortionGain.current).connect(fxOutput);
            fxInput.connect(bitcrusherNode.current).connect(bitcrusherGain.current).connect(fxOutput);
            fxInput.connect(chorusNode.current).connect(chorusGain.current).connect(fxOutput);
            fxInput.connect(phaserNode.current[0]).connect(phaserGain.current).connect(fxOutput);

            // DJ Filter is serial at the end of FX
            fxOutput.connect(djFilterNode.current).connect(masterEQLow.current);

            masterEQLow.current.connect(masterEQHigh.current);
            masterEQHigh.current.connect(masterCompressor.current);
            masterCompressor.current.connect(masterLimiter.current);
            masterLimiter.current.connect(mainOutput.current);

            mainOutput.current.connect(analyserRef.current);
            analyserRef.current.connect(ctx.destination);
            setAnalyserNode(analyserRef.current);

            // 5. Setup Recording Destination
            recordingDestination.current = ctx.createMediaStreamDestination();
            mainOutput.current.connect(recordingDestination.current!);

            // 6. Setup Input Nodes
            masterVocalGain.current = ctx.createGain();
            masterVocalGain.current.gain.value = 0.8;
            masterVocalGain.current.connect(fxInput);

            const decks: ('A' | 'B')[] = ['A', 'B'];
            decks.forEach((deck) => {
                deckGainsRef.current[deck] = ctx.createGain();
                deckIndividGainsRef.current[deck] = ctx.createGain();
                deckIndividGainsRef.current[deck]!.gain.value = 0.8;
                deckGainsRef.current[deck]!.connect(deckIndividGainsRef.current[deck]!);
                deckIndividGainsRef.current[deck]!.connect(fxInput);
            });
            updateCrossfade(0.5);
        }
    }, [updateCrossfade]);


    const loadBeat = useCallback(async (deck: 'A' | 'B', urlOrFile: string | File) => {
        initAudio();
        setIsLoading(prev => ({ ...prev, [deck]: true }));
        setEngineStatus(`Loading ${deck}...`);
        try {
            let ab: ArrayBuffer;
            if (typeof urlOrFile === 'string') {
                const response = await fetch(urlOrFile);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                ab = await response.arrayBuffer();
            } else {
                ab = await urlOrFile.arrayBuffer();
            }
            const buffer = await audioContext.current!.decodeAudioData(ab);
            deckBuffers.current[deck] = buffer;
            setEngineStatus(`${deck} Ready`);
        } catch (err: any) {
            if (typeof urlOrFile === 'string' && !urlOrFile.startsWith('VIRTUAL_')) {
                try {
                    const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlOrFile)}`;
                    const res = await fetch(proxied);
                    const finalAb = await res.arrayBuffer();
                    const buffer = await audioContext.current!.decodeAudioData(finalAb);
                    deckBuffers.current[deck] = buffer;
                    setEngineStatus(`${deck} Ready`);
                    return;
                } catch (e) { }
            }
            setEngineStatus(`Err ${deck}`);
        } finally {
            setIsLoading(prev => ({ ...prev, [deck]: false }));
        }
    }, [initAudio]);

    const togglePlay = (deck: 'A' | 'B') => {
        initAudio();
        const isPlaying = deck === 'A' ? isPlayingA : isPlayingB;
        if (isPlaying) {
            if (deckSources.current[deck]) {
                try { deckSources.current[deck]!.stop(); } catch (e) { }
                deckSources.current[deck] = null;
            }
            deck === 'A' ? setIsPlayingA(false) : setIsPlayingB(false);
        } else {
            const buffer = deckBuffers.current[deck];
            const gain = deckGainsRef.current[deck];
            if (buffer && gain) {
                if (deckSources.current[deck]) try { deckSources.current[deck]!.stop(); } catch (e) { }
                const source = audioContext.current!.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                source.connect(gain);
                source.start(0);
                deckSources.current[deck] = source;
                deck === 'A' ? setIsPlayingA(true) : setIsPlayingB(true);
                setEngineStatus(`${deck} Playing`);
            } else {
                setEngineStatus(`${deck} Empty`);
            }
        }
    };

    const toggleMic = useCallback(async () => {
        initAudio();
        if (isMicActive) {
            if (sourceNode.current) sourceNode.current.disconnect();
            if (micStream.current) micStream.current.getTracks().forEach(t => t.stop());
            setIsMicActive(false);
            setEngineStatus("Mic Off");
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                micStream.current = stream;
                sourceNode.current = audioContext.current!.createMediaStreamSource(stream);
                sourceNode.current.connect(masterVocalGain.current!);
                setIsMicActive(true);
                setEngineStatus("Mic Live");
            } catch (err) {
                setEngineStatus("Mic Denied");
            }
        }
    }, [isMicActive, initAudio]);

    const startRecording = useCallback(async () => {
        if (!isMicActive) await toggleMic();
        recordedChunks.current = [];
        mediaRecorder.current = new MediaRecorder(recordingDestination.current!.stream);
        mediaRecorder.current.ondataavailable = (e) => e.data.size > 0 && recordedChunks.current.push(e.data);
        mediaRecorder.current.onstop = () => setRecordedBlobUrl(URL.createObjectURL(new Blob(recordedChunks.current, { type: 'audio/webm' })));
        mediaRecorder.current.start();
        setIsRecording(true);
    }, [isMicActive, toggleMic]);

    return {
        isRecording, isPlayingA, isPlayingB, isMicActive, crossfade, deckGains, micGain, effects, recordedBlobUrl, isLoading,
        analyser: analyserNode, engineStatus,
        toggleMic,
        startRecording, stopRecording: () => { mediaRecorder.current?.stop(); setIsRecording(false); },
        loadBeat, togglePlay,
        toggleEffect: (e: keyof EffectsConfig) => {
            setEffects(p => {
                const newState = { ...p, [e]: !p[e] };
                const now = audioContext.current?.currentTime || 0;

                if (e === 'reverb' && reverbGain.current) reverbGain.current.gain.setTargetAtTime(newState.reverb ? 0.6 : 0, now, 0.1);
                if (e === 'delay' && delayGain.current) delayGain.current.gain.setTargetAtTime(newState.delay ? 0.4 : 0, now, 0.1);
                if (e === 'distortion' && distortionGain.current) distortionGain.current.gain.setTargetAtTime(newState.distortion ? 1 : 0, now, 0.1);
                if (e === 'bitcrusher' && bitcrusherGain.current) bitcrusherGain.current.gain.setTargetAtTime(newState.bitcrusher ? 1 : 0, now, 0.1);
                if (e === 'chorus' && chorusGain.current) chorusGain.current.gain.setTargetAtTime(newState.chorus ? 0.8 : 0, now, 0.1);
                if (e === 'phaser' && phaserGain.current) phaserGain.current.gain.setTargetAtTime(newState.phaser ? 0.8 : 0, now, 0.1);

                if (e === 'filter' && djFilterNode.current) {
                    djFilterNode.current.frequency.setTargetAtTime(newState.filter ? 800 : 20000, now, 0.5);
                }

                return newState;
            });
        },
        setCrossfade: updateCrossfade,
        setDeckGain: (deck: 'A' | 'B', val: number) => {
            setDeckGains(p => ({ ...p, [deck]: val }));
            if (deckIndividGainsRef.current[deck]) deckIndividGainsRef.current[deck]!.gain.setTargetAtTime(val, audioContext.current!.currentTime, 0.05);
        },
        setMicGain: (val: number) => {
            setMicGainState(val);
            if (masterVocalGain.current && audioContext.current) masterVocalGain.current.gain.setTargetAtTime(val, audioContext.current.currentTime, 0.05);
        },
    };
};
