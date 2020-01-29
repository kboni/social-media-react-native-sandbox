import React from 'react';
import { StyleSheet, 
  Alert, 
  View, 
  Button, 
  Text } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { registerEmail, 
  saveUserRegistrationEmail, 
  getUserRegistrationEmail, 
  getUserForgottenPasswordEmail, 
  saveUserForgottenPasswordEmail, 
  confirmEmail } from '../services/AuthService';


export default class RegisterEmailScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      email: null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.top_container}>
          <Text>Email:</Text>
          <TextInput style={styles.textfields} placeholder={'email'} autoCompleteType='email'
            onChangeText={(text) => this.setState({email:text})}
            keyboardType={'email-address'} />
          <View style={styles.buttons}>
              <Button title={
                this.props.navigation.getParam('forgottenPassword') === true ? "Send confirmation code" : "Send registration code" 
              }
                onPress={this._handleEmailAsync}/>
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

  _checkMailIsRegistered = () => {
    getUserForgottenPasswordEmail()
    .then(email => {
      if (email) {
        console.log('Forgotten pw mail found')
        this.props.navigation.navigate('RegistrationCode', {forgottenPassword: true});
      }
    })
  }

  _checkMailIsBeingRegistered = () => {
    getUserRegistrationEmail()
    .then(email => {
      if (email) {
        console.log('Registration mail found')
        this.props.navigation.navigate('RegistrationCode');
      }
    })
  }

  _handleEmailAsync = () => {
    if (!this.state.email) {
      Alert.alert('Validation', 'Emtpy field!');
      return;
    }

    let email = this.state.email.toLowerCase().trim();
    
    // Handle forgotten password
    if (this.props.navigation.getParam('forgottenPassword') === true) {
      confirmEmail(email)
      .then((response) => {
        if (response.statusCode === 200 && response.data) {
          saveUserForgottenPasswordEmail(email)
          this.props.navigation.navigate('RegistrationCode', {forgottenPassword: true})
          return
        }
      })
      return
    }

    // Handle registration
    registerEmail(email)
    .then(res => {
      const { data, statusCode } = res;
      if(statusCode === 201 && data.message) {
        saveUserRegistrationEmail(this.state.email);
        this.props.navigation.navigate('RegistrationCode');
        return
      }
      Alert.alert('Error', 'Registration error!');
    })
  };
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