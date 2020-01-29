import React from 'react';
import { StyleSheet, 
  ScrollView, 
  View, 
  Button, 
  TouchableOpacity, 
  PixelRatio, 
  Image, 
  Text } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { getUsersData, 
  updateUsersData, 
  deleteUsersData } from '../services/UserService';
import { getUserAccessToken,
  checkAccessToken } from '../services/AuthService';
import { errorLog } from '../utils';
import * as ImagePicker from "expo-image-picker";


export default class EditProfileScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      username: {
        initial: null,
        new: null
      },
      firstName: {
        initial: null,
        new: null
      },
      lastName: {
        initial: null,
        new: null
      },
      birthDay: {
        initial: null,
        new: null
      },
      profileImage: {
        initial: null,
        new: null
      },
      profilePicture: null
    }

    this._pickImage = this._pickImage.bind(this);
  }

  async _pickImage() {
    let response = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    })
    if (response.cancelled) {
      console.log('User cancelled photo picker');
    } else {
      let source = {uri: response.uri, type: 'image/jpeg'};

      this.setState({
        profilePicture: source
      });
    }
  }

  render() {
    return (
      
        <View style={styles.container}>
          <ScrollView keyboardShouldPersistTaps={'handled'}>
          <View style={styles.top_container}>
            <TextInput style={styles.textfields} placeholder={'Username'} autoCompleteType='username'
              onChangeText={(text) => this.setState({username:{new: text}})} value={this.state.username['new']} />
            <TextInput style={styles.textfields} placeholder={'First name'} autoCompleteType='name'
              onChangeText={(text) => this.setState({firstName:{new: text}})} value={this.state.firstName['new']} />
            <TextInput style={styles.textfields} placeholder={'Last name'} autoCompleteType='name'
              onChangeText={(text) => this.setState({lastName:{new: text}})} value={this.state.lastName['new']} />
            <TextInput style={styles.textfields} placeholder={'Date of birth'} autoCompleteType='name'
              onChangeText={(text) => this.setState({birthDay:{new: text}})} value={this.state.birthDay['new']} />
            <TouchableOpacity onPress={this._pickImage}>
              <View
                  style={[styles.avatarContainer, {marginBottom: 20}]}>
                  {!this.state.profilePicture ? (
                  <Text>Select a Photo</Text>
                  ) : (
                  <Image style={styles.avatar} source={this.state.profilePicture} />
                  )}
              </View>
            </TouchableOpacity>
            <View style={styles.buttons}>
                <Button title="Save changes"
                  onPress={this._updateUserData}/>
            </View>
            <View style={styles.buttons}>
                <Button style={styles.buttons} title="Change Password" 
                    onPress={() => this.props.navigation.navigate('ChangePassword')}/>
            </View>
            <View style={styles.buttons}>
                <Button style={styles.buttons} title="Delete account" 
                    onPress={this._deleteUserData}/>
            </View>
            <View style={styles.buttons}>
                <Button style={styles.buttons} title="Back" 
                    onPress={() => this.props.navigation.navigate('PostList')}/>
            </View>
          </View>
          </ScrollView>
        </View>
      
    );
  }

  componentDidMount() {
    this._populateUserData();
  }

  _populateUserData = () => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
        return
      }
      return getUsersData(accessToken)
    })
    .then((userDataResponse) => {
      if(userDataResponse.statusCode === 200 && userDataResponse.data.user){
        let data = userDataResponse.data.user;
        this.setState({
          username: {
            initial: data['username'],
            new: data['username']
          },
          firstName: {
            initial: data['first_name'],
            new: data['first_name']
          },
          lastName: {
            initial: data['last_name'],
            new: data['last_name']
          },
          birthDay: {
            initial: data['birthday'],
            new: data['birthday']
          },
          profilePicture: { uri: data['profile_image'] },
        })
      }
    })
    .catch(errorLog)
  }

  _updateUserData = () => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      if (this.state.username['initial'] === this.state.username['new']
        && this.state.firstName['initial'] === this.state.firstName['new']
        && this.state.lastName['initial'] === this.state.lastName['new']
        && this.state.birthDay['initial'] === this.state.birthDay['new']
        && this.state.profilePicture['uri'].startsWith('http')) {
          throw 'Nothing to change'
      }
      else {
        let bodyFormData = new FormData()

        if (this.state.username['initial'] !== this.state.username['new']) {
          let username = this.state.username['new']
          bodyFormData.append('username', username)
        }
        
        if (this.state.firstName['initial'] !== this.state.firstName['new']) {
          let firstName = this.state.firstName['new']
          bodyFormData.append('first_name', firstName)
        }

        if (this.state.lastName['initial'] !== this.state.lastName['new']) {
          let lastName = this.state.lastName['new']
          bodyFormData.append('last_name', lastName)
        }

        if (this.state.birthDay['initial'] !== this.state.birthDay['new']) {
          let dateOfBirth = this.state.birthDay['new']
          bodyFormData.append('birthday', dateOfBirth)
        }
        
        if (!this.state.profilePicture['uri'].startsWith('http')) {
          profilePicture = this.state.profilePicture
          profilePicture.name = this.state.username['new'] + '.jpg'
          bodyFormData.append('file', profilePicture)
        }
        return updateUsersData(accessToken, bodyFormData)
      }
    })
    .then((response) => {
      if(response.statusCode == 200 && response.data) {  
        this.props.navigation.navigate("PostList")
      }
    })
    .catch(errorLog)
  }

  _deleteUserData = () => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      return deleteUsersData(accessToken)
    })
    .then((response) => {
      if(response.statusCode == 200 && response.data) {  
        this.props.navigation.navigate("Login")
      }
    })
    .catch(errorLog)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignContent: 'center',
  },
  top_container: {
    justifyContent: 'center',
  },
  textfields: {
    borderColor: '#FFF',
    borderWidth: 2,
    alignSelf: 'center',
    width: '80%',
    marginBottom: 15
  },
  buttons: {
    margin: 30
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 75,
    width: 150,
    height: 150,
  },
});
