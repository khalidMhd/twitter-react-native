import React, {useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ScrollView,
} from 'react-native';
import {baseURL, instance} from '../APIs/instance';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider, Snackbar} from 'react-native-paper';
import Layout from '../components/layout';
import {theme} from '../core/theme';
import RNFS from 'react-native-fs';

export const CommentScreen = ({route}) => {
  const tweet = route.params.tweetInfo;
  const [token, setToken] = React.useState('');
  const [comment, setComment] = useState('');
  const [userInfo, setUserInfo] = useState([]);
  const [bookmarkList, setBookmarkList] = React.useState([]);
  const [visible, setVisible] = React.useState(false);
  const onDismissSnackBar = () => setVisible(false);
  React.useEffect(() => {
    AsyncStorage.getItem('userInfo').then(res => {
      const userInfo = JSON.parse(res);
      setUserInfo(userInfo);
      setToken(userInfo.token);
      return;
    });
  }, []);

  React.useEffect(() => {
    getBookmark();
  }, [token]);

  const handleCommentSubmit = async id => {
    try {
      const res = await axios.post(
        `${baseURL}/api/comment`,
        {
          content: comment,
          tweetId: id,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );
      tweet.comments.unshift({
        text: comment,
        postedBy: {
          _id: '',
          name: userInfo?.user?.name || 'userName',
        },
        _id: id,
      });
      setVisible(true);
      setComment('');
    } catch (error) {
      throw error;
    }
  };

  const [imgError, setImgError] = React.useState(false);

  const handleError = () => {
    setImgError(true);
  };
  const clickHandler = () => {
    navigation.navigate('Tweet');
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
      console.log(res.data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const downloadHandler = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/download-file/file`, { responseType: 'blob' });
      const path = RNFS.DocumentDirectoryPath + '/' + "imageName.png";
      await RNFS.writeFile(path, res.data, 'base64');
  
      console.log(res);
    } catch (error) {
      throw error;
    }
  };

  const downloadImage = async (url) => {
    try {
      console.log(url);
      const { config, fs } = RNFS;
      const destinationPath = `${RNFS.DocumentDirectoryPath}/image.png`;

  
      const downloadOptions = {
        fromUrl: url,
        toFile: destinationPath,
        background: true,
        discretionary: true,
        cacheable: true,
        progressDivider: 1,
        headers: {},
        connectionTimeout: 60000,
        readTimeout: 60000,
        progress: (res) => {
          // handle progress updates if needed
        },
      };
      const result = await config({
        fileCache: true,
        path: destinationPath,
        addAndroidDownloads:
          Platform.OS === 'android'
            ? {
                useDownloadManager: true,
                notification: true,
                title: 'Download',
                description: 'Downloading image',
                mime: 'image/png',
                mediaScannable: true,
                path: destinationPath,
              }
            : undefined,
      });

      const { jobId } = result;
      const downloadResult = await fs.downloadFile(downloadOptions);
  
      if (downloadResult.statusCode === 200) {
        // Image downloaded successfully
        console.log('Image downloaded successfully');
      } else {
        // Failed to download image
        console.log('Failed to download image');
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  
  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView>
          <View>
            {(tweet && tweet?.postedBy && tweet?.imageURL) || tweet?.content ? (
              <View style={{marginVertical: 10}}>
                <View style={styles.tweetContainer}>
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
                  <View style={{marginLeft: 10}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={styles.name}>{tweet?.postedBy?.name}</Text>
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
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginHorizontal: 7,
                        marginVertical: 10,
                      }}>
                      <TouchableOpacity
                        disabled
                        // onPress={() =>
                        //   navigation.navigate('Comment', (tweetInfo = tweet))
                        // }
                        style={{flexDirection: 'row', marginTop: 7}}>
                        <MaterialCommunityIcons
                          name="comment"
                          color={theme.colors.secondary}
                          size={22}
                        />
                        <Text style={{marginLeft: 5, fontSize: 17}}>
                          {tweet?.comments?.length || 0}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => console.log('Press')}
                        style={{
                          flexDirection: 'row',
                          marginTop: 7,
                          marginLeft: 20,
                        }}>
                        <MaterialCommunityIcons
                          name="autorenew"
                          color={theme.colors.secondary}
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
                          color={theme.colors.secondary}
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
                      <TouchableOpacity
                        onPress={() => downloadImage(`http://${tweet?.imageURL}`)}
                        style={{
                          flexDirection: 'row',
                          marginTop: 7,
                          marginLeft: 20,
                        }}>
                        <MaterialCommunityIcons
                          name="download"
                          color={'gray'}
                          size={25}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <Divider />
              </View>
            ) : null}
          </View>
          {tweet &&
            tweet?.comments?.map((comment, i) => (
              <View key={i} style={styles.comment}>
                <Text style={styles.userName}>
                  {tweet?.postedBy?.name || 'Name'}
                </Text>
                <Text>{comment?.text}</Text>
              </View>
            ))}
        </ScrollView>
        <View>
          <TextInput
            style={styles.input}
            onChangeText={text => setComment(text)}
            value={comment}
            placeholder="Add a comment..."
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCommentSubmit(tweet?._id)}>
            <Text style={styles.buttonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        {'Reply send'}
      </Snackbar>
    </Layout>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: theme.colors.secondary,
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  comment: {
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
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
    color: 'black',
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  tweet: {
    fontSize: 17,
    marginVertical: 5,
  },
};
