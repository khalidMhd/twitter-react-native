import React, {useEffect, useState} from 'react';
import {TouchableOpacity, StyleSheet, View, NativeModules} from 'react-native';
import {Text} from 'react-native-paper';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import {emailValidator} from '../helpers/emailValidator';
import {loginPasswordValidator, passwordValidator} from '../helpers/passwordValidator';
import axios from 'axios';
import Paragraph from '../components/Paragraph';
import ProgressBar from '../components/ProgressBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseURL} from '../APIs/instance';

export default function LoginScreen({navigation, route}) {
  const [email, setEmail] = useState({value: '', error: ''});
  const [password, setPassword] = useState({value: '', error: ''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');

  const onLoginPressed = async () => {
    const emailError = emailValidator(email.value);
    const passwordError = loginPasswordValidator(password.value);
    if (emailError || passwordError) {
      setEmail({...email, error: emailError});
      setPassword({...password, error: passwordError});
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${baseURL}/api/signin`, {
        email: email.value,
        password: password.value,
      });
      if (res && res.status === 200) {
        setLoading(false);
        setMessage(res?.data?.message);
        if (res.data.token) {
          // setMessage(res?.data?.message);
          const user = await JSON.stringify(res.data);
          await AsyncStorage.setItem('userInfo', user);
          const userInfo = await AsyncStorage.getItem('userInfo');
          if (userInfo) {
            // navigation.navigate('Home');
            NativeModules.DevSettings.reload();
          }
        } else {
          setError(true);
          setLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
      setMessage('Unable to process!');
      setError(true);
      setLoading(false);
    }
  };

  return (
    <Background>
      <Logo />
      <Header>Welcome back.</Header>
      {/* {loading && <ProgressBar />} */}
      <Paragraph style={styles.error}>{error && message}</Paragraph>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={text => setEmail({value: text, error: ''})}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={text => setPassword({value: text, error: ''})}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('Signup')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  error: {
    fontSize: 16,
    color: theme.colors.error,
  },
});
