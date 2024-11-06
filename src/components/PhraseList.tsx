import React from 'react';
import { FlatList, Text, StyleSheet, View, ListRenderItem } from 'react-native';
import { Phrase } from '../hooks/useAudioPlayer';

interface PhraseListProps {
  phrases: Phrase[];
  currentPhraseIndex: number;
}

export const PhraseList: React.FC<PhraseListProps> = ({ phrases, currentPhraseIndex }) => {
  const renderPhrase: ListRenderItem<Phrase> = ({ item, index }) => {
    const isHighlighted = index === currentPhraseIndex;
    return (
      <View style={styles.phraseContainer}>
        <Text
          style={[styles.phrase, isHighlighted && styles.highlight]}
          accessibilityRole="text"
          accessibilityLabel={`${item.speaker} says: ${item.words}`}
          accessibilityState={{ selected: isHighlighted }}
        >
          {item.speaker}: {item.words}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={phrases}
      renderItem={renderPhrase}
      keyExtractor={(item, index) => `${item.speaker}-${index}`}
      extraData={currentPhraseIndex}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
  },
  phraseContainer: {
    paddingVertical: 5,
  },
  phrase: {
    fontSize: 18,
    color: '#333',
  },
  highlight: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#007AFF',
  },
});
