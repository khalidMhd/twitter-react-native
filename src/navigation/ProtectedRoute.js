import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screen/Login';

const Stack = createNativeStackNavigator();

const ProtectedRoute = ({component: Component, ...rest}) => {
  const isAuthenticated = true;

  return (
    <Stack.Screen
      {...rest}
      component={isAuthenticated ? Component : LoginScreen}
    />
  );
};

export default ProtectedRoute;
