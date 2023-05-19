import React from 'react';
import {StyleSheet} from 'react-native';
import {Button as PaperButton} from 'react-native-paper';
import {theme} from '../core/theme';

export default function ButtonSearch({mode, style, ...props}) {
  return (
    <PaperButton
      style={[
        styles.button,
        {backgroundColor: theme.colors.secondary},
        style,
      ]}
      labelStyle={styles.text}
      mode={mode}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    // marginVertical: 10,
    // paddingVertical: 2,
    borderRadius: 8,            

  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 26,
  },
});
