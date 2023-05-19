import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const Poll = ({question, choices, onSubmit, id, userId, isActive}) => {
  const [selectedChoice, setSelectedChoice] = useState();
  const handleSelectChoice = choice => {
    onSubmit(choice, id);
  };

  useEffect(() => {
    const isTrue = choices.some(check => check.votes.includes(userId));
    setSelectedChoice(isTrue);
  }, [choices]);

  return (
    <View style={styles.container}>

      <Text style={styles.question}>{question}</Text>
      {choices.map((choice, index) => (
        <View key={index}>
          {choice?.text && (
            <TouchableOpacity
              disabled={selectedChoice || !isActive}
              key={index}
              onPress={() =>
                !selectedChoice && handleSelectChoice(choice?.pollIndex)
              }
              style={[
                styles.choice,
                choice?.votes.includes(userId) && styles.selectedChoice,
              ]}>
              <Text style={styles.choiceText}>
                {choice?.text}{' '}
                {(selectedChoice || !isActive) && choice?.votes?.length}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {/* <TouchableOpacity
        onPress={handleSubmit}
        disabled={!selectedChoice}
        style={[
          styles.button,
          !selectedChoice && styles.disabledButton
        ]}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // backgroundColor: '#F5F5F5'
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  choice: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    width: '100%',
    minWidth: '80%',
  },
  selectedChoice: {
    backgroundColor: 'green',
  },
  choiceText: {
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Poll;
