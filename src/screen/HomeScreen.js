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
import Poll from './components/Poll';

export const HomeScreen = ({navigation}) => {
  const [tweetList, setTweetList] = React.useState([]);
  const [bookmarkList, setBookmarkList] = React.useState([]);
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  const [imgError, setImgError] = React.useState(false);
  const [loader, setLoader] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    getTweet();
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
    getTweet();
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
          setBookmarkList(res.data?.tweet);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);

        throw error;
      }
    }
  };

  const getTweet = async () => {
    if (token) {
      try {
        const res = await axios.get(`${baseURL}/api/tweet`, {
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
      console.log('press', res.data);

      getTweet();
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

  const castVoteHandler = async (pollIndex, id) => {
    try {
      const res = await axios.post(
        `${baseURL}/api/cast-vote`,
        {
          pollId: id,
          pollIndex: pollIndex,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      getTweet();
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
                    {tweet && tweet.postedBy ? (
                      <>
                        {tweet.isTweet ? (
                          <>
                            <View style={{marginVertical: 10}}>
                              {tweet.reTweet !== null ? (
                                <View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      marginBottom: 10,
                                    }}>
                                    <MaterialCommunityIcons
                                      name="autorenew"
                                      color={theme.colors.secondary}
                                      size={22}
                                    />
                                    <Text style={styles.reTweet}>
                                      {tweet?.postedBy?.name} Retweeted
                                    </Text>
                                  </View>
                                  <View style={styles.tweetContainer}>
                                    <TouchableOpacity
                                      onPress={() =>
                                        navigation.navigate('Profile', {
                                          user: tweet?.reTweet?.postedBy?._id,
                                        })
                                      }>
                                      <Image
                                        source={
                                          tweet?.reTweet?.postedBy?.imageURL
                                            ? {
                                                uri: tweet?.reTweet?.postedBy
                                                  ?.imageURL,
                                              }
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
                                            tweetInfo: tweet?.reTweet,
                                          })
                                        }>
                                        <View
                                          style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                          }}>
                                          <Text style={styles.name}>
                                            {tweet?.reTweet?.postedBy?.name}
                                          </Text>
                                          {/* <Text>Khalid</Text> */}
                                        </View>
                                        <Text style={styles.userName}>
                                          @{tweet?.reTweet?.postedBy?.name}
                                        </Text>
                                        <Text style={styles.tweet}>
                                          {tweet?.reTweet?.content}
                                        </Text>

                                        <View>
                                          {tweet?.reTweet?.imageURL && (
                                            <Image
                                              source={{
                                                uri: `http://${tweet?.reTweet?.imageURL}`,
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
                                          disabled={!tweet.reTweet.isComment}
                                          onPress={() =>
                                            navigation.navigate('Comment', {
                                              tweetInfo: tweet?.reTweet,
                                            })
                                          }
                                          style={{
                                            flexDirection: 'row',
                                            marginTop: 7,
                                          }}>
                                          <MaterialCommunityIcons
                                            name="comment"
                                            color={
                                              tweet?.reTweet?.comments?.some(
                                                cmnt =>
                                                  cmnt?.postedBy?._id ==
                                                  userInfo?._id,
                                              )
                                                ? theme.colors.secondary
                                                : 'gray'
                                            }
                                            size={22}
                                          />
                                          <Text
                                            style={{
                                              marginLeft: 5,
                                              fontSize: 17,
                                            }}>
                                            {tweet?.reTweet?.comments?.length ||
                                              0}
                                          </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          onPress={() =>
                                            retweetHandel(tweet?.reTweet?._id)
                                          }
                                          style={{
                                            flexDirection: 'row',
                                            marginTop: 7,
                                            marginLeft: 20,
                                          }}>
                                          <MaterialCommunityIcons
                                            name="autorenew"
                                            color={
                                              tweet?.reTweet?.reTweetCount?.includes(
                                                userInfo._id,
                                              )
                                                ? theme.colors.secondary
                                                : 'gray'
                                            }
                                            size={22}
                                          />
                                          <Text
                                            style={{
                                              marginLeft: 5,
                                              fontSize: 17,
                                            }}>
                                            {tweet?.reTweet?.reTweetCount
                                              ?.length || 0}
                                          </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          onPress={() =>
                                            likeHanel(tweet?.reTweet?._id)
                                          }
                                          style={{
                                            flexDirection: 'row',
                                            marginTop: 7,
                                            marginLeft: 20,
                                          }}>
                                          <MaterialCommunityIcons
                                            name="heart"
                                            color={
                                              tweet?.reTweet?.likes.includes(
                                                userInfo._id,
                                              )
                                                ? theme.colors.secondary
                                                : 'gray'
                                            }
                                            size={22}
                                          />
                                          <Text
                                            style={{
                                              marginLeft: 5,
                                              fontSize: 17,
                                            }}>
                                            {tweet?.reTweet?.likes?.length || 0}
                                          </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          onPress={() =>
                                            bookmarkHandler(tweet?.reTweet?._id)
                                          }
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
                                                bookmark =>
                                                  bookmark.tweet._id ==
                                                  tweet?.reTweet?._id,
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
                                </View>
                              ) : (
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
                                      <Text style={styles.tweet}>
                                        {tweet?.content}
                                      </Text>
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
                                        style={{
                                          flexDirection: 'row',
                                          marginTop: 7,
                                        }}>
                                        <MaterialCommunityIcons
                                          name="comment"
                                          color={
                                            tweet?.comments?.some(
                                              cmnt =>
                                                cmnt?.postedBy?._id ==
                                                userInfo?._id,
                                            )
                                              ? theme.colors.secondary
                                              : 'gray'
                                          }
                                          size={22}
                                        />
                                        <Text
                                          style={{marginLeft: 5, fontSize: 17}}>
                                          {tweet?.comments?.length || 0}
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() =>
                                          retweetHandel(tweet?._id)
                                        }
                                        style={{
                                          flexDirection: 'row',
                                          marginTop: 7,
                                          marginLeft: 20,
                                        }}>
                                        <MaterialCommunityIcons
                                          name="autorenew"
                                          color={
                                            tweet?.reTweetCount?.includes(
                                              userInfo._id,
                                            )
                                              ? theme.colors.secondary
                                              : 'gray'
                                          }
                                          size={22}
                                        />
                                        <Text
                                          style={{marginLeft: 5, fontSize: 17}}>
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
                                        <Text
                                          style={{marginLeft: 5, fontSize: 17}}>
                                          {tweet?.likes?.length || 0}
                                        </Text>
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() =>
                                          bookmarkHandler(tweet?._id)
                                        }
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
                                              bookmark =>
                                                bookmark.tweet._id ==
                                                tweet?._id,
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
                              )}
                              <Divider />
                            </View>
                          </>
                        ) : (
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
                                    navigation.navigate('Profile', {
                                      user: tweet?.postedBy?._id,
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
                                </TouchableOpacity>
                                <Poll
                                  id={tweet?.poll?._id}
                                  userId={userInfo?._id}
                                  question={tweet?.poll?.question}
                                  isActive={tweet?.poll?.isActive}
                                  choices={[
                                    {
                                      text: tweet?.poll?.optionsOne?.text,
                                      votes: tweet?.poll?.optionsOne?.votes,
                                      pollIndex:
                                        tweet?.poll?.optionsOne?.pollIndex,
                                    },
                                    {
                                      text: tweet?.poll?.optionsTwo?.text,
                                      votes: tweet?.poll?.optionsTwo?.votes,
                                      pollIndex:
                                        tweet?.poll?.optionsTwo?.pollIndex,
                                    },
                                    {
                                      text: tweet?.poll?.optionsThree?.text,
                                      votes: tweet?.poll?.optionsThree?.votes,
                                      pollIndex:
                                        tweet?.poll?.optionsThree?.pollIndex,
                                    },
                                    {
                                      text: tweet?.poll?.optionsFour?.text,
                                      votes: tweet?.poll?.optionsFour?.votes,
                                      pollIndex:
                                        tweet?.poll?.optionsFour?.pollIndex,
                                    },
                                  ]}
                                  onSubmit={castVoteHandler}
                                />
                              </View>
                            </View>
                            <Divider style={{marginVertical: 13}} />
                          </>
                        )}
                      </>
                    ) : null}
                  </View>
                ))}
            </ScrollView>

            <View style={styles.container}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={clickHandler}
                style={styles.touchableOpacityStyle}>
                <MaterialCommunityIcons
                  name="plus-circle"
                  color="green"
                  size={60}
                />
              </TouchableOpacity>
            </View>
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
