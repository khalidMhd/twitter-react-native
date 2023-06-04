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
import {baseURL, instance} from '../../APIs/instance';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider} from 'react-native-paper';
import {theme} from '../../core/theme';
import {useNavigation} from '@react-navigation/native';

export const TweetListScreen = props => {
  const navigation = useNavigation();

  const tweetList = props.tweet;
  const getTweet = props.getTweet;
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  const [imgError, setImgError] = React.useState(false);
  const [bookmarkList, setBookmarkList] = React.useState([]);

  const handleError = () => {
    setImgError(true);
  };
  React.useEffect(() => {
    AsyncStorage.getItem('userInfo').then(res => {
      const userInfo = JSON.parse(res);
      setToken(userInfo.token);
      setUserInfo(userInfo.user);
      return;
    });
  }, []);
  React.useEffect(() => {
    getBookmark();
  }, [token]);

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
      getTweet();
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
      getTweet();
    } catch (error) {
      throw error;
    }
  };

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
          setBookmarkList(res.data?.tweet);
        }
      } catch (error) {
        throw error;
      }
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
      getTweet();
      console.log(res.data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <>
      {tweetList &&
        tweetList.map((tweet, i) => (
          <View key={i}>
            {tweet && tweet.postedBy ? (
              <View>
                {tweet.reTweet == null ? (
                  <>
                    <View style={styles.tweetContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Profile', {
                            user: tweet?.postedBy?._id,
                          })
                        }>
                        <Image
                          source={
                            tweet?.postedBy?.imageURL
                              ? {uri: tweet?.postedBy?.imageURL}
                              : require('../../assets/profile.png')
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
                              tweetInfo: tweet,
                            })
                          }>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text style={styles.name}>
                              {tweet?.postedBy?.name}
                            </Text>
                            {/* <Text>Khalid</Text> */}
                          </View>
                          <Text style={styles.userName}>
                            @{tweet?.postedBy?.name}
                          </Text>
                          <Text style={styles.tweet}>{tweet?.content}</Text>
                          <View>
                            {tweet?.imageURL && (
                              <Image
                                source={{
                                  uri: `http://${tweet?.imageURL}`,
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
                                tweetInfo: tweet,
                              })
                            }
                            style={{flexDirection: 'row', marginTop: 7}}>
                            <MaterialCommunityIcons
                              name="comment"
                              color={
                                tweet?.comments?.some(
                                  cmnt => cmnt?.postedBy?._id == userInfo?._id,
                                )
                                  ? theme.colors.secondary
                                  : 'gray'
                              }
                              size={22}
                            />
                            <Text style={{marginLeft: 5, fontSize: 17}}>
                              {tweet?.comments?.length || 0}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => retweetHandel(tweet?._id)}
                            style={{
                              flexDirection: 'row',
                              marginTop: 7,
                              marginLeft: 20,
                            }}>
                            <MaterialCommunityIcons
                              name="autorenew"
                              color={
                                tweet?.reTweetCount?.includes(userInfo._id)
                                  ? theme.colors.secondary
                                  : 'gray'
                              }
                              size={22}
                            />
                            <Text style={{marginLeft: 5, fontSize: 17}}>
                              {tweet?.reTweetCount?.length || 0}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => likeHanel(tweet?._id)}
                            style={{
                              flexDirection: 'row',
                              marginTop: 7,
                              marginLeft: 20,
                            }}>
                            <MaterialCommunityIcons
                              name="heart"
                              color={
                                tweet?.likes.includes(userInfo._id)
                                  ? theme.colors.secondary
                                  : 'gray'
                              }
                              size={22}
                            />
                            <Text style={{marginLeft: 5, fontSize: 17}}>
                              {tweet?.likes?.length || 0}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => bookmarkHandler(tweet?._id)}
                            style={{
                              flexDirection: 'row',
                              marginTop: 7,
                              marginLeft: 20,
                            }}>
                            <MaterialCommunityIcons
                              name="card-plus"
                              color={
                                bookmarkList &&
                                bookmarkList?.some(
                                  bookmark => bookmark.tweet?._id == tweet?._id,
                                )
                                  ? theme.colors.secondary
                                  : 'gray'
                              }
                              size={22}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <Divider />
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
        ))}
    </>
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
