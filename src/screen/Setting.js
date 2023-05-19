import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from 'react-native-paper';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import {emailValidator} from '../helpers/emailValidator';
import {passwordValidator} from '../helpers/passwordValidator';
import {nameValidator} from '../helpers/nameValidator';
import Paragraph from '../components/Paragraph';
import axios from 'axios';
import {baseURL} from '../APIs/instance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingScreen = ({navigation}) => {
  const [password, setPassword] = useState({value: '', error: ''});
  const [newPassword, setNewPassword] = useState({value: '', error: ''});
  const [token, setToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    AsyncStorage.getItem('userInfo').then(res => {
      const userInfo = JSON.parse(res);
      setToken(userInfo.token);
      return;
    });
  }, []);
  const onSignUpPressed = async () => {
    const passwordError = passwordValidator(password.value);
    const newPasswordError = passwordValidator(newPassword.value);
    if (newPasswordError || passwordError) {
      setPassword({...password, error: passwordError});
      setNewPassword({...newPassword, error: newPasswordError});
      return;
    }
    try {
      setLoading(true);
      setError(false);
      setSuccess(false);
      const res = await axios.post(
        `${baseURL}/api/change-password`,
        {
          password: password.value,
          newPassword: newPassword.value,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      if (res && res.status === 200) {
        if (res.data?.token) {
          setSuccess(true);
        }
        setLoading(false);
        setMessage(res?.data?.message);
        setError(true);
      }
    } catch (error) {
      setMessage('Unable to process!');
      setError(true);
      setLoading(false);
      throw error;
    }
  };

  return (
    <Background>
      <Logo />
      <Header>Change Password</Header>
      <Paragraph style={styles.error}>
        {!isSuccess && error && message}
      </Paragraph>
      <Paragraph style={styles.success}>{isSuccess && message}</Paragraph>

      <TextInput
        label="Current Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({value: text, error: ''})}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />

      <TextInput
        label="New Password"
        returnKeyType="done"
        value={newPassword.value}
        onChangeText={text => setNewPassword({value: text, error: ''})}
        error={!!newPassword.error}
        errorText={newPassword.error}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{marginTop: 24}}>
        Submit
      </Button>
    </Background>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  error: {
    fontSize: 16,
    color: theme.colors.error,
  },
  success: {
    fontSize: 16,
    color: theme.colors.success,
  },
});
