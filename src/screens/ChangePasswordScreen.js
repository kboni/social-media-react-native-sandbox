import React from 'react';
import { StyleSheet, 
  Alert, 
  View, 
  Button } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { setUsersData } from '../services/UserService';
import { getUserAccessToken, 
  removeUserAccessToken, 
  removeUserRefreshToken,
  checkAccessToken } from '../services/AuthService';
import { errorLog } from '../utils';


export default class RegisterUsernameAndPasswordScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      oldPassword: null,
      newPassword: null,
      newPasswordRepeat: null,
      accessToken: null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <TextInput style={styles.textfields} placeholder={'Old password'} autoCompleteType='password'
            secureTextEntry={true} onChangeText={(text) => this.setState({oldPassword:text})} />
          <TextInput style={styles.textfields} placeholder={'New password'} autoCompleteType='password' 
            secureTextEntry={true} onChangeText={(text) => this.setState({newPassword:text})}/>
          <TextInput style={styles.textfields} placeholder={'Repeat new password'} autoCompleteType='password' 
            secureTextEntry={true} onChangeText={(text) => this.setState({newPasswordRepeat:text})} />
          <View style={styles.buttons}>
              <Button title="Save changes"
                onPress={this._changePasswordAsync}/>
          </View>
          <View style={styles.buttons}>
              <Button style={styles.buttons} title="Back" 
                  onPress={() => this.props.navigation.navigate("EditProfile")}/>
          </View>
        </View>
      </View>
    );
  }

  _changePasswordAsync = () => {
    if (!this.state.oldPassword || !this.state.newPassword || !this.state.newPasswordRepeat) {
      Alert.alert('Validation', 'Emtpy field!');
      return;
    }

    if (this.state.newPassword !== this.state.newPasswordRepeat) {
      Alert.alert('Validation', 'Passwords missmatch!');
      return;
    }

    let oldPassword = this.state.oldPassword.trim();
    let newPassword = this.state.newPassword.trim();
    let newPasswordRepeat = this.state.newPasswordRepeat.trim();

    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      let bodyData = {
        old_password: this.state.oldPassword,
        new_password: this.state.newPassword,
      }
      return setUsersData(accessToken, bodyData)
    })
    .then((response) => {
      if(response.statusCode === 200 && response.data){
        removeUserAccessToken()
        .then(() => removeUserRefreshToken())
        .then(() => this.props.navigation.navigate('Auth'))
        }
        else {
          throw 'Password change else error:' 
          + '\nStatusCode: ' + response.statusCode 
          + '\nData: ' + JSON.stringify(response.data)
        }
      })
    .catch(errorLog)
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignContent: 'center',
  },
  topContainer: {
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
  }
});
