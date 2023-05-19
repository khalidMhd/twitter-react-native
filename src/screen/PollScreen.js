import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Button from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseURL} from '../APIs/instance';
import axios from 'axios';
import {Snackbar} from 'react-native-paper';
import {theme} from '../core/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const PollOption = ({option, index, selected, onPress}) => {
  const isSelected = selected === index;

  return (
    <TouchableOpacity
      style={isSelected ? styles.optionSelected : styles.option}
      onPress={() => onPress(index)}>
      <Text style={isSelected ? styles.textSelected : styles.text}>
        {option}
      </Text>
    </TouchableOpacity>
  );
};

export const PollScreen = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [selected, setSelected] = useState(null);

  const [token, setToken] = React.useState('');
  const [visible, setVisible] = React.useState(false);
  const onDismissSnackBar = () => setVisible(false);

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [isSchedule, setSchedule] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    if (mode == 'date') {
      showTimepicker();
    }
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = async () => {
    setSchedule(!isSchedule);
    // if (isSchedule == true && show == false) {
    //   showMode('date');
    // }
  };

  useEffect(() => {
    if (isSchedule) {
      showMode('date');
    }
  }, [isSchedule]);

  const showTimepicker = () => {
    showMode('time');
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = index => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handlePressOption = index => {
    setSelected(index);
  };

  const pollHandler = async () => {
    // const nameError = nameValidator(tweetText.value);
    // if (nameError) {
    //   setTweetText({...tweetText, error: nameError});
    //   return;
    // }
    try {
      const res = await axios.post(
        `${baseURL}/api/poll`,
        {
          scheduleAt: date,
          question: question,
          optionOne: options[0],
          optionTwo: options[1],
          optionThree: options[2],
          optionFour: options[3],
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      console.log(res.data);
      if (res && res.status === 200) {
        setVisible(true);
      }
    } catch (error) {
      throw error;
    }
  };

  React.useEffect(() => {
    AsyncStorage.getItem('userInfo').then(res => {
      const userInfo = JSON.parse(res);
      setToken(userInfo.token);
      return;
    });
  }, []);
  const minimumDate = new Date(); // Set minimum date to today's date

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Question:</Text>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
      />

      <Text style={styles.label}>Options:</Text>
      {options.map((option, index) => (
        <View key={index} style={styles.optionContainer}>
          <TextInput
            style={styles.optionInput}
            value={option}
            onChangeText={value => handleOptionChange(index, value)}
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveOption(index)}>
            <Text style={styles.removeButtonText}>x</Text>
          </TouchableOpacity>
        </View>
      ))}
      <View style={{display: 'flex', flexDirection: 'row'}}>
        {options.length != 4 && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddOption}>
            <Text style={styles.addButtonText}>Add Option</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.pollButton} onPress={showDatepicker}>
          <Text style={styles.addButtonText}>Poll Duration</Text>
        </TouchableOpacity>
      </View>
      <View>
        {/* <Text>selected: {date.toLocaleString()}</Text> */}
        {/* <Button onPress={showDatepicker}>Date</Button> */}
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            minimumDate={minimumDate}
            value={date}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChange}
          />
        )}
      </View>

      <Button
        mode="contained"
        onPress={pollHandler}
        style={{marginTop: 24}}
        disabled={
          options.length < 2 ||
          options[0]?.length == 0 ||
          options[1]?.length == 0 ||
          options[2]?.length == 0 ||
          options[3]?.length == 0 ||
          !question
        }>
        Create Poll
      </Button>

      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        style={{backgroundColor: theme.colors.secondary}}
        action={{
          label: 'Undo',
          onPress: () => {
            // Do something
          },
        }}>
        {'Poll Created'}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  pollButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 10
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
  },

  removeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
