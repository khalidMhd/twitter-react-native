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

export const ReTweetListScreen = props => {
  const navigation = useNavigation();

  const tweetList = props.tweet;
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  const [imgError, setImgError] = React.useState(false);

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
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      {tweetList &&
        tweetList.map((tweet, i) => (
          <View key={i}>
            {tweet && tweet.postedBy ? (
              <View style={{marginVertical: 10}}>
                {tweet.reTweet !== null ? (
                  <View>
                    <View style={{flexDirection: 'row', marginBottom: 10}}>
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
                                  uri: tweet?.reTweet?.postedBy?.imageURL,
                                }
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
                            justifyContent: 'flex-start',
                            marginLeft: 7,
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
                                  cmnt => cmnt?.postedBy?._id == userInfo?._id,
                                )
                                  ? theme.colors.secondary
                                  : 'gray'
                              }
                              size={22}
                            />
                            <Text style={{marginLeft: 5, fontSize: 17}}>
                              {tweet?.reTweet?.comments?.length || 0}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => retweetHandel(tweet?.reTweet?._id)}
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
                            <Text style={{marginLeft: 5, fontSize: 17}}>
                              {tweet?.reTweet?.reTweetCount?.length || 0}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => likeHanel(tweet?.reTweet?._id)}
                            style={{
                              flexDirection: 'row',
                              marginTop: 7,
                              marginLeft: 20,
                            }}>
                            <MaterialCommunityIcons
                              name="heart"
                              color={
                                tweet?.reTweet?.likes.includes(userInfo._id)
                                  ? theme.colors.secondary
                                  : 'gray'
                              }
                              size={22}
                            />
                            <Text style={{marginLeft: 5, fontSize: 17}}>
                              {tweet?.reTweet?.likes?.length || 0}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <Divider />
                  </View>
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
