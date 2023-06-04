import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Layout from '../components/layout';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {baseURL, instance} from '../APIs/instance';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider, Snackbar} from 'react-native-paper';
import {theme} from '../core/theme';
import {TweetListScreen} from './components/TweetList';
import {ReTweetListScreen} from './components/ReTweetList';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import Poll from './components/Poll';

export const ProfileScreen = ({route}) => {
  const userId = route.params.user;
  const isEdit = route.params.isEdit || false;
  const [userList, setUserList] = React.useState({});
  const [tweetList, setTweetList] = React.useState([]);
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');
  const [imgError, setImgError] = React.useState(false);
  const [loader, setLoader] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation();
  const [bookmarkList, setBookmarkList] = React.useState([]);

  const [file, setFile] = React.useState('');
  const formData = new FormData();

  const [visible, setVisible] = React.useState(false);
  const [deleteTweet, setDeleteTweet] = React.useState(false);
  const onDismissSnackBar = () => setVisible(false);
  const onDismissDeleteSnackBar = () => setDeleteTweet(false);
  const pickImage = () => {
    Alert.alert('Select Image Source', 'Choose the image source', [
      {
        text: 'Camera',
        onPress: () => {
          launchCameraHandler();
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchLibraryHandler();
        },
      },
      {text: 'Cancel', onPress: () => {}, style: 'cancel'},
    ]);
  };

  const options = {
    title: 'Select Image',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const launchLibraryHandler = () => {
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets[0].uri;
        const fileType = source?.substring(source.lastIndexOf('.') + 1);
        setLoader(true);
        imageUpload(source, fileType);
      }
    });
  };

  const launchCameraHandler = () => {
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets[0].uri;
        const fileType = source?.substring(source.lastIndexOf('.') + 1);
        imageUpload(source, fileType);
      }
    });
  };

  const imageUpload = async (uri, fileType) => {
    await formData.append('file', {
      uri: uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      fetch(`${baseURL}/api/uplaod-file`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })
        .then(response => response.json())
        .then(result => {
          setFile(result?.url);
          console.log('file', result?.url);
          changeProfileHandler(result?.url);
        })
        .catch(error => {
          setLoader(false);
          console.log(error);
        });
    } catch (error) {
      setLoader(false);
      console.log(error);
    }
  };

  const changeProfileHandler = async file => {
    console.log(file);
    try {
      const res = await axios.post(
        `${baseURL}/api/change-profile-pic`,
        {
          imageURL: file,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      setVisible(true);
      await getUser();
      setLoader(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const onRefresh = () => {
    getTweet();
    getUser();
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
    setRefreshing(false);
  };

  const getTweet = async () => {
    if (token) {
      try {
        const res = await axios.get(`${baseURL}/api/tweet-by-user/${userId}`, {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        });
        if (res.status === 200 || res.status === 201) {
          setTweetList(res.data.tweet);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);

        throw error;
      }
    }
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
          setUserList(res.data.user);
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
      // getTweet();
      return;
    });
  }, []);

  React.useEffect(() => {
    setLoader(true);
    getTweet();
    getUser();
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
          setBookmarkList(res.data?.tweet);
          setLoader(false);
        }
      } catch (error) {
        setLoader(false);

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
      console.log(res.data);
    } catch (error) {
      console.log(error);
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
  
  const deletehandler = async id => {
    try {
      const res = await axios.post(
        `${baseURL}/api/delete-tweet`,
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
      console.log(res.data);
      setDeleteTweet(true);
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
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.profilePicture}
                onPress={() =>
                  (isEdit || userList?._id === userInfo?._id) && pickImage()
                }>
                <Image
                  source={
                    userList?.imageURL
                      ? {
                          uri: userList?.imageURL,
                        }
                      : require('../assets/profile.png')
                  }
                  onLoad={() => setImgError(true)}
                  onError={() => setImgError(false)}
                  style={{width: '100%', height: '100%', borderRadius: 50}}
                />
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>
                      {userList?.name || 'user name'}
                    </Text>
                    <Text style={styles.handle}>
                      @{userList?.name || 'user name'}
                    </Text>
                  </View>
                  <View>
                    {isEdit || userList?._id === userInfo?._id ? (
                      <TouchableOpacity
                        style={styles.button}
                        onPress={() =>
                          navigation.navigate('UpdateProfile', {
                            token: token,
                            userId: userInfo?._id,
                          })
                        }>
                        <Text style={{color: 'white'}}>Edit</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        {userList &&
                        userList?.followers?.some(
                          user => user._id === userInfo._id,
                        ) ? (
                          <TouchableOpacity
                            onPress={() => handleUnFollow(userList._id)}
                            style={styles.button}>
                            <Text style={{color: 'white'}}>Following</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleFollow(userList._id)}
                            style={styles.followingButton}>
                            <Text style={{color: 'white'}}>Follow</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.stats}>
                  <TouchableOpacity
                    style={styles.stat}
                    onPress={() =>
                      navigation.navigate('Following', {
                        user: userId,
                      })
                    }>
                    <Text style={styles.statNumber}>
                      {userList?.following?.length || 0}
                    </Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.stat}
                    onPress={() =>
                      navigation.navigate('Followers', {
                        user: userId,
                      })
                    }>
                    <Text style={styles.statNumber}>
                      {userList?.followers?.length || 0}
                    </Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.bio}>
                  {userList?.bio ||
                    "I'm a software developer and React Native enthusiast!"}
                </Text>
              </View>
            </View>
            <Divider />
            <Divider />

            <View style={{marginTop: 10}}>
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
                                  <View
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}>
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
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                    <View>
                                      {(isEdit ||
                                        userList?._id === userInfo?._id) && (
                                        <TouchableOpacity
                                          onPress={() =>
                                            deletehandler(tweet?._id)
                                          }
                                          style={{
                                            flexDirection: 'row',
                                            marginTop: 7,
                                          }}>
                                          <MaterialCommunityIcons
                                            name="delete"
                                            color={'red'}
                                            size={22}
                                          />
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                  </View>
                                  <View style={{marginLeft: 65}}>
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
                                                bookmark.tweet?._id ==
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
                                  <Divider />
                                </View>
                              ) : (
                                <>
                                  <View
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                    }}>
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
                                        </TouchableOpacity>
                                      </View>
                                    </View>
                                    <View>
                                    {(isEdit ||
                                        userList?._id === userInfo?._id) && (
                                        <TouchableOpacity
                                          onPress={() =>
                                            deletehandler(tweet?._id)
                                          }
                                          style={{
                                            flexDirection: 'row',
                                            marginTop: 7,
                                          }}>
                                          <MaterialCommunityIcons
                                            name="delete"
                                            color={'red'}
                                            size={22}
                                          />
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                  </View>
                                  <View style={{marginLeft: 65}}>
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
                                          style={{
                                            marginLeft: 5,
                                            fontSize: 17,
                                          }}>
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
                                          style={{
                                            marginLeft: 5,
                                            fontSize: 17,
                                          }}>
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
                                          style={{
                                            marginLeft: 5,
                                            fontSize: 17,
                                          }}>
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
                                                bookmark.tweet?._id ==
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
                                </>
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
                            <Divider />
                          </>
                        )}
                      </>
                    ) : null}
                  </View>
                ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        style={{backgroundColor: theme.colors.secondary}}
        action={{
          label: 'Undo',
          onPress: () => {
            // Do something
          },
        }}>
        {'Tweet picture updated successfully'}
      </Snackbar>
      <Snackbar
        visible={deleteTweet}
        onDismiss={onDismissDeleteSnackBar}
        style={{backgroundColor: theme.colors.secondary}}
        action={{
          label: 'Undo',
          onPress: () => {
            // Do something
          },
        }}>
        {'Tweet deleted successfully'}
      </Snackbar>
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
    // padding: 10,
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
    marginLeft: 10,
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
