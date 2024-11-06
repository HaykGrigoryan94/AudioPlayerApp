import React from 'react';
import LottieView from 'lottie-react-native';

interface Props {
  onFinish: (param: Boolean) => void;
}

const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  return (
    <LottieView
      source={require('../../assets/SplashScreen.json')}
      style={{ width: '100%', height: '100%' }}
      autoPlay
      loop={false}
      onAnimationFinish={() => onFinish(true)}
    />
  );
};

export default SplashScreen;
