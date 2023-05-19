import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button';
import Layout from '../components/layout';
import axios from 'axios';
import {nameValidator} from '../helpers/nameValidator';
import {baseURL} from '../APIs/instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Paragraph from '../components/Paragraph';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Snackbar} from 'react-native-paper';
import {tweetValidator} from '../helpers/tweetValidator';

export const TweetScreen = ({navigation}) => {
  const [isSelected, setSelection] = useState(true);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const [tweetText, setTweetText] = useState({value: '', error: ''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = React.useState('');
  const [file, setFile] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const formData = new FormData();
  const [loader, setLoader] = React.useState(false);
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

  const pickImage = () => {
    Alert.alert('Select Image Source', 'Choose the image source', [
      {
        text: 'Camera',
        onPress: () => {
          launchCameraHandler();
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchLibraryHandler();
        },
      },
      {text: 'Cancel', onPress: () => {}, style: 'cancel'},
    ]);
  };
  const options = {
    title: 'Select Image',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const launchLibraryHandler = () => {
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets[0].uri;
        const fileType = source?.substring(source.lastIndexOf('.') + 1);
        console.log(source, fileType);
        setLoader(true);
        imageUpload(source, fileType);
      }
    });
  };

  const launchCameraHandler = () => {
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets[0].uri;
        const fileType = source?.substring(source.lastIndexOf('.') + 1);
        console.log(source, fileType);
        setLoader(true);
        imageUpload(source, fileType);
      }
    });
  };

  const imageUpload = async (uri, fileType) => {
    await formData.append('file', {
      uri: uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      fetch(`${baseURL}/api/uplaod-file`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })
        .then(response => response.json())
        .then(result => {
          console.log('Success:', result);
          setFile(result?.url);
          setLoader(false);
        })
        .catch(error => {
          setLoader(false);
          console.error('Error:', error);
        });
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  const tweetHandler = async () => {
    const nameError = tweetValidator(tweetText.value);
    if (nameError) {
      setTweetText({...tweetText, error: nameError});
      return;
    }
    try {
      setLoading(true);
      setError(false);
      setSuccess(false);
      const res = await axios.post(
        `${baseURL}/api/tweet`,
        {
          content: tweetText.value,
          imageURL: file,
          isComment: isSelected,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      if (res && res.status === 200) {
        if (res.data) {
          setSuccess(true);
        }
        setLoading(false);
        setMessage(res?.data?.message);
        setError(true);
        setVisible(true);
      }
    } catch (error) {
      setMessage('Unable to process!');
      setError(true);
      setLoading(false);
      throw error;
    }
  };

  const scheduleTweetHandler = async () => {
    const nameError = nameValidator(tweetText.value);
    if (nameError) {
      setTweetText({...tweetText, error: nameError});
      return;
    }
    try {
      setLoading(true);
      setError(false);
      setSuccess(false);
      const res = await axios.post(
        `${baseURL}/api/schedule-tweet`,
        {
          content: tweetText.value,
          imageURL: file,
          scheduleAt: date,
          isComment: isSelected,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      if (res && res.status === 200) {
        if (res.data) {
          setSuccess(true);
        }
        setLoading(false);
        setMessage(res?.data?.message);
        setError(true);
        setVisible(true);
      }
    } catch (error) {
      setMessage('Unable to process!');
      setError(true);
      setLoading(false);
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
    <Layout>
      {/* {!isSuccess && error && (
        <Paragraph style={styles.error}>
          {!isSuccess && error && message}
        </Paragraph>
      )}
      {isSuccess && (
        <Paragraph style={styles.success}>{isSuccess && message}</Paragraph>
      )} */}
      <TextInput
        returnKeyType="next"
        value={tweetText.value}
        onChangeText={text => setTweetText({value: text, error: ''})}
        error={!!tweetText.error}
        errorText={tweetText.error}
        style={styles.textArea}
        placeholder="Type something"
        placeholderTextColor="grey"
        numberOfLines={10}
        multiline={true}
      />
      <View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isSelected}
            onValueChange={setSelection}
            style={styles.checkbox}
            tintColors={{true: theme.colors.secondary, false: 'grey'}}
          />
          <Text style={styles.label}>Enable Comments</Text>
        </View>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={isSchedule}
            onValueChange={showDatepicker}
            style={styles.checkbox}
            tintColors={{true: theme.colors.secondary, false: 'grey'}}
          />
          <Text style={styles.label}>Schedule Tweet</Text>
        </View>
      </View>
      {loader && (
        <View style={[styles.loader, styles.horizontal]}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      )}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={pickImage}
        style={{justifyContent: 'center', alignItems: 'center'}}>
        <MaterialCommunityIcons name="camera-enhance" color="gray" size={80} />
        {/* <Image source={require('../assets/logo.png')} style={styles.image} /> */}
      </TouchableOpacity>

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
      {isSchedule ? (
        <View style={{flexDirection: 'row'}}>
          <Button
            mode="contained"
            onPress={scheduleTweetHandler}
            style={{marginTop: 24, width: '87%'}}>
            Schedule Tweet
          </Button>
          <TouchableOpacity
            style={{marginTop: 25}}
            onPress={() => navigation.navigate('CreatePoll')}>
            <MaterialCommunityIcons name="vote" color="gray" size={40} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{flexDirection: 'row'}}>
          <Button
            mode="contained"
            onPress={tweetHandler}
            style={{marginTop: 24, width: '87%'}}>
            Tweet
          </Button>
          <TouchableOpacity
            style={{marginTop: 25}}
            onPress={() => navigation.navigate('CreatePoll')}>
            <MaterialCommunityIcons name="vote" color="gray" size={40} />
          </TouchableOpacity>
        </View>
      )}

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
        {'Your tweet was send'}
      </Snackbar>
    </Layout>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    // marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
  },
  label: {
    margin: 8,
  },
  textArea: {
    height: 150,
    justifyContent: 'flex-start',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  image: {
    width: 110,
    height: 110,
  },
  error: {
    fontSize: 16,
    color: theme.colors.error,
  },
  success: {
    fontSize: 16,
    color: theme.colors.success,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});
