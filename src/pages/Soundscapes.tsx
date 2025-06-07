import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Settings, Download, 
  Cloud, Waves, TreePine, Coffee, Flame, Wind, Zap,
  Plus, Save, Shuffle, RotateCcw, Heart, Share2
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
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

export const Soundscapes: React.FC = () => {
  const { state } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(70);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customMixName, setCustomMixName] = useState('');
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

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
      id: 'binaural',
      name: 'Binaural Beats',
      type: 'binaural',
      icon: Zap,
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
        { ...soundLayers[0], volume: 30 }, // Rain
        { ...soundLayers[6], volume: 20 }, // Binaural
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
        { ...soundLayers[5], volume: 15 }, // Wind
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
        { ...soundLayers[3], volume: 50 }, // Coffee
        { ...soundLayers[0], volume: 20 }, // Light rain
      ],
      isCustom: false,
      isFavorite: true,
      downloads: 2100,
    },
    {
      id: 'stormy-night',
      name: 'Stormy Night',
      description: 'Rain and fireplace for cozy vibes',
      layers: [
        { ...soundLayers[0], volume: 60 }, // Rain
        { ...soundLayers[4], volume: 30 }, // Fire
        { ...soundLayers[5], volume: 20 }, // Wind
      ],
      isCustom: false,
      isFavorite: false,
      downloads: 750,
    },
  ];

  const [binauralSettings, setBinauralSettings] = useState({
    frequency: 40, // Hz
    waveType: 'sine' as const,
    enabled: false,
  });

  useEffect(() => {
    // Initialize audio elements (in a real app, these would be actual audio files)
    soundLayers.forEach(layer => {
      if (!audioRefs.current[layer.id]) {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0;
        audioRefs.current[layer.id] = audio;
      }
    });

    return () => {
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const updateLayerVolume = (layerId: string, volume: number) => {
    setSoundLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, volume } : layer
    ));

    // Update actual audio volume
    const audio = audioRefs.current[layerId];
    if (audio) {
      audio.volume = (volume / 100) * (masterVolume / 100);
      
      if (volume > 0 && !layer.isPlaying) {
        audio.play().catch(console.error);
        setSoundLayers(prev => prev.map(l => 
          l.id === layerId ? { ...l, isPlaying: true } : l
        ));
      } else if (volume === 0 && layer.isPlaying) {
        audio.pause();
        setSoundLayers(prev => prev.map(l => 
          l.id === layerId ? { ...l, isPlaying: false } : l
        ));
      }
    }
  };

  const togglePlayPause = () => {
    const hasActiveLayers = soundLayers.some(layer => layer.volume > 0);
    
    if (!hasActiveLayers) {
      // Load a default preset
      loadPreset(presets[0]);
      return;
    }

    setIsPlaying(!isPlaying);
    
    soundLayers.forEach(layer => {
      const audio = audioRefs.current[layer.id];
      if (audio && layer.volume > 0) {
        if (isPlaying) {
          audio.pause();
        } else {
          audio.play().catch(console.error);
        }
      }
    });
  };

  const loadPreset = (preset: Preset) => {
    setActivePreset(preset.id);
    
    // Reset all layers
    setSoundLayers(prev => prev.map(layer => ({ ...layer, volume: 0, isPlaying: false })));
    
    // Apply preset layers
    preset.layers.forEach(presetLayer => {
      updateLayerVolume(presetLayer.id, presetLayer.volume);
    });
    
    setIsPlaying(true);
  };

  const saveCustomMix = () => {
    if (!customMixName.trim()) return;
    
    const activeLayers = soundLayers.filter(layer => layer.volume > 0);
    const customPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: customMixName,
      description: 'Custom mix',
      layers: activeLayers,
      isCustom: true,
      isFavorite: false,
      downloads: 0,
    };
    
    console.log('Saving custom mix:', customPreset);
    setShowCreateModal(false);
    setCustomMixName('');
  };

  const resetMix = () => {
    setSoundLayers(prev => prev.map(layer => ({ ...layer, volume: 0, isPlaying: false })));
    setActivePreset(null);
    setIsPlaying(false);
    
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
    });
  };

  const SoundLayerControl: React.FC<{ layer: SoundLayer }> = ({ layer }) => {
    const IconComponent = layer.icon;
    
    return (
      <Card variant="glass\" className="p-4">
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
            onClick={() => updateLayerVolume(layer.id, layer.volume > 0 ? 0 : 50)}
          />
        </div>
        
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={layer.volume}
            onChange={(e) => updateLayerVolume(layer.id, parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${layer.color} 0%, ${layer.color} ${layer.volume}%, rgba(255,255,255,0.1) ${layer.volume}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </Card>
    );
  };

  const PresetCard: React.FC<{ preset: Preset }> = ({ preset }) => (
    <Card 
      variant="glass" 
      className={`p-4 cursor-pointer transition-all ${
        activePreset === preset.id ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={() => loadPreset(preset)}
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
            variant={activePreset === preset.id ? 'primary' : 'secondary'}
            size="sm"
            icon={activePreset === preset.id ? Pause : Play}
          >
            {activePreset === preset.id ? 'Playing' : 'Play'}
          </Button>
        </div>
      </div>
    </Card>
  );

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
            icon={Settings}
            onClick={() => setShowSettings(true)}
          />
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Save Mix
          </Button>
        </div>
      </motion.div>

      {/* Master Controls */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={isPlaying ? Pause : Play}
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full"
            />
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
              onClick={resetMix}
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              icon={Shuffle}
              onClick={() => loadPreset(presets[Math.floor(Math.random() * presets.length)])}
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
              onChange={(e) => setMasterVolume(parseInt(e.target.value))}
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
          
          {/* Binaural Beats Settings */}
          <Card variant="glass" className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Binaural Beats</h3>
              <input
                type="checkbox"
                checked={binauralSettings.enabled}
                onChange={(e) => setBinauralSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>
            
            {binauralSettings.enabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">
                    Frequency: {binauralSettings.frequency} Hz
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={binauralSettings.frequency}
                    onChange={(e) => setBinauralSettings(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Delta (1-4 Hz)</span>
                    <span>Theta (4-8 Hz)</span>
                    <span>Alpha (8-14 Hz)</span>
                    <span>Beta (14-30 Hz)</span>
                    <span>Gamma (30+ Hz)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/60 text-sm mb-2">Wave Type</label>
                  <select
                    value={binauralSettings.waveType}
                    onChange={(e) => setBinauralSettings(prev => ({ ...prev, waveType: e.target.value as any }))}
                    className="input-field w-full"
                  >
                    <option value="sine">Sine</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>
              </div>
            )}
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
                    onClick={() => loadPreset(preset)}
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
              onClick={saveCustomMix}
              fullWidth
              disabled={!customMixName.trim() || soundLayers.filter(l => l.volume > 0).length === 0}
            >
              Save Mix
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
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
            <select className="input-field w-full">
              <option>High Quality (320kbps)</option>
              <option>Standard Quality (128kbps)</option>
              <option>Low Quality (64kbps)</option>
            </select>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Auto-play</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-white/80">Start soundscape with focus sessions</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-white/80">Continue playing during breaks</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Fade Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 text-sm mb-2">Fade In Duration</label>
                <select className="input-field w-full">
                  <option>Instant</option>
                  <option>2 seconds</option>
                  <option>5 seconds</option>
                  <option>10 seconds</option>
                </select>
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-2">Fade Out Duration</label>
                <select className="input-field w-full">
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
              onClick={() => setShowSettings(false)}
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