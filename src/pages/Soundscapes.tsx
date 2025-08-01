import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Settings, Download,
  Cloud, Waves, TreePine, Coffee, Flame, Wind, Moon,
  Plus, Save, Shuffle, RotateCcw, Heart, Share2, Trash2, List
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAudio } from '../contexts/AudioContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

interface SoundLayer {
  id: string;
  name: string;
  type: 'rain' | 'ocean' | 'forest' | 'coffee' | 'fire' | 'wind' | 'binaural' | 'white-noise';
  icon: React.ComponentType<{ className?: string }>;
  volume: number;
  isPlaying: boolean;
  color: string;
  audioUrl?: string;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  layers: SoundLayer[];
  isCustom: boolean;
  isFavorite: boolean;
  downloads: number;
}

// Define a type for saved mixes
interface SavedMix {
  id: string;
  name: string;
  date: string;
  layers: SoundLayer[];
}

export const Soundscapes: React.FC = () => {
  const { state } = useApp();
  const { audioState, playTrack, pauseTrack, stopAllTracks, setTrackVolume, setMasterVolume } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setLocalMasterVolume] = useState(audioState.masterVolume);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customMixName, setCustomMixName] = useState('');
  const [savedMixes, setSavedMixes] = useState<SavedMix[]>([]);
  const [showSavedMixesModal, setShowSavedMixesModal] = useState(false);

  // Track id mapping to convert from our internal IDs to the AudioContext IDs
  const trackIdMapping: Record<string, string> = {
    'rain': 'rain',
    'ocean': 'waves',
    'forest': 'forest',
    'coffee': 'coffee-shop',
    'fire': 'fireplace',
    'wind': 'wind',
    'night': 'night',
  };

  // Map our internal sound layers to use the AudioContext tracks
  const [soundLayers, setSoundLayers] = useState<SoundLayer[]>([
    {
      id: 'rain',
      name: 'Rain',
      type: 'rain',
      icon: Cloud,
      volume: 0,
      isPlaying: false,
      color: '#3B82F6',
    },
    {
      id: 'ocean',
      name: 'Ocean Waves',
      type: 'ocean',
      icon: Waves,
      volume: 0,
      isPlaying: false,
      color: '#06B6D4',
    },
    {
      id: 'forest',
      name: 'Forest',
      type: 'forest',
      icon: TreePine,
      volume: 0,
      isPlaying: false,
      color: '#10B981',
    },
    {
      id: 'coffee',
      name: 'Coffee Shop',
      type: 'coffee',
      icon: Coffee,
      volume: 0,
      isPlaying: false,
      color: '#92400E',
    },
    {
      id: 'fire',
      name: 'Fireplace',
      type: 'fire',
      icon: Flame,
      volume: 0,
      isPlaying: false,
      color: '#DC2626',
    },
    {
      id: 'wind',
      name: 'Wind',
      type: 'wind',
      icon: Wind,
      volume: 0,
      isPlaying: false,
      color: '#6B7280',
    },
    {
      id: 'night',
      name: 'Night Sounds',
      type: 'night',
      icon: Moon,
      volume: 0,
      isPlaying: false,
      color: '#8B5CF6',
    },
  ]);

  const presets: Preset[] = [
    {
      id: 'focus-deep',
      name: 'Deep Focus',
      description: 'Perfect for intense concentration',
      layers: [
        { ...soundLayers[0], volume: 15 }, // Rain (lowered from 30)
        { ...soundLayers[6], volume: 20 }, // Night sounds (replaced binaural)
      ],
      isCustom: false,
      isFavorite: true,
      downloads: 1250,
    },
    {
      id: 'nature-calm',
      name: 'Nature Calm',
      description: 'Peaceful forest and water sounds',
      layers: [
        { ...soundLayers[2], volume: 40 }, // Forest
        { ...soundLayers[1], volume: 25 }, // Ocean
        { ...soundLayers[5], volume: 10 }, // Wind (lowered from 15)
      ],
      isCustom: false,
      isFavorite: false,
      downloads: 890,
    },
    {
      id: 'cozy-cafe',
      name: 'Cozy Café',
      description: 'Work from your favorite coffee shop',
      layers: [
        { ...soundLayers[3], volume: 60 }, // Coffee (increased from 50)
        { ...soundLayers[0], volume: 10 }, // Light rain (lowered from 20)
      ],
      isCustom: false,
      isFavorite: true,
      downloads: 2100,
    },
    {
      id: 'stormy-night',
      name: 'Stormy Night',
      description: 'Rain and fireplace with night ambience',
      layers: [
        { ...soundLayers[0], volume: 30 }, // Rain (lowered from 60)
        { ...soundLayers[4], volume: 50 }, // Fire (increased from 30)
        { ...soundLayers[5], volume: 10 }, // Wind (lowered from 20)
        { ...soundLayers[6], volume: 25 }, // Night sounds (new addition)
      ],
      isCustom: false,
      isFavorite: false,
      downloads: 750,
    },
    {
      id: 'night-time',
      name: 'Night Time',
      description: 'Peaceful nighttime ambience',
      layers: [
        { ...soundLayers[6], volume: 60 }, // Night sounds
        { ...soundLayers[2], volume: 20 }, // Light forest
      ],
      isCustom: false,
      isFavorite: false,
      downloads: 620,
    },
  ];

  // Sync our local state with AudioContext
  useEffect(() => {
    console.log('Soundscapes: AudioState changed:', audioState);

    // Update isPlaying based on AudioContext state
    setIsPlaying(audioState.isAnyTrackPlaying);
    console.log('Soundscapes: Updated isPlaying to', audioState.isAnyTrackPlaying);

    // Update master volume
    setLocalMasterVolume(audioState.masterVolume);

    // Update sound layers based on AudioContext tracks
    const updatedLayers = soundLayers.map(layer => {
      const mappedId = trackIdMapping[layer.id];
      if (mappedId) {
        const audioTrack = audioState.tracks.find(track => track.id === mappedId);
        if (audioTrack) {
          return {
            ...layer,
            volume: audioTrack.volume,
            isPlaying: audioTrack.isPlaying,
          };
        }
      }
      return layer;
    });

    console.log('Soundscapes: Updated sound layers with AudioContext data');
    setSoundLayers(updatedLayers);
  }, [audioState]);

  // Load saved mixes from localStorage on component mount
  useEffect(() => {
    const loadSavedMixes = () => {
      try {
        const savedMixesJson = localStorage.getItem('soundscapeSavedMixes');
        if (savedMixesJson) {
          const loadedMixes = JSON.parse(savedMixesJson) as SavedMix[];
          setSavedMixes(loadedMixes);
          console.log('Soundscapes: Loaded saved mixes from localStorage', loadedMixes);
        }
      } catch (error) {
        console.error('Soundscapes: Error loading saved mixes from localStorage', error);
      }
    };

    loadSavedMixes();
  }, []);

  // Save mixes to localStorage whenever they change
  useEffect(() => {
    if (savedMixes.length > 0) {
      try {
        localStorage.setItem('soundscapeSavedMixes', JSON.stringify(savedMixes));
        console.log('Soundscapes: Saved mixes to localStorage', savedMixes);
      } catch (error) {
        console.error('Soundscapes: Error saving mixes to localStorage', error);
      }
    }
  }, [savedMixes]);

  const updateLayerVolume = (layerId: string, volume: number) => {
    console.log(`Soundscapes: updateLayerVolume called for ${layerId} with volume ${volume}`);
    // Update local state first
    setSoundLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, volume } : layer
    ));

    // Then update AudioContext
    const mappedTrackId = trackIdMapping[layerId];
    if (mappedTrackId) {
      console.log(`Soundscapes: Calling setTrackVolume for ${mappedTrackId}`);
      setTrackVolume(mappedTrackId, volume);
    } else {
      console.warn(`Soundscapes: No mapped track ID found for layer ${layerId}`);
    }

    // For binaural beats which is not in AudioContext yet
    if (layerId === 'binaural') {
      console.log('Soundscapes: Handling binaural beats volume separately');
      // Handle binaural beats separately (if implemented)
    }
  };

  const togglePlayPause = () => {
    console.log('Soundscapes: togglePlayPause called, current state:', { isPlaying });
    const hasActiveLayers = soundLayers.some(layer => layer.volume > 0);

    if (!hasActiveLayers) {
      console.log('Soundscapes: No active layers, loading default preset');
      // Load a default preset
      loadPreset(presets[0]);
      return;
    }

    if (isPlaying) {
      // If currently playing, pause all active tracks
      console.log('Soundscapes: Currently playing, pausing all active tracks');
      soundLayers.forEach(layer => {
        if (layer.volume > 0) {
          console.log(`Soundscapes: Checking layer ${layer.id} with volume ${layer.volume}`);
          const mappedTrackId = trackIdMapping[layer.id];
          if (mappedTrackId) {
            console.log(`Soundscapes: Pausing track ${mappedTrackId}`);
            pauseTrack(mappedTrackId);
          }
        }
      });
    } else {
      // If currently paused, play all active tracks
      console.log('Soundscapes: Currently paused, playing all active tracks with volume > 0');
      soundLayers.forEach(layer => {
        if (layer.volume > 0) {
          console.log(`Soundscapes: Processing layer ${layer.id} with volume ${layer.volume}`);
          const mappedTrackId = trackIdMapping[layer.id];
          if (mappedTrackId) {
            console.log(`Soundscapes: Playing track ${mappedTrackId}`);
            playTrack(mappedTrackId);
          }
        }
      });
    }

    console.log('Soundscapes: Play/pause toggling complete');
  };

  const loadPreset = (preset: Preset) => {
    console.log('Soundscapes: loadPreset called with preset', preset);
    setActivePreset(preset.id);

    // Reset all layers
    console.log('Soundscapes: Resetting all layers');
    soundLayers.forEach(layer => {
      if (layer.volume > 0) {
        updateLayerVolume(layer.id, 0);
      }
    });

    // First update local state for all layers that will be active
    console.log('Soundscapes: Setting volumes for preset layers');
    preset.layers.forEach(presetLayer => {
      updateLayerVolume(presetLayer.id, presetLayer.volume);
    });

    // Then after a short delay, play the tracks that should be active
    // This ensures that the volume is set before playing
    setTimeout(() => {
      console.log('Soundscapes: Playing active layers from preset');
      preset.layers.forEach(layer => {
        if (layer.volume > 0) {
          const mappedTrackId = trackIdMapping[layer.id];
          if (mappedTrackId) {
            console.log(`Soundscapes: Playing preset track ${mappedTrackId} with volume ${layer.volume}`);
            playTrack(mappedTrackId);
          }
        }
      });
    }, 100);
  };

  const saveCustomMix = () => {
    if (!customMixName.trim()) return;

    const activeLayers = soundLayers.filter(layer => layer.volume > 0);
    if (activeLayers.length === 0) return;

    const newMix: SavedMix = {
      id: `custom-${Date.now()}`,
      name: customMixName,
      date: new Date().toLocaleDateString(),
      layers: activeLayers,
    };

    setSavedMixes(prev => [...prev, newMix]);
    console.log('Saving custom mix:', newMix);

    setShowCreateModal(false);
    setCustomMixName('');
  };

  const loadSavedMix = (mix: SavedMix) => {
    console.log('Soundscapes: Loading saved mix', mix);

    // Reset all layers
    soundLayers.forEach(layer => {
      if (layer.volume > 0) {
        updateLayerVolume(layer.id, 0);
      }
    });

    // Set activePreset to null since we're loading a custom mix
    setActivePreset(null);

    // Apply saved mix layers
    mix.layers.forEach(savedLayer => {
      // Find the corresponding layer in current soundLayers
      const currentLayer = soundLayers.find(l => l.id === savedLayer.id);
      if (currentLayer) {
        updateLayerVolume(currentLayer.id, savedLayer.volume);
      }
    });

    setShowSavedMixesModal(false);
  };

  const deleteSavedMix = (e: React.MouseEvent, mixId: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick that loads the mix
    e.preventDefault();

    console.log('Soundscapes: Deleting saved mix', mixId);
    setSavedMixes(prev => prev.filter(mix => mix.id !== mixId));
  };

  const resetMix = () => {
    setSoundLayers(prev => prev.map(layer => ({ ...layer, volume: 0, isPlaying: false })));
    setActivePreset(null);

    // Stop all tracks in AudioContext
    stopAllTracks();
  };

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent default behavior
    e.preventDefault();

    // Get the new volume value
    const newVolume = parseInt(e.target.value);

    // Update local state and audio context
    setLocalMasterVolume(newVolume);
    setMasterVolume(newVolume);
  };

  // Fix the handleButtonClick function to ensure it's stopping all events correctly
  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent) => {
    // Make sure we stop all propagation and default behaviors
    if (e) {
      e.stopPropagation();
      e.preventDefault();
      e.nativeEvent.stopImmediatePropagation();
      e.nativeEvent.preventDefault();
    }
    // Execute the callback function
    callback();
    return false; // Return false as an extra safety measure
  };

  const SoundLayerControl: React.FC<{ layer: SoundLayer }> = ({ layer }) => {
    const IconComponent = layer.icon;

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Prevent any default behavior
      e.preventDefault();

      // Get the new volume value
      const newVolume = parseInt(e.target.value);

      // Update the volume
      updateLayerVolume(layer.id, newVolume);
    };

    return (
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${layer.color}20` }}
          >
            <IconComponent className="w-5 h-5" style={{ color: layer.color }} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{layer.name}</h3>
            <p className="text-white/60 text-sm">{layer.volume}%</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={layer.isPlaying ? Pause : Play}
            onClick={handleButtonClick(() => updateLayerVolume(layer.id, layer.volume > 0 ? 0 : 50))}
          />
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={layer.volume}
            onChange={handleVolumeChange}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${layer.color} 0%, ${layer.color} ${layer.volume}%, rgba(255,255,255,0.1) ${layer.volume}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </Card>
    );
  };

  const PresetCard: React.FC<{ preset: Preset }> = ({ preset }) => {
    // Determine if this preset is currently playing
    const isCurrentlyPlaying = activePreset === preset.id && isPlaying;

    // Function to handle play/pause for this preset
    const togglePreset = () => {
      console.log('PresetCard: Toggle preset', preset.id, 'currently playing:', isCurrentlyPlaying);

      if (isCurrentlyPlaying) {
        // If this preset is currently playing, pause all active tracks
        console.log('PresetCard: Pausing all active tracks');
        preset.layers.forEach(layer => {
          if (layer.volume > 0) {
            const mappedTrackId = trackIdMapping[layer.id];
            if (mappedTrackId) {
              console.log(`PresetCard: Pausing track ${mappedTrackId}`);
              pauseTrack(mappedTrackId);
            }
          }
        });
      } else {
        // If this preset is not playing, load and play it
        console.log('PresetCard: Loading and playing preset');
        loadPreset(preset);
      }
    };

    return (
      <Card
        variant="glass"
        className={`p-4 transition-all ${activePreset === preset.id ? 'ring-2 ring-primary-500' : ''
          }`}
      >
        <div className="flex items-start justify-between mb-3">

          <div>
            <h3 className="font-semibold text-white">{preset.name}</h3>
            <p className="text-white/60 text-sm">{preset.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={preset.isFavorite ? Heart : Heart}
              className={preset.isFavorite ? 'text-error-400' : ''}
            />
            <Button variant="ghost" size="sm" icon={Share2} />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {preset.layers.slice(0, 4).map(layer => {
            const IconComponent = layer.icon;
            return (
              <div
                key={layer.id}
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ backgroundColor: `${layer.color}30` }}
              >
                <IconComponent className="w-3 h-3" style={{ color: layer.color }} />
              </div>
            );
          })}
          {preset.layers.length > 4 && (
            <span className="text-white/60 text-xs">+{preset.layers.length - 4}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">{preset.downloads} downloads</span>
          <div className="flex items-center gap-1">
            {preset.isCustom && (
              <span className="px-2 py-1 bg-accent-500/20 text-accent-400 rounded text-xs">
                Custom
              </span>
            )}
            <Button
              variant={isCurrentlyPlaying ? 'primary' : 'secondary'}
              size="sm"
              icon={isCurrentlyPlaying ? Pause : Play}
              onClick={handleButtonClick(togglePreset)}
            >
              {isCurrentlyPlaying ? 'Playing' : 'Play'}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Soundscapes</h1>
          <p className="text-white/60">
            Create the perfect audio environment for focus and relaxation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={List}
            onClick={handleButtonClick(() => setShowSavedMixesModal(true))}
          >
            My Mixes
          </Button>
          <Button
            variant="secondary"
            icon={Settings}
            onClick={handleButtonClick(() => setShowSettings(true))}
          />
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleButtonClick(() => setShowCreateModal(true))}
          >
            Save Mix
          </Button>
        </div>
      </motion.div>

      {/* Master Controls */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePlayPause();
              }}
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/30 bg-black/20 hover:bg-black/40 shadow-lg text-white focus:outline-none"
              type="button"
            >
              {isPlaying ? (
                <Pause size={28} strokeWidth={2} />
              ) : (
                <Play size={28} strokeWidth={2} />
              )}
            </button>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {activePreset ? presets.find(p => p.id === activePreset)?.name : 'Custom Mix'}
              </h2>
              <p className="text-white/60">
                {soundLayers.filter(l => l.volume > 0).length} layers active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={handleButtonClick(resetMix)}
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              icon={Shuffle}
              onClick={handleButtonClick(() =>
                loadPreset(presets[Math.floor(Math.random() * presets.length)])
              )}
            >
              Random
            </Button>
          </div>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-4">
          <VolumeX className="w-5 h-5 text-white/60" />
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={handleMasterVolumeChange}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-primary-500 to-secondary-500"
            />
          </div>
          <Volume2 className="w-5 h-5 text-white/60" />
          <span className="text-white/60 text-sm w-12">{masterVolume}%</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sound Layers */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-4">Sound Layers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soundLayers.map(layer => (
              <SoundLayerControl key={layer.id} layer={layer} />
            ))}
          </div>

          {/* Night Sounds Info Section */}
          <Card variant="glass" className="p-6 mt-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${soundLayers[6].color}20` }}
              >
                <Moon className="w-5 h-5" style={{ color: soundLayers[6].color }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Night Sounds</h3>
                <p className="text-white/60 text-sm mt-1">
                  Ambient nighttime sounds including crickets, distant owls, and gentle night breezes.
                  Perfect for a relaxing evening atmosphere or to simulate night while working late.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Presets */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Presets</h2>
          <div className="space-y-4">
            {presets.map(preset => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>

          {/* Popular Presets */}
          <Card variant="glass" className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Trending</h3>
            <div className="space-y-3">
              {presets.slice(0, 3).map(preset => (
                <div key={preset.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm">{preset.name}</div>
                    <div className="text-white/60 text-xs">{preset.downloads} downloads</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    onClick={handleButtonClick(() => loadPreset(preset))}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Save Custom Mix Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Save Custom Mix"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Mix Name *</label>
            <input
              type="text"
              value={customMixName}
              onChange={(e) => setCustomMixName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  saveCustomMix();
                }
              }}
              placeholder="Enter mix name..."
              className="input-field w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Active Layers</label>
            <div className="space-y-2">
              {soundLayers.filter(layer => layer.volume > 0).map(layer => {
                const IconComponent = layer.icon;
                return (
                  <div key={layer.id} className="flex items-center gap-3 p-2 glass rounded-lg">
                    <IconComponent className="w-4 h-4" style={{ color: layer.color }} />
                    <span className="text-white/80 text-sm">{layer.name}</span>
                    <span className="text-white/60 text-sm ml-auto">{layer.volume}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleButtonClick(saveCustomMix)}
              fullWidth
              disabled={!customMixName.trim() || soundLayers.filter(l => l.volume > 0).length === 0}
            >
              Save Mix
            </Button>
            <Button
              variant="secondary"
              onClick={handleButtonClick(() => setShowCreateModal(false))}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Saved Mixes Modal */}
      <Modal
        isOpen={showSavedMixesModal}
        onClose={() => setShowSavedMixesModal(false)}
        title="My Saved Mixes"
        size="md"
      >
        <div className="space-y-4">
          {savedMixes.length > 0 ? (
            <div className="space-y-3">
              {savedMixes.map(mix => (
                <div
                  key={mix.id}
                  className="p-4 glass rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={handleButtonClick(() => loadSavedMix(mix))}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{mix.name}</h3>
                      <p className="text-white/60 text-sm">{mix.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={(e) => deleteSavedMix(e, mix.id)}
                        className="text-error-400 hover:bg-error-400/20"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={handleButtonClick(() => loadSavedMix(mix))}
                      >
                        Load
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {mix.layers.slice(0, 4).map(layer => {
                      const layerInfo = soundLayers.find(l => l.id === layer.id);
                      if (!layerInfo) return null;

                      const IconComponent = layerInfo.icon;
                      return (
                        <div
                          key={layer.id}
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ backgroundColor: `${layerInfo.color}30` }}
                        >
                          <IconComponent className="w-3 h-3" style={{ color: layerInfo.color }} />
                        </div>
                      );
                    })}
                    {mix.layers.length > 4 && (
                      <span className="text-white/60 text-xs">+{mix.layers.length - 4}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Save size={24} className="text-white/60" />
              </div>
              <h3 className="text-white font-semibold mb-2">No Saved Mixes</h3>
              <p className="text-white/60 text-sm">
                Create and save your first custom mix to see it here
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button
              variant="secondary"
              onClick={handleButtonClick(() => setShowSavedMixesModal(false))}
              fullWidth
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Soundscape Settings"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-semibold mb-3">Audio Quality</h3>
            <select
              className="input-field w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <option>High Quality (320kbps)</option>
              <option>Standard Quality (128kbps)</option>
              <option>Low Quality (64kbps)</option>
            </select>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Auto-play</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-white/80">Start soundscape with focus sessions</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-white/80">Continue playing during breaks</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Fade Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 text-sm mb-2">Fade In Duration</label>
                <select
                  className="input-field w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option>Instant</option>
                  <option>2 seconds</option>
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Fade Out Duration</label>
                <select
                  className="input-field w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option>Instant</option>
                  <option>2 seconds</option>
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleButtonClick(() => setShowSettings(false))}
              fullWidth
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};