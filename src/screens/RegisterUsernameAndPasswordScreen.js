import React from 'react';
import { StyleSheet, 
  Alert, 
  View, 
  Button } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { registerUsernameAndPassword, 
  removeUserRegistrationToken, 
  getUserRegistrationToken, 
  getUserForgottenPasswordToken, 
  removeUserForgottenPasswordToken, 
  changePassword } from '../services/AuthService';
import { errorLog } from '../utils';


export default class RegisterUsernameAndPasswordScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      username: null,
      password: null,
      passwordRepeat: null,
      token: null
    }
  }

  _cancelStepButton = () => {
    if (this.props.navigation.getParam('forgottenPassword') === true) {
      return (
        <Button style={styles.buttons} title="Cancel password recovery"
                  onPress={this._cancelPasswordRecovery}/>
      )
    }
    return (
      <Button style={styles.buttons} title="Restart registration"
                onPress={this._restartRegistration}/>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.top_container}>
          <TextInput style={styles.textfields} placeholder={'Username'} autoCompleteType='username'
            onChangeText={(text) => this.setState({username:text})} />
          <TextInput style={styles.textfields} placeholder={'Password'} autoCompleteType='password' 
              secureTextEntry={true} onChangeText={(text) => this.setState({password:text})}/>
          <TextInput style={styles.textfields} placeholder={'Repeat password'} autoCompleteType='password' 
              secureTextEntry={true} onChangeText={(text) => this.setState({passwordRepeat:text})} />
          <View style={styles.buttons}>
              <Button title={this.props.navigation.getParam('forgottenPassword') === true ? "Change password" : "Register"}
                onPress={this._registerUsernameAndPasswordAsync}/>
          </View>
          <View style={styles.buttons}>
            {this._cancelStepButton()}
          </View>
          <View style={styles.buttons}>
              <Button style={styles.buttons} title="Login" 
                  onPress={() => this.props.navigation.navigate("Login")}/>
          </View>
        </View>
      </View>
    );
  }

  componentDidMount() {
    if (this.props.navigation.getParam('forgottenPassword') === true) {
      this._checkPasswordRecoveryTokenIsSaved();
    }
    else {
      this._checkRegistrationTokenIsSaved();
    }
  }

  _checkRegistrationTokenIsSaved = () => {
    getUserRegistrationToken()
    .then(token => {
      if (token) {
        this.setState({token: token});
        return;
      }
      this.props.navigation.navigate('RegisterEmail');
    })
  }

  _checkPasswordRecoveryTokenIsSaved = () => {
    getUserForgottenPasswordToken()
    .then(token => {
      if (token) {
        this.setState({token: token});
        return;
      }
      this.props.navigation.navigate('Login');
    })
  }

  _registerUsernameAndPasswordAsync = () => {
    if (!this.state.username || !this.state.password || !this.state.passwordRepeat) {
      Alert.alert('Validation', 'Emtpy field!');
      return;
    }

    if (this.state.password !== this.state.passwordRepeat) {
      Alert.alert('Validation', 'Passwords missmatch!');
      return;
    }

    let username = this.state.username.toLowerCase().trim();
    let password = this.state.password.trim();
    let token = this.state.token;

    // Handle forgotten password
    if (this.props.navigation.getParam('forgottenPassword') === true) {
      changePassword(token, username, password)
      .then((response) => {
        if(response.statusCode === 200 && response.data) {
          this.props.navigation.navigate('Login');
          return
        }
      })
      return
    }

    // Handle registration
    registerUsernameAndPassword(token, username, password)
    .then(res => {
      const { data, statusCode } = res;
      if(statusCode === 201 && data.message) {
        console.log("Successfully registered!");
        this.props.navigation.navigate('Login');
        return;
      }
      Alert.alert('Error', 'Registration error!');
    })
    .catch(errorLog)
  };

  _restartRegistration = () => {
    removeUserRegistrationToken();
    this.props.navigation.navigate("RegisterEmail");
  }

  _cancelPasswordRecovery = () => {
    removeUserForgottenPasswordToken();
    this.props.navigation.navigate("Login");
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
  }
});
