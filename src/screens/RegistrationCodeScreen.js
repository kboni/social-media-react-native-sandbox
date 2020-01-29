import React from 'react';
import { StyleSheet, 
  Alert, 
  View, 
  Button, 
  Text } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { getUserRegistrationEmail, 
  removeUserRegistrationEmail, 
  saveUserRegistrationToken, 
  checkRegistrationCode, 
  getUserForgottenPasswordEmail, 
  checkConfirmationCode, 
  saveUserForgottenPasswordToken, 
  removeUserForgottenPasswordEmail } from '../services/AuthService';


export default class RegistrationCodeScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      confirmationCode: null,
      email: null
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
          <Text>{this.props.navigation.getParam('forgottenPassword') === true ? "Confirmation code" : "Registration code" }</Text>
          <TextInput style={styles.textfields} placeholder={'123456'}
            onChangeText={(text) => this.setState({confirmationCode:text})}
            keyboardType = {'numeric'} />
          <View style={styles.buttons}>
              <Button title="Continue"
                onPress={this._checkRegistrationCodeAsync}/>
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
      this._checkMailIsRegistered();
    }
    else {
      this._checkMailIsBeingRegistered();
    }
  }

  _checkMailIsBeingRegistered = () => {
    getUserRegistrationEmail()
    .then(email => {
      if (email) {
        this.setState({email: email});
        return;
      }
      this.props.navigation.navigate('RegisterEmail');
    })
  }

  _checkMailIsRegistered = () => {
    getUserForgottenPasswordEmail()
    .then(email => {
      if (email) {
        this.setState({email: email});
        return;
      }
      this.props.navigation.navigate('RegisterEmail', {forgottenPassword: true});
    })
  }

  _checkRegistrationCodeAsync = () => {
    if (!this.state.confirmationCode) {
      Alert.alert('Validation', 'Emtpy field!');
      return;
    }

    let email = this.state.email.toLowerCase().trim();
    let confirmationCode = this.state.confirmationCode.trim();

    // Handle forgotten password
    if (this.props.navigation.getParam('forgottenPassword') === true) {
      checkConfirmationCode(email, confirmationCode)
      .then((response) => {
        if(response.statusCode === 200 && response.data.token) {
          saveUserForgottenPasswordToken(response.data.token)
          removeUserForgottenPasswordEmail()
          this.props.navigation.navigate('RegisterUsernameAndPassword', {forgottenPassword: true});
          return
        }
      })
      return
    }

    // Handle registration
    checkRegistrationCode(email, confirmationCode)
    .then(res => {
      const { data, statusCode } = res;
      if(statusCode === 200 && data.token) {
        saveUserRegistrationToken(data.token);
        removeUserRegistrationEmail();
        this.props.navigation.navigate('RegisterUsernameAndPassword');
        return;
      }
      Alert.alert('Error', 'Registration error!');
    })
  }

  _restartRegistration = () => {
    removeUserRegistrationEmail();
    this.props.navigation.navigate("RegisterEmail");
  }

  _cancelPasswordRecovery = () => {
    removeUserForgottenPasswordEmail();
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