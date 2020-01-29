import React from 'react';
import { Button,
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { getUserAccessToken,
  checkAccessToken } from '../services/AuthService';
import { errorLog } from '../utils';
import * as ImagePicker from "expo-image-picker";
import { insertPost, 
  getPost, 
  updatePost, 
  deletePost } from '../services/PostService';


export default class PostDetailsScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      mediaSource: null,
      description: {
        initial: null,
        new: null
      }
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

      // You can also display the image using data:
      // let source = { uri: 'data:image/jpeg;base64,' + response.data };

      this.setState({
        mediaSource: source
      });
    }
  }

  _newOrEditPost = () => {
    if (this.props.navigation.getParam('postId')) {
      return (
        <View>
          <View style={styles.buttons}>
            <Button title="Save changes"
                    onPress={() => this._savePost()}/>
          </View>
          <View style={styles.buttons}>
              <Button title="Delete post"
                onPress={() => this._deletePost()}/>
          </View>
        </View>
      )
    }
    return (
      <View style={styles.buttons}>
        <Button title="Save post"
                onPress={() => this._savePost()}/>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.top_container}>
          <TextInput style={styles.textfields} placeholder={'Description'}
            onChangeText={(text) => this.setState({description:{new: text}})} value={this.state.description['new']} />
          <TouchableOpacity onPress={this._pickImage}>
            <View
                style={[styles.post, styles.postContainer, {marginBottom: 20}]}>
                {this.state.mediaSource === null ? (
                <Text>Select a picture</Text>
                ) : (
                <Image style={styles.post} source={this.state.mediaSource} />
                )}
            </View>
          </TouchableOpacity>

          {this._newOrEditPost()}
          
          <View style={styles.buttons}>
              <Button style={styles.buttons} title="Back" 
                  onPress={() => this.props.navigation.navigate("PostList")}/>
          </View>
        </View>
      </View>
    );
  }

  componentDidMount() {
    this._populatePost();
  }

  _populatePost = () => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      let postId = this.props.navigation.getParam('postId')
      if (postId) {
        let postPath = '/' + postId
        getPost(accessToken, postPath)
        .then((response) => {
          if(response.statusCode === 200 && response.data){
            let post = response.data['post'];
            this.setState({
              description: {
                initial: post['description'],
                new: post['description']
              },
              mediaSource: { uri: post['resource'] },
            })
          }
        })
      }
    })
    .catch(errorLog)
  }

  _savePost = () => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      if (!this.state.description['new'] || !this.state.mediaSource) {
        throw('Missing field')
      }
      let bodyFormData = new FormData()
      if (this.state.description['initial'] === this.state.description['new']
        && this.state.mediaSource['uri'].startsWith('http')) {
          throw 'Nothing to change'
      }
      else {
        

        if (this.state.description['initial'] !== this.state.description['new']) {
          let description = this.state.description['new']
          bodyFormData.append('description', description)
        }
        
        if (!this.state.mediaSource['uri'] || !this.state.mediaSource['uri'].startsWith('http')) {
          let mediaSource = this.state.mediaSource
          mediaSource.name = this.state.newName + '.jpg'
          bodyFormData.append('file', mediaSource)
        }
      }

      let postId = this.props.navigation.getParam('postId')
      if (postId) {
        let postPath = '/' + postId
        return updatePost(accessToken, postPath, bodyFormData)
      }

      return insertPost(accessToken, bodyFormData)
    })
    .then((response) => {
      if((response.statusCode === 201 || response.statusCode === 200) && response.data){
        this.props.navigation.navigate("PostList", {needsRefresh: true})
        }
        else {
          throw 'Password change else error:' 
          + '\nStatusCode: ' + response.statusCode 
          + '\nData: ' + JSON.stringify(response.data)
        }
      })
    .catch(errorLog)
  }

  _deletePost = () => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      let postId = this.props.navigation.getParam('postId')

      if (postId) {
        let postPath = '/' + postId
        return deletePost(accessToken, postPath)
      }
    })
    .then((response) => {
      if(response.statusCode == 200 && response.data) {  
        this.props.navigation.navigate("PostList", {needsRefresh: true})
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
  postContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  post: {
    width: 150,
    height: 150,
  },
});
