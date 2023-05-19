import * as React from 'react';
import {Alert, Pressable, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeScreen} from './src/screen/HomeScreen';
import {SearchScreen} from './src/screen/SearchScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileScreen} from './src/screen/ProfileScreen';
import {AboutScreen} from './src/screen/AboutScreen';
import LoginScreen from './src/screen/Login';
import RegisterScreen from './src/screen/Signup';
import {MenuProvider} from 'react-native-popup-menu';
import OptionMenu from './src/components/OptionMenu';
import ResetPasswordScreen from './src/screen/ResetPassword';
import {SettingScreen} from './src/screen/Setting';
import {TweetScreen} from './src/screen/TweetScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {userInfoHandel} from './src/APIs/instance';
import {CommentScreen} from './src/screen/CommentScreen';
import { FollowingScreen } from './src/screen/FollowingScreen';
import { FollowerScreen } from './src/screen/FollowerScreen';
import UpdateProfile from './src/screen/UpdateProfile';
import { BookmarkScreen } from './src/screen/Bookmark';
import { PollScreen } from './src/screen/PollScreen';
import {requestUserPermission, getFCMToke, notificationListner} from './src/helpers/pushNotification'
import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTab({navigation}) {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabel: '',
        tabBarActiveTintColor: 'green',
        tabBarStyle: {
          height: 55,
          paddingTop: 10,
        },
        // tabBarLabelStyle: {
        //   fontSize: 14,
        //   margin: 0,
        // },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name="home" color={color} size={30} />
          ),
          headerRight: props => <OptionMenu />,
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
              size={28}
            />
          ),
          headerRight: props => <OptionMenu />,
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
              size={28}
            />
          ),
          headerRight: props => <OptionMenu />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setAuthenticated] = React.useState(false);
  const userInfoHandler = async () => {
    const data = (await AsyncStorage.getItem('userInfo')) || null;
    if (data) {
      setAuthenticated(true);
    }
  };

  React.useEffect(() => {
      userInfoHandler();
  }, [isAuthenticated]);

  React.useEffect(() => {
    // getFCMToke()
    requestUserPermission()
    notificationListner()
  }, [])

  // React.useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
  //   });

  //   return unsubscribe;
  // }, []);

  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="home"
            component={isAuthenticated ? BottomTab : LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Profile"
            component={isAuthenticated ? ProfileScreen : LoginScreen}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={RegisterScreen} />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{
              title: 'Reset Password',
            }}
          />
          <Stack.Screen
            name="Setting"
            component={SettingScreen}
            options={{
              title: 'Setting',
            }}
          />
          <Stack.Screen
            name="Tweet"
            component={TweetScreen}
            options={{
              title: 'New Tweet',
            }}
          />
          <Stack.Screen
            name="Comment"
            component={CommentScreen}
            options={{
              title: 'Tweet',
            }}
          />
          <Stack.Screen
            name="Following"
            component={FollowingScreen}
            options={{
              title: 'Following',
            }}
          />
          <Stack.Screen
            name="Followers"
            component={FollowerScreen}
            options={{
              title: 'Followers',
            }}
          />
          <Stack.Screen
            name="UpdateProfile"
            component={UpdateProfile}
            options={{
              title: 'Update Profile',
            }}
          />
          <Stack.Screen
            name="CreatePoll"
            component={PollScreen}
            options={{
              title: 'Create Poll',
            }}
          />
          <Stack.Screen
            name="Bookmarks"
            component={BookmarkScreen}
            options={{
              title: 'Bookmarks',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
}
