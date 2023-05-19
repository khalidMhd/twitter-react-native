import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';

const FloatingActionButton = () => {
  const clickHandler = () => {
    alert('Floating Button Clicked');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={clickHandler}
          style={styles.touchableOpacityStyle}>
          <MaterialCommunityIcons name="plus-circle" color="green" size={60} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FloatingActionButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  touchableOpacityStyle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
  },
  floatingButtonStyle: {
    resizeMode: 'contain',
  },
});
