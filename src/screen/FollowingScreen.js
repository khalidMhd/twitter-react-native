import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../core/theme';
import Layout from '../components/layout';
import {baseURL} from '../APIs/instance';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export const FollowingScreen = ({route}) => {
  const userId = route.params.user;
  const [userList, setUserList] = React.useState([]);
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  const [imgError, setImgError] = React.useState(false);
  const [loader, setLoader] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation();
  const onRefresh = () => {
    getUser();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    setRefreshing(false);
  };

  const handleError = () => {
    setImgError(true);
  };

  const getUser = async () => {
    if (token) {
      try {
        const res = await axios.get(`${baseURL}/api/profile/${userId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        });
        if (res.status === 200 || res.status === 201) {
          setUserList(res.data.user.following);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);

        throw error;
      }
    }
  };

  React.useEffect(() => {
    setLoader(true);
    AsyncStorage.getItem('userInfo').then(res => {
      const userInfo = JSON.parse(res);
      setToken(userInfo.token);
      setUserInfo(userInfo.user);
      return;
    });
  }, []);

  React.useEffect(() => {
    setLoader(true);
    getUser();
  }, [token]);

  const handleFollow = async id => {
    try {
      const res = await axios.post(
        `${baseURL}/api/follow`,
        {
          followId: id,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      getUser();
    } catch (error) {
      throw error;
    }
  };

  const handleUnFollow = async id => {
    try {
      const res = await axios.post(
        `${baseURL}/api/unfollow`,
        {
          followId: id,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      console.log(res.data);
      getUser();
    } catch (error) {
      throw error;
    }
  };

  return (
    <Layout>
      <SafeAreaView style={styles.container}>
        {loader && loader ? (
          <View style={[styles.loader, styles.horizontal]}>
            <ActivityIndicator size="large" color={theme.colors.secondary} />
          </View>
        ) : (
          <>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              {userList &&
                userList.map((user, i) => (
                  <View key={i}>
                    <TouchableOpacity
                      style={styles.header}
                      onPress={() =>
                        navigation.push('Profile', {
                          user: user?._id,
                        })
                      }>
                      <View style={styles.profilePicture}>
                        <Image
                          source={
                            user?.imageURL
                              ? {
                                  uri: user?.imageURL,
                                }
                              : require('../assets/profile.png')
                          }
                          onLoad={() => setImgError(true)}
                          onError={() => setImgError(false)}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 50,
                          }}
                        />
                      </View>
                      <View style={styles.profileInfo}>
                        <View style={styles.row}>
                          <View>
                            <Text style={styles.name}>
                              {user?.name || 'user name'}
                            </Text>
                            <Text style={styles.handle}>
                              @{user?.name || 'user name'}
                            </Text>
                          </View>
                          {user?._id !== userInfo._id ? (
                            <View>
                              {user &&
                              (user?.following?.some(
                                info => info === userInfo._id,
                              ) ||
                                user?.followers?.some(
                                  info => info === userInfo._id,
                                )) ? (
                                <TouchableOpacity
                                  onPress={() => handleUnFollow(user._id)}
                                  style={styles.button}>
                                  <Text style={{color: 'white'}}>
                                    Following
                                  </Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => handleFollow(user._id)}
                                  style={styles.followingButton}>
                                  <Text style={{color: 'white'}}>Follow</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </TouchableOpacity>
                    <Divider />
                  </View>
                ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    // alignItems: 'center',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profilePicture: {
    width: 60,
    height: 60,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 20,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  handle: {
    fontSize: 16,
    color: '#657786',
    marginVertical: 1,
  },
  stats: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  stat: {
    marginRight: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 16,
    color: '#657786',
  },
  bio: {
    fontSize: 16,
    marginTop: 10,
  },
  button: {
    backgroundColor: 'gray',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: 'green',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unfollowingButton: {
    backgroundColor: 'green',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});
