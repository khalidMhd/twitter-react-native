import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Snackbar, Text} from 'react-native-paper';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import {theme} from '../core/theme';
import {emailValidator} from '../helpers/emailValidator';
import {passwordValidator} from '../helpers/passwordValidator';
import {nameValidator, nameValidatorUpd} from '../helpers/nameValidator';
import Paragraph from '../components/Paragraph';
import axios from 'axios';
import {baseURL} from '../APIs/instance';
import Layout from '../components/layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { numberValidator } from '../helpers/numberValidator';
import { bioValidator } from '../helpers/bioValidator';

export default function UpdateProfile({route}) {
  const userId = route.params.userId;
  const userToken = route.params.token;
  const [userList, setUserList] = React.useState([]);
  const [token, setToken] = React.useState('');
  const [userInfo, setUserInfo] = React.useState('');

  const [name, setName] = useState({value: '', error: ''});
  const [cellNo, setCellNo] = useState({value: '', error: ''});
  const [address, setAddress] = useState({value: '', error: ''});
  const [location, setLocation] = useState({value: '', error: ''});
  const [education, setEducation] = useState({value: '', error: ''});
  const [bio, setBio] = useState({value: '', error: ''});

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState();
  const [items, setItems] = useState([
    {label: 'N/A', value: 'N/A'},
    {label: 'Abbottabad', value: 'Abbottabad'},
    {label: 'Faisalabad', value: 'Faisalabad'},
    {label: 'Islamabad', value: 'Islamabad'},
    {label: 'Peshawar', value: 'Peshawar'},
    {label: 'Rawalpindi', value: 'Rawalpindi'},
  ]);

  const [openEducation, setOpenEducation] = useState(false);
  const [educationValue, setEducationValue] = useState();
  const [educationList, setEducationList] = useState([
    {label: 'N/A', value: 'N/A'},
    {label: 'Matriculation/ O-level', value: 'Matriculation/ O-level'},
    {label: 'Intermediate/ A-level', value: 'Intermediate/ A-level'},
    {label: 'Bachelor Degree', value: 'Bachelor Degree'},
    {label: 'Master Degree', value: 'Master Degree'},
    {label: 'M-Phil Degree', value: 'M-Phil Degree'},
    {label: 'Doctorate Degree', value: 'Doctorate Degree'},
    {label: 'PHD', value: 'PHD'},
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const [visible, setVisible] = React.useState(false);
  const onDismissSnackBar = () => setVisible(false);

  const getUser = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/profile/${userId}`, {
        headers: {
          Accept: 'application/json',
          Authorization: userToken,
        },
      });
      if (res.status === 200 || res.status === 201) {
        setUserList(res.data.user);
        const userRes = await res.data.user;
        setName({value: userRes?.name, error: ''});
        setCellNo({value: userRes?.cellNo, error: ''});
        setAddress({value: userRes?.address, error: ''});
        setValue(userRes?.location)
        setEducationValue(userRes?.education);
        setBio({value: userRes?.bio, error: ''});
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  React.useEffect(() => {
    setLoading(true);
    AsyncStorage.getItem('userInfo').then(res => {
      if (res) {
        const user = JSON.parse(res);
        setToken(user.token);
        setUserInfo(user.user);
        getUser();
        return;
      }
    });
  }, [token]);

  const updateHandler = async () => {
    const nameError = nameValidatorUpd(name.value);
    const cellNoError = numberValidator(cellNo.value);
    const bioError = bioValidator(bio.value);
    const addressError = bioValidator(address.value);
    if (nameError || cellNoError || bioError || addressError) {
      setName({...name, error: nameError});
      setCellNo({...cellNo, error: cellNoError});
      setBio({...bio, error: bioError});
      setAddress({...address, error: addressError});
      return;
    }
    try {
      setLoading(true);
      setError(false);
      setSuccess(false);
      const res = await axios.post(
        `${baseURL}/api/change-profile`,
        {
          name: name.value,
          cellNo: cellNo.value,
          address: address.value,
          location: value,
          education: educationValue,
          bio: bio.value,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: token,
          },
        },
      );

      if (res && res.status === 200) {
        if (res.data?.token) {
          setSuccess(true);
        }
        setLoading(false);
        setMessage(res?.data?.message);
        setError(true);
        setVisible(true);
      }
    } catch (error) {
      setMessage('Unable to process!');
      setError(true);
      setLoading(false);
      throw error;
    }
  };

  return (
    <Background>
      <>
        <TextInput
          label="Name"
          returnKeyType="next"
          value={name.value}
          onChangeText={text => setName({value: text, error: ''})}
          error={!!name.error}
          errorText={name.error}
        />

        <TextInput
          label="Cell No"
          returnKeyType="next"
          keyboardType = 'numeric'
          value={cellNo.value}
          onChangeText={text => setCellNo({value: text, error: ''})}
          error={!!cellNo.error}
          errorText={cellNo.error}
      
        />

        <TextInput
          label="Address"
          returnKeyType="next"
          value={address.value}
          onChangeText={text => setAddress({value: text, error: ''})}
          error={!!address.error}
          errorText={address.error}
        />

        {/* <TextInput
          label="Location"
          returnKeyType="next"
          value={location.value}
          onChangeText={text => setLocation({value: text, error: ''})}
        /> */}

        <View
          style={{
            // flex: 1,
            // alignItems: 'center',
            // justifyContent: 'center',
            zIndex: 10
          }}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            multiple={false}
            placeholder='Select City'
          />
        </View>
        <View
          style={{
            // flex: 1,
            // alignItems: 'center',
            // justifyContent: 'center',
            marginTop: 10,
            zIndex: 1
          }}>
          <DropDownPicker
            open={openEducation}
            value={educationValue}
            items={educationList}
            setOpen={setOpenEducation}
            setValue={setEducationValue}
            setItems={setEducationList}
            multiple={false}
            placeholder='Select Education'
          />
        </View>

        {/* <TextInput
          label="Education"
          returnKeyType="next"
          value={education.value}
          onChangeText={text => setEducation({value: text, error: ''})}
        /> */}

        <TextInput
          label="Bio"
          returnKeyType="next"
          value={bio.value}
          onChangeText={text => setBio({value: text, error: ''})}
          error={!!bio.error}
          errorText={bio.error}
        />

        <Button
          mode="contained"
          onPress={updateHandler}
          style={{marginTop: 24}}>
          Update
        </Button>
      </>
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
        {message + ' successfully'}
      </Snackbar>
      {/* )} */}
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    // marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  error: {
    fontSize: 16,
    color: theme.colors.error,
  },
  success: {
    fontSize: 16,
    color: theme.colors.success,
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
