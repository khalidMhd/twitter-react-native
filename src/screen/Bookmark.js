import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {baseURL, instance} from '../APIs/instance';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider} from 'react-native-paper';
import Layout from '../components/layout';
import {theme} from '../core/theme';

export const BookmarkScreen = ({navigation}) => {
  const [tweetList, setTweetList] = React.useState([]);
  const [bookmarkList, setBookmarkList] = React.useState([]);
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  const [imgError, setImgError] = React.useState(false);
  const [loader, setLoader] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    getBookmark();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleError = () => {
    setImgError(true);
  };
  const clickHandler = () => {
    navigation.navigate('Tweet');
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
    getBookmark();
  }, [token]);

  const getBookmark = async () => {
    if (token) {
      try {
        const res = await axios.get(`${baseURL}/api/getbookmark`, {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        });
        if (res.status === 200) {
          setTweetList(res.data?.tweet);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);

        throw error;
      }
    }
  };

  const likeHanel = async id => {
    try {
      const res = await axios.post(
        `${baseURL}/api/like`,
        {
          tweetId: id,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      getBookmark();
    } catch (error) {
      throw error;
    }
  };

  const retweetHandel = async id => {
    try {
      const res = await axios.post(
        `${baseURL}/api/retweet`,
        {
          tweetId: id,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      console.log('press', res.data);

      getBookmark();
    } catch (error) {
      throw error;
    }
  };

  const bookmarkHandler = async id => {
    try {
      const res = await axios.post(
        `${baseURL}/api/bookmark`,
        {
          tweetId: id,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      getBookmark();
      console.log(res.data);
    } catch (error) {
      console.log(error);
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
              {tweetList &&
                tweetList.map((tweet, i) => (
                  <View key={i}>
                    {tweet && tweet?.tweet.postedBy ? (
                      <View style={{marginVertical: 10}}>
                        <View style={styles.tweetContainer}>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate('Profile', {
                                user: tweet?.tweet?.postedBy?._id,
                              })
                            }>
                            <Image
                              source={
                                tweet?.tweet?.postedBy?.imageURL
                                  ? {uri: tweet?.tweet?.postedBy?.imageURL}
                                  : require('../assets/profile.png')
                              }
                              onLoad={() => setImgError(true)}
                              onError={() => setImgError(false)}
                              style={styles.profileImage}
                            />
                          </TouchableOpacity>
                          <View style={{marginLeft: 10}}>
                            <TouchableOpacity
                              onPress={() =>
                                navigation.navigate('Comment', {
                                  tweetInfo: tweet?.tweet,
                                })
                              }>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}>
                                <Text style={styles.name}>
                                  {tweet?.tweet?.postedBy?.name}
                                </Text>
                                {/* <Text>Khalid</Text> */}
                              </View>
                              <Text style={styles.userName}>
                                @{tweet?.tweet?.postedBy?.name}
                              </Text>
                              <Text style={styles.tweet}>
                                {tweet?.tweet?.content}
                              </Text>
                              <View>
                                {tweet?.tweet?.imageURL && (
                                  <Image
                                    source={{
                                      uri: `http://${tweet?.tweet?.imageURL}`,
                                      cache: 'only-if-cached',
                                    }}
                                    style={{
                                      width: '100%',
                                      height: 200,
                                      aspectRatio: 1.4,
                                    }}
                                  />
                                )}
                              </View>
                            </TouchableOpacity>
                            <View
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginHorizontal: 7,
                                marginVertical: 10,
                              }}>
                              <TouchableOpacity
                                disabled={!tweet.isComment}
                                onPress={() =>
                                  navigation.navigate('Comment', {
                                    tweetInfo: tweet?.tweet,
                                  })
                                }
                                style={{flexDirection: 'row', marginTop: 7}}>
                                <MaterialCommunityIcons
                                  name="comment"
                                  color={
                                    tweet?.tweet?.comments?.some(
                                      cmnt =>
                                        cmnt?.postedBy?._id == userInfo?._id,
                                    )
                                      ? theme.colors.secondary
                                      : 'gray'
                                  }
                                  size={22}
                                />
                                <Text style={{marginLeft: 5, fontSize: 17}}>
                                  {tweet?.tweet?.comments?.length || 0}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => retweetHandel(tweet?.tweet?._id)}
                                style={{
                                  flexDirection: 'row',
                                  marginTop: 7,
                                  marginLeft: 20,
                                }}>
                                <MaterialCommunityIcons
                                  name="autorenew"
                                  color={
                                    tweet?.tweet?.reTweetCount?.includes(
                                      userInfo._id,
                                    )
                                      ? theme.colors.secondary
                                      : 'gray'
                                  }
                                  size={22}
                                />
                                <Text style={{marginLeft: 5, fontSize: 17}}>
                                  {tweet?.tweet?.reTweetCount?.length || 0}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => likeHanel(tweet?.tweet?._id)}
                                style={{
                                  flexDirection: 'row',
                                  marginTop: 7,
                                  marginLeft: 20,
                                }}>
                                <MaterialCommunityIcons
                                  name="heart"
                                  color={
                                    tweet?.tweet?.likes.includes(userInfo._id)
                                      ? theme.colors.secondary
                                      : 'gray'
                                  }
                                  size={22}
                                />
                                <Text style={{marginLeft: 5, fontSize: 17}}>
                                  {tweet?.tweet?.likes?.length || 0}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  bookmarkHandler(tweet?.tweet?._id)
                                }
                                style={{
                                  flexDirection: 'row',
                                  marginTop: 7,
                                  marginLeft: 20,
                                }}>
                                <MaterialCommunityIcons
                                  name="card-plus"
                                  color={theme.colors.secondary}
                                  size={22}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                        <Divider />
                      </View>
                    ) : null}
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
  tweetContainer: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    color: '#657786',
    marginVertical: 1,
  },
  reTweet: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  tweet: {
    fontSize: 17,
    marginVertical: 5,
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
