import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SoundscapeTrack {
    id: string;
    name: string;
    url: string;
    volume: number;
    isPlaying: boolean;
}

interface AudioContextState {
    tracks: SoundscapeTrack[];
    masterVolume: number;
    isAnyTrackPlaying: boolean;
}

interface AudioContextType {
    audioState: AudioContextState;
    playTrack: (id: string) => void;
    pauseTrack: (id: string) => void;
    stopAllTracks: () => void;
    setTrackVolume: (id: string, volume: number) => void;
    setMasterVolume: (volume: number) => void;
    addTrack: (track: Omit<SoundscapeTrack, 'isPlaying'>) => void;
}

// Define the initial tracks - Using free ambient sound sources
const initialTracks: SoundscapeTrack[] = [
    {
        id: 'coffee-shop',
        name: 'Coffee Shop',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_4c3d3d1c0e.mp3?filename=coffee-shop-ambience-16180.mp3',
        volume: 60,
        isPlaying: false,
    },
    {
        id: 'fireplace',
        name: 'Fireplace',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_2b70cf2e92.mp3?filename=fireplace-6307.mp3',
        volume: 60,
        isPlaying: false,
    },
    {
        id: 'forest',
        name: 'Forest',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3',
        volume: 50,
        isPlaying: false,
    },
    {
        id: 'rain',
        name: 'Rain',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/12/audio_2948f66157.mp3?filename=rain-and-thunder-16705.mp3',
        volume: 30,
        isPlaying: false,
    },
    {
        id: 'waves',
        name: 'Waves',
        url: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_d48d3cc447.mp3?filename=ocean-wave-rock-birds-8052.mp3',
        volume: 50,
        isPlaying: false,
    },
    {
        id: 'wind',
        name: 'Wind',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_f975090df8.mp3?filename=soft-wind-blowing-naturefx-20-6444.mp3',
        volume: 25,
        isPlaying: false,
    },
    {
        id: 'night',
        name: 'Night Sounds',
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c610c01d4d.mp3?filename=night-crickets-insects-17024.mp3',
        volume: 40,
        isPlaying: false,
    },
];

export const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [audioState, setAudioState] = useState<AudioContextState>({
        tracks: initialTracks,
        masterVolume: 70,
        isAnyTrackPlaying: false,
    });

    // Use refs to keep track of audio elements
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Initialize audio elements
    useEffect(() => {
        console.log('AudioContext: Initializing audio elements');
        // Create audio elements for each track
        audioState.tracks.forEach(track => {
            if (!audioRefs.current[track.id]) {
                console.log(`AudioContext: Creating audio element for ${track.id}`);
                const audio = new Audio();

                // Setup event listeners first
                audio.addEventListener('canplaythrough', () => {
                    console.log(`AudioContext: ${track.id} can play through`);
                });

                audio.onerror = (e) => {
                    console.error(`AudioContext: Error with audio ${track.id}:`, e);
                };

                // Set up ended event to ensure looping works
                audio.addEventListener('ended', () => {
                    console.log(`AudioContext: Track ${track.id} ended, restarting due to loop setting`);
                    // Even though loop is set to true, let's make sure it restarts
                    audio.currentTime = 0;
                    audio.play().catch(err => {
                        console.error(`AudioContext: Error restarting ${track.id}:`, err);
                    });
                });

                // Then set properties
                audio.loop = true; // Ensure looping is enabled
                audio.volume = (track.volume / 100) * (audioState.masterVolume / 100);
                audio.preload = 'auto'; // Preload the audio

                // Finally set the source (this will start loading)
                audio.src = track.url;

                audioRefs.current[track.id] = audio;
            }
        });

        // Cleanup function
        return () => {
            Object.values(audioRefs.current).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    // Play a specific track
    const playTrack = (id: string) => {
        console.log(`AudioContext: Playing track ${id}`);
        const audio = audioRefs.current[id];
        if (audio) {
            // Make sure the audio is loaded
            if (audio.readyState < 2) {  // HAVE_CURRENT_DATA or less
                console.log(`AudioContext: ${id} not ready yet, loading...`);
                audio.load();
            }

            // Use a promise to handle autoplay restrictions
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`AudioContext: Successfully playing ${id}`);
                    setAudioState(prev => ({
                        ...prev,
                        tracks: prev.tracks.map(track =>
                            track.id === id ? { ...track, isPlaying: true } : track
                        ),
                        isAnyTrackPlaying: true,
                    }));
                }).catch(err => {
                    console.error(`AudioContext: Failed to play ${id}:`, err);
                    // Try to handle autoplay policy
                    if (err.name === 'NotAllowedError') {
                        console.warn(`AudioContext: Autoplay prevented for ${id}, try adding a play button that responds to user interaction`);
                    }
                });
            }
        } else {
            console.error(`AudioContext: No audio element found for ${id}`);
        }
    };

    // Pause a specific track
    const pauseTrack = (id: string) => {
        console.log(`AudioContext: Pausing track ${id}`);
        const audio = audioRefs.current[id];
        if (audio) {
            audio.pause();

            setAudioState(prev => {
                const updatedTracks = prev.tracks.map(track =>
                    track.id === id ? { ...track, isPlaying: false } : track
                );

                const isAnyStillPlaying = updatedTracks.some(track => track.isPlaying);

                return {
                    ...prev,
                    tracks: updatedTracks,
                    isAnyTrackPlaying: isAnyStillPlaying,
                };
            });
        } else {
            console.error(`AudioContext: No audio element found for ${id}`);
        }
    };

    // Stop all tracks
    const stopAllTracks = () => {
        console.log('AudioContext: Stopping all tracks');
        Object.entries(audioRefs.current).forEach(([id, audio]) => {
            audio.pause();
            console.log(`AudioContext: Stopped ${id}`);
        });

        setAudioState(prev => ({
            ...prev,
            tracks: prev.tracks.map(track => ({ ...track, isPlaying: false })),
            isAnyTrackPlaying: false,
        }));
    };

    // Set volume for a specific track
    const setTrackVolume = (id: string, volume: number) => {
        console.log(`AudioContext: Setting volume for ${id} to ${volume}%`);
        const audio = audioRefs.current[id];
        if (audio) {
            audio.volume = (volume / 100) * (audioState.masterVolume / 100);

            setAudioState(prev => ({
                ...prev,
                tracks: prev.tracks.map(track =>
                    track.id === id ? { ...track, volume } : track
                ),
            }));

            // If volume is set to 0, pause the track
            if (volume === 0 && audio) {
                pauseTrack(id);
            } else if (volume > 0 && audio.paused && !audio.ended) {
                // If volume is increased and track wasn't playing, play it
                playTrack(id);
            }
        } else {
            console.error(`AudioContext: No audio element found for ${id}`);
        }
    };

    // Set master volume
    const setMasterVolume = (volume: number) => {
        console.log(`AudioContext: Setting master volume to ${volume}%`);
        // Update all playing audio elements with new master volume
        audioState.tracks.forEach(track => {
            const audio = audioRefs.current[track.id];
            if (audio) {
                audio.volume = (track.volume / 100) * (volume / 100);
            }
        });

        setAudioState(prev => ({
            ...prev,
            masterVolume: volume,
        }));
    };

    // Add a new track
    const addTrack = (track: Omit<SoundscapeTrack, 'isPlaying'>) => {
        const newTrack = { ...track, isPlaying: false };

        // Create audio element for the new track
        const audio = new Audio(newTrack.url);

        // Make sure looping is enabled for the new track
        audio.loop = true;

        // Handle ended event as backup for looping
        audio.addEventListener('ended', () => {
            console.log(`AudioContext: Track ${track.id} ended, restarting due to loop setting`);
            audio.currentTime = 0;
            audio.play().catch(console.error);
        });

        audio.volume = (newTrack.volume / 100) * (audioState.masterVolume / 100);
        audioRefs.current[newTrack.id] = audio;

        setAudioState(prev => ({
            ...prev,
            tracks: [...prev.tracks, newTrack],
        }));
    };

    console.log('AudioContext state:', audioState);
    console.log('AudioRefs:', Object.keys(audioRefs.current));

    return (
        <AudioContext.Provider value={{
            audioState,
            playTrack,
            pauseTrack,
            stopAllTracks,
            setTrackVolume,
            setMasterVolume,
            addTrack
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}; 