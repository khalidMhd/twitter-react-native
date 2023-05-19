import React from 'react';
import {Button, Text, View} from 'react-native';
export const AboutScreen = ({navigation}) => {

  const handleSubmit = (selectedChoice, id) => {
    console.log(selectedChoice, id);
  };

  return (
    <>
      <View>
        <Text>My Poll Screen</Text>
      </View>
    </>
  );
};
