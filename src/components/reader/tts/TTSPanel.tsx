import clsx from 'clsx';
import React, { useState, ChangeEvent, useEffect } from 'react';
import { MdPlayCircle, MdPauseCircle, MdFastRewind, MdFastForward, MdAlarm, MdCheck, MdSearch } from 'react-icons/md';
import { RiVoiceAiFill } from 'react-icons/ri';
import { TTSVoicesGroup } from '@/types/tts';
import { 
  EDGE_VOICES, 
  getVoicesByLanguage, 
  getRecommendedVoices, 
  searchVoices,
  type EdgeVoice 
} from '@/data/edgeVoices';

type TTSPanelProps = {
  bookKey: string;
  ttsLang: string;
  isPlaying: boolean;
  timeoutOption: number;
  timeoutTimestamp: number;
  onTogglePlay: () => void;
  onBackward: () => void;
  onForward: () => void;
  onSetRate: (rate: number) => void;
  onGetVoices: (lang: string) => Promise<TTSVoicesGroup[]>;
  onSetVoice: (voice: string, lang: string) => void;
  onGetVoiceId: () => string;
  onSelectTimeout: (bookKey: string, value: number) => void;
};

const getTTSTimeoutOptions = () => {
  return [
    {
      label: 'No Timeout',
      value: 0,
    },
    {
      label: '1 minute',
      value: 60,
    },
    {
      label: '3 minutes',
      value: 180,
    },
    {
      label: '5 minutes',
      value: 300,
    },
    {
      label: '10 minutes',
      value: 600,
    },
    {
      label: '20 minutes',
      value: 1200,
    },
    {
      label: '30 minutes',
      value: 1800,
    },
    {
      label: '45 minutes',
      value: 2700,
    },
    {
      label: '1 hour',
      value: 3600,
    },
    {
      label: '2 hours',
      value: 7200,
    },
    {
      label: '3 hours',
      value: 10800,
    },
    {
      label: '4 hours',
      value: 14400,
    },
    {
      label: '6 hours',
      value: 21600,
    },
    {
      label: '8 hours',
      value: 28800,
    },
  ];
};

const getCountdownTime = (timeout: number) => {
  const now = Date.now();
  if (timeout > now) {
    const remainingTime = Math.floor((timeout - now) / 1000);
    const minutes = Math.floor(remainingTime / 3600) * 60 + Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  return '';
};

const getLanguageName = (lang: string) => {
  const langMap: Record<string, string> = {
    'zh': 'Chinese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)', 
    'en': 'English',
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ru': 'Russian'
  };
  return langMap[lang] || lang;
};

const TTSPanel = ({
  bookKey,
  ttsLang,
  isPlaying,
  timeoutOption,
  timeoutTimestamp,
  onTogglePlay,
  onBackward,
  onForward,
  onSetRate,
  onGetVoices,
  onSetVoice,
  onGetVoiceId,
  onSelectTimeout,
}: TTSPanelProps) => {
  const [voiceGroups, setVoiceGroups] = useState<TTSVoicesGroup[]>([]);
  const [rate, setRate] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voiceSearchQuery, setVoiceSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('推荐');
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);

  const [timeoutCountdown, setTimeoutCountdown] = useState(() => {
    return getCountdownTime(timeoutTimestamp);
  });

  const iconSize32 = 32;
  const iconSize48 = 48;
  const defaultIconSize = 24;

  const handleSetRate = (e: ChangeEvent<HTMLInputElement>) => {
    let newRate = parseFloat(e.target.value);
    newRate = Math.max(0.2, Math.min(3.0, newRate));
    setRate(newRate);
    onSetRate(newRate);
  };

  const handleSelectVoice = (voice: string, lang: string) => {
    onSetVoice(voice, lang);
    setSelectedVoice(voice);
  };

  // 获取当前选中语音的信息
  const getCurrentVoice = () => {
    return EDGE_VOICES.find(v => v.shortName === selectedVoice);
  };

  // 获取筛选后的语音列表
  const getFilteredVoices = (): EdgeVoice[] => {
    if (voiceSearchQuery) {
      return searchVoices(voiceSearchQuery);
    }
    if (selectedLanguage === '推荐') {
      return getRecommendedVoices();
    }
    if (selectedLanguage === '全部') {
      return EDGE_VOICES;
    }
    const voicesByLanguage = getVoicesByLanguage();
    return voicesByLanguage[selectedLanguage] || [];
  };

  // 获取语言列表
  const getLanguageOptions = () => {
    const voicesByLanguage = getVoicesByLanguage();
    return ['推荐', '全部', ...Object.keys(voicesByLanguage)];
  };

  const updateTimeout = (timeout: number) => {
    const now = Date.now();
    if (timeout > 0 && timeout < now) {
      onSelectTimeout(bookKey, 0);
      setTimeoutCountdown('');
    } else if (timeout > 0) {
      setTimeoutCountdown(getCountdownTime(timeout));
    }
  };

  useEffect(() => {
    setTimeout(() => {
      updateTimeout(timeoutTimestamp);
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutTimestamp, timeoutCountdown]);

  useEffect(() => {
    const voiceId = onGetVoiceId();
    setSelectedVoice(voiceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        // 先尝试获取推荐语音
        const voiceGroups = await onGetVoices('recommended');
        const voicesCount = voiceGroups.reduce((acc, group) => acc + group.voices.length, 0);
        
        if (!voiceGroups || voicesCount === 0) {
          console.warn('No voices found via onGetVoices, trying fallback...');
          // 直接从edgeVoices加载作为备用
          try {
            const { getRecommendedVoices } = await import('@/data/edgeVoices');
            const recommendedVoices = getRecommendedVoices();
            if (recommendedVoices.length > 0) {
              const fallbackGroup = [{
                id: 'recommended',
                name: 'Recommended Voices',
                voices: recommendedVoices.map(voice => ({
                  id: voice.shortName,
                  name: voice.name,
                  lang: voice.locale,
                  disabled: false
                }))
              }];
              setVoiceGroups(fallbackGroup);
              console.log('✅ Fallback voices loaded for TTSPanel:', fallbackGroup[0].voices.length, 'voices');
              return;
            }
          } catch (fallbackError) {
            console.error('Fallback voice loading failed:', fallbackError);
          }
          
          // 如果所有方法都失败，显示无语音状态
          setVoiceGroups([
            {
              id: 'no-voices',
              name: `Voices for ${getLanguageName(ttsLang)}`,
              voices: [],
            },
          ]);
        } else {
          setVoiceGroups(voiceGroups);
          console.log('✅ Voices loaded for TTSPanel:', voicesCount, 'total voices');
        }
      } catch (error) {
        console.error('Error fetching voices for TTSPanel:', error);
        setVoiceGroups([]);
      }
    };

    // 延迟获取语音，确保TTS系统已经初始化
    const timer = setTimeout(fetchVoices, 1500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsLang, onGetVoices]);

  const timeoutOptions = getTTSTimeoutOptions();

  return (
    <div className='flex w-full flex-col items-center justify-center gap-2 rounded-2xl p-4'>
      <div className='flex w-full flex-col items-center gap-0.5'>
        <input
          className='range range-primary'
          type='range'
          min={0.2}
          max={3.0}
          step='0.1'
          value={rate}
          onChange={handleSetRate}
        />
        <div className='grid w-full grid-cols-7 text-xs opacity-50'>
          <span className='text-center'>|</span>
          <span className='text-center'>|</span>
          <span className='text-center'>|</span>
          <span className='text-center'>|</span>
          <span className='text-center'>|</span>
          <span className='text-center'>|</span>
          <span className='text-center'>|</span>
        </div>
        <div className='grid w-full grid-cols-7 text-xs text-base-content/70'>
          <span className='text-center'>Slow</span>
          <span className='text-center'></span>
          <span className='text-center'>1.0</span>
          <span className='text-center'>1.5</span>
          <span className='text-center'>2.0</span>
          <span className='text-center'></span>
          <span className='text-center'>Fast</span>
        </div>
        <div className='text-center text-sm font-medium text-base-content/80'>
          {rate.toFixed(1)}x
        </div>
      </div>
      <div className='flex items-center justify-center space-x-2'>
        <button onClick={onBackward} className='btn btn-ghost btn-circle btn-sm'>
          <MdFastRewind size={iconSize32} />
        </button>
        <button onClick={onTogglePlay} className='btn btn-ghost btn-circle'>
          {isPlaying ? (
            <MdPauseCircle size={iconSize48} className='text-primary' />
          ) : (
            <MdPlayCircle size={iconSize48} className='text-primary' />
          )}
        </button>
        <button onClick={onForward} className='btn btn-ghost btn-circle btn-sm'>
          <MdFastForward size={iconSize32} />
        </button>
        <div className='dropdown dropdown-top'>
          <button
            tabIndex={0}
            className='btn btn-ghost btn-circle btn-sm flex flex-col items-center justify-center relative'
          >
            <MdAlarm size={iconSize32} />
            {timeoutCountdown && (
              <span
                className={clsx(
                  'absolute -bottom-2 left-1/2 w-12 transform -translate-x-1/2 px-1',
                  'bg-primary/80 text-primary-content rounded-full text-center text-xs',
                )}
              >
                {timeoutCountdown}
              </span>
            )}
          </button>
          <ul
            tabIndex={0}
            className={clsx(
              'dropdown-content bg-base-200 menu menu-vertical rounded-box absolute right-0 z-[1] shadow-lg',
              'mt-2 max-h-96 w-[200px] overflow-y-auto',
            )}
          >
            {timeoutOptions.map((option, index) => (
              <li
                key={`${index}-${option.value}`}
                onClick={() => onSelectTimeout(bookKey, option.value)}
              >
                <div className='flex items-center px-2'>
                  <span
                    style={{
                      width: `${defaultIconSize}px`,
                      height: `${defaultIconSize}px`,
                    }}
                  >
                    {timeoutOption === option.value && <MdCheck className='text-base-content' />}
                  </span>
                  <span className={clsx('text-base sm:text-sm')}>{option.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className='dropdown dropdown-top'>
          <button tabIndex={0} className='btn btn-ghost btn-circle btn-sm'>
            <RiVoiceAiFill size={iconSize32} />
          </button>
          <div
            tabIndex={0}
            className={clsx(
              'dropdown-content bg-base-200 rounded-box absolute right-0 z-[1] shadow-lg',
              'mt-2 w-[320px] p-3',
            )}
          >
            {/* 搜索和筛选 */}
            <div className='mb-3'>
              <div className='flex gap-2 mb-2'>
                <div className='flex-1 relative'>
                  <input
                    type='text'
                    placeholder='搜索语音...'
                    value={voiceSearchQuery}
                    onChange={(e) => setVoiceSearchQuery(e.target.value)}
                    className='input input-sm w-full pr-8 bg-base-100'
                  />
                  <MdSearch className='absolute right-2 top-2 text-base-content opacity-50' size={16} />
                </div>
                <button
                  className='btn btn-sm btn-ghost'
                  onClick={() => {
                    setVoiceSearchQuery('');
                    setSelectedLanguage('推荐');
                  }}
                >
                  清除
                </button>
              </div>
              
              {!voiceSearchQuery && (
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className='select select-sm w-full bg-base-100'
                >
                  {getLanguageOptions().map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              )}
            </div>

            {/* 当前选中语音 */}
            {getCurrentVoice() && (
              <div className='mb-3 p-2 bg-primary/10 rounded'>
                <div className='text-sm font-medium'>{getCurrentVoice()?.name}</div>
                <div className='text-xs text-base-content/70'>
                  {getCurrentVoice()?.language} • {getCurrentVoice()?.country}
                </div>
              </div>
            )}

            {/* 语音列表 */}
            <div className='max-h-64 overflow-y-auto'>
              {getFilteredVoices().map((voice) => (
                <div
                  key={voice.shortName}
                  onClick={() => handleSelectVoice(voice.shortName, voice.locale)}
                  className={clsx(
                    'flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-base-300',
                    {
                      'bg-primary/20': selectedVoice === voice.shortName,
                    }
                  )}
                >
                  <div className='w-4 h-4 flex items-center justify-center'>
                    {selectedVoice === voice.shortName && <MdCheck className='text-primary' size={16} />}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium truncate'>{voice.name}</div>
                    <div className='text-xs text-base-content/70 flex items-center gap-1'>
                      <span>{voice.language}</span>
                      <span>•</span>
                      <span>{voice.country}</span>
                      <span>•</span>
                      <span className={clsx(
                        'px-1 rounded text-xs',
                        voice.gender === 'Female' ? 'bg-pink-500/20 text-pink-600' : 'bg-blue-500/20 text-blue-600'
                      )}>
                        {voice.gender === 'Female' ? '女' : '男'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {getFilteredVoices().length === 0 && (
                <div className='text-center text-base-content/50 py-4'>
                  没有找到匹配的语音
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTSPanel;