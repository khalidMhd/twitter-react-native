import React from 'react';
import {ImageBackground, StyleSheet, KeyboardAvoidingView} from 'react-native';
import {theme} from '../core/theme';

export default function Layout({children}) {
  return (
    <ImageBackground
      source={require('../assets/background_dot.png')}
      resizeMode="repeat"
      style={styles.background}>
      <KeyboardAvoidingView style={styles.container}>
        {children}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
    padding: 10,
    width: '100%',
    alignSelf: 'center',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
