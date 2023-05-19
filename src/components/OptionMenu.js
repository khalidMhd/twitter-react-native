import * as React from 'react';
import {Pressable, Text, NativeModules} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OptionMenu() {
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  React.useEffect(() => {
    AsyncStorage.getItem('userInfo').then(res => {
      const userInfo = JSON.parse(res);
      setToken(userInfo.token);
      setUserInfo(userInfo.user);
      return;
    });
  }, []);

  const navigation = useNavigation();
  const logoutHandler = async () => {
    await AsyncStorage.clear();
    NativeModules.DevSettings.reload();
    setTimeout(() => {
      navigation.navigate('Login');
    }, 1000);
  };
  return (
    <Pressable
      android_ripple={{
        color: '#666666',
        foreground: true,
        borderless: true,
      }}>
      <Menu>
        <MenuTrigger>
          <MaterialCommunityIcons
            style={{paddingLeft: 10}}
            name={Platform.OS === 'ios' ? 'ios-menu' : 'dots-vertical'}
            size={30}
          />
        </MenuTrigger>
        <MenuOptions>
          <MenuOption>
            <Pressable
              onPress={() =>
                navigation.navigate('Profile', {
                  user: userInfo?._id,
                  isEdit: true,
                })
              }>
              <Text>Profile</Text>
            </Pressable>
          </MenuOption>
          <MenuOption>
            <Pressable
              onPress={() =>
                navigation.navigate('Bookmarks', {
                  user: userInfo?._id,
                  isEdit: true,
                })
              }>
              <Text>Bookmarks</Text>
            </Pressable>
          </MenuOption>
          <MenuOption>
            <Pressable onPress={() => navigation.navigate('Setting')}>
              <Text>Setting</Text>
            </Pressable>
          </MenuOption>
          <MenuOption>
            <Pressable onPress={() => logoutHandler()}>
              <Text>Logout</Text>
            </Pressable>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </Pressable>
  );
}
