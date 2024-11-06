import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import Sound from 'react-native-sound';

import audioData from '../../audioData.json';

export interface Phrase {
  words: string;
  time: number;
  speaker: string;
}

interface AudioData {
  pause: number;
  speakers: { name: string; phrases: { words: string; time: number }[] }[];
}

const data: AudioData = audioData;

const flattenPhrases = (): Phrase[] => {
  const phrases: Phrase[] = [];
  const speakers = data.speakers;
  const phraseIndices = Array(speakers.length).fill(0); // Track each speaker's current phrase index
  let phrasesAdded = 0;
  const totalPhrases = speakers.reduce((sum, speaker) => sum + speaker.phrases.length, 0);

  // Interleave phrases until all phrases have been added
  while (phrasesAdded < totalPhrases) {
    for (let s = 0; s < speakers.length; s++) {
      const speaker = speakers[s];
      const index = phraseIndices[s];

      // Ensure we only add phrases in sequence and once
      if (index < speaker.phrases.length) {
        phrases.push({ ...speaker.phrases[index], speaker: speaker.name });
        phraseIndices[s]++; // Move to the next phrase for this speaker
        phrasesAdded++;
      }
    }
  }

  return phrases;
};



const calculateCumulativeTimes = (phrases: Phrase[]): number[] => {
  return phrases.map((_, index) =>
    phrases.slice(0, index).reduce((acc, phrase) => acc + phrase.time + data.pause, 0)
  );
};

export const useAudioPlayer = () => {
  const phrases = flattenPhrases();
  const cumulativeTimes = calculateCumulativeTimes(phrases);

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sound, setSound] = useState<Sound | null>(null);
  const [pausedTime, setPausedTime] = useState<number | null>(null);
  const [audioCompleted, setAudioCompleted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [displayedPhrases, setDisplayedPhrases] = useState<Phrase[]>([]);

  useEffect(() => {
    const soundInstance = new Sound(require('../../assets/example_audio.mp3'), (error) => {
      if (error) {
        Alert.alert('Error', 'Failed to load sound file');
        console.error('Failed to load sound', error);
        return;
      }
      setSound(soundInstance);
    });

    return () => {
      soundInstance.release();
    };
  }, []);

  useEffect(() => {
    if (sound) {
      sound.setVolume(volume);
    }
  }, [volume, sound]);

  useEffect(() => {
    if (sound && isPlaying) {
      const interval = setInterval(() => {
        sound.getCurrentTime((seconds) => {
          const currentTime = seconds * 1000;

          const phraseIndex = cumulativeTimes.findIndex(
            (startTime, i) => currentTime >= startTime && currentTime < startTime + phrases[i].time
          );

          if (phraseIndex !== -1 && phraseIndex !== currentPhraseIndex) setCurrentPhraseIndex(phraseIndex);

          if (currentTime >= cumulativeTimes[cumulativeTimes.length - 1] + phrases[phrases.length - 1].time) {
            setIsPlaying(false);
            setAudioCompleted(true);
            setCurrentPhraseIndex(0);
          }
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [sound, isPlaying, currentPhraseIndex]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const playPhrase = (index: number, startTime: number) => {
    if (sound) {
      sound.setCurrentTime(startTime / 1000);
      sound.play((success) => {
        if (!success) Alert.alert('Playback Error', 'Failed to play the sound');
      });
      setIsPlaying(true);
      setAudioCompleted(false);
      setCurrentPhraseIndex(index);
    }
  };

  const handlePlay = () => {
    if (audioCompleted) {
      setCurrentPhraseIndex(0);
      setPausedTime(null);
      playPhrase(0, 0);
    } else if (pausedTime !== null) {
      playPhrase(currentPhraseIndex, pausedTime);
      setPausedTime(null);
    } else {
      playPhrase(currentPhraseIndex, cumulativeTimes[currentPhraseIndex]);
    }
  };

  const handlePause = () => {
    if (sound && isPlaying) {
      sound.getCurrentTime((seconds) => {
        setPausedTime(seconds * 1000);
      });
      sound.pause();
      setIsPlaying(false);
    }
  };

  const handleRewind = () => {
    if (sound) {
      const prevIndex = currentPhraseIndex > 0 ? currentPhraseIndex - 1 : 0;
      playPhrase(prevIndex, cumulativeTimes[prevIndex]);
    }
  };

  const handleForward = () => {
    if (sound && currentPhraseIndex < phrases.length - 1) {
      const nextIndex = currentPhraseIndex + 1;
      playPhrase(nextIndex, cumulativeTimes[nextIndex]);
    }
  };

  const handlePhraseUpdate = (newIndex: number) => {
    setCurrentPhraseIndex(newIndex);
    setDisplayedPhrases(phrases.slice(0, newIndex + 1)); // Show all phrases up to the current one
  };

  return {
    phrases,
    currentPhraseIndex,
    isPlaying,
    handlePlay,
    handlePause,
    handleRewind,
    handleForward,
    volume,
    handleVolumeChange,
    displayedPhrases,
    handlePhraseUpdate,
  };
};
