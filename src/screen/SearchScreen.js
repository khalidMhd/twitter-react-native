import React, {useState} from 'react';
import Layout from '../components/layout';
import TextInputSearch from '../components/TextInputSearch';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import ButtonSearch from '../components/ButtonSearch';

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
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../core/theme';
import {baseURL} from '../APIs/instance';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider} from 'react-native-paper';
import {TweetListScreen} from './components/TweetList';

export const SearchScreen = ({navigation}) => {
  const [search, setSearch] = useState({value: '', error: ''});
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);

  const [tweetList, setTweetList] = React.useState([]);
  const [userList, setUserList] = React.useState([]);
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  const [loader, setLoader] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('userInfo').then(res => {
      const userInfo = JSON.parse(res);
      setToken(userInfo.token);
      setUserInfo(userInfo.user);
      return;
    });
  }, []);

  const onRefresh = () => {
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    setRefreshing(false);
  };

  const Tweet = () => (
    <View style={{flex: 1}}>
      <ScrollView>
        <TweetListScreen getTweet={getTweet} tweet={tweetList} />
      </ScrollView>
    </View>
  );

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
      getUser();
    } catch (error) {
      throw error;
    }
  };

  const User = () => (
    <View style={{flex: 1}}>
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
                        (user?.following?.some(info => info === userInfo._id) ||
                          user?.followers?.some(
                            info => info === userInfo._id,
                          )) ? (
                          <TouchableOpacity
                            onPress={() => handleUnFollow(user._id)}
                            style={styles.button}>
                            <Text style={{color: 'white'}}>Following</Text>
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
    </View>
  );

  const renderScene = SceneMap({
    tweet: Tweet,
    user: User,
  });

  const [routes] = React.useState([
    {key: 'tweet', title: 'Tweet'},
    {key: 'user', title: 'People'},
  ]);

  const getUser = async () => {
    try {
      setLoader(true);
      const res = await axios.post(`${baseURL}/api/user-search`, {
        query: search.value,
      });
      if (res.status === 200 || res.status === 201) {
        setUserList(res.data.user);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      throw error;
    }
  };

  const getTweet = async () => {
    try {
      setLoader(true);
      const res = await axios.post(`${baseURL}/api/search-tweet`, {
        tweet: search.value,
      });
      if (res.status === 200 || res.status === 201) {
        setTweetList(res.data.tweet);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      throw error;
    }
  };

  return (
    <Layout style={{flex: 1}}>
      {loader && loader ? (
        <View style={[styles.loader, styles.horizontal]}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <View style={{width: '68%'}}>
              <TextInputSearch
                label="Search"
                returnKeyType="next"
                value={search.value}
                onChangeText={text => setSearch({value: text, error: ''})}
                error={!!search.error}
                errorText={search.error}
              />
            </View>
            <View>
              <ButtonSearch
                mode="contained"
                onPress={() => {
                  getUser();
                  getTweet();
                  return;
                }}
                style={{marginTop: 10}}>
                Search
              </ButtonSearch>
            </View>
          </View>
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{width: layout.width}}
            renderTabBar={props => (
              <TabBar
                {...props}
                style={{backgroundColor: theme.colors.secondary, color: 'black'}}
              />
            )}
          />
        </>
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
