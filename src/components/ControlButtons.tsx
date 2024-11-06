import React from 'react';
import {
  View,
  Button,
  StyleSheet,
  Touchable,
  TouchableOpacity,
  Image,
} from 'react-native';

interface ControlButtonsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRewind: () => void;
  onForward: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onRewind,
  onForward,
}) => (
  <View style={styles.controls}>
    <TouchableOpacity onPress={onRewind}>
      <Image
        source={require('../../assets/rewind.png')}
        style={styles.iconSize}
      />
    </TouchableOpacity>
    <TouchableOpacity onPress={isPlaying ? onPause : onPlay}>
      {isPlaying ? (
        <Image
          source={require('../../assets/pause.png')}
          style={styles.iconSize}
        />
      ) : (
        <Image
          source={require('../../assets/play.png')}
          style={styles.iconSize}
        />
      )}
    </TouchableOpacity>

    <TouchableOpacity onPress={onForward}>
      <Image
        source={require('../../assets/forward.png')}
        style={styles.iconSize}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  iconSize: {
    width: 50,
    height: 50,
  },
});
