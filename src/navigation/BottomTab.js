import * as React from 'react';
import {Pressable} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeScreen} from './src/screen/HomeScreen';
import {SearchScreen} from './src/screen/SearchScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileScreen} from './src/screen/ProfileScreen';
import {AboutScreen} from './src/screen/AboutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTab({navigation}) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'green',
        tabBarStyle: {
          height: 55,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          margin: 0,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          // tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerLeft: props => (
            <Pressable
              android_ripple={{
                color: '#666666',
                foreground: true,
                borderless: true,
              }}
              onPress={() => navigation.navigate('Profile')}>
              <MaterialCommunityIcons
                style={{paddingLeft: 10}}
                name={Platform.OS === 'ios' ? 'ios-menu' : 'face-recognition'}
                size={30}
              />
            </Pressable>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="shield-search"
              color={color}
              size={size}
            />
          ),
          headerLeft: props => (
            <Pressable
              android_ripple={{
                color: '#666666',
                foreground: true,
                borderless: true,
              }}
              onPress={() => navigation.navigate('Profile')}>
              <MaterialCommunityIcons
                style={{paddingLeft: 10}}
                name={Platform.OS === 'ios' ? 'ios-menu' : 'face-recognition'}
                size={30}
              />
            </Pressable>
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons
              name="information"
              color={color}
              size={size}
            />
          ),
          headerLeft: props => (
            <Pressable
              android_ripple={{
                color: '#666666',
                foreground: true,
                borderless: true,
              }}
              onPress={() => navigation.navigate('Profile')}>
              <MaterialCommunityIcons
                style={{paddingLeft: 10}}
                name={Platform.OS === 'ios' ? 'ios-menu' : 'face-recognition'}
                size={30}
              />
            </Pressable>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="home"
          component={BottomTab}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
