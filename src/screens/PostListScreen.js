import React from 'react';
import { StyleSheet, 
  Text, 
  View, 
  Button, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  TextInput } from 'react-native';
import { getUserAccessToken, 
  removeUserAccessToken, 
  removeUserRefreshToken,
  checkAccessToken } from '../services/AuthService';
import { errorLog } from '../utils';
import { getPost, 
  insertComment, 
  insertSubComment, 
  deletePost } from '../services/PostService';
import { getUsersData } from '../services/UserService';


export default class PostListScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      posts: [],
      loggedInUsername: null,
      currentPostsShowingUsername: null,
    }
  }

  _showEditPostElement = (isEditAllowed, postId) => {
    if (isEditAllowed) {
      return <Button title="Edit post"
        onPress={() => this.props.navigation.navigate("PostDetails", {postId: postId})}/>
    }
  }

  _showDeleteComment = (isEditAllowed, commentId, commentIndex, postIndex) => {
    if (isEditAllowed) {
      return (
        <TouchableOpacity style={styles.deleteCommentButton}
          onPress={() => this._deleteComment(commentId, commentIndex, postIndex)} >
          <Text>X</Text>
        </TouchableOpacity>
      )
    }
  }

  _showDeleteSubComment = (isEditAllowed, subCommentId, subCommentIndex, commentIndex, postIndex) => {
    if (isEditAllowed) {
      return (
        <TouchableOpacity style={styles.deleteSubCommentButton}
          onPress={() => this._deleteSubComment(subCommentId, subCommentIndex, commentIndex, postIndex)} >
          <Text>X</Text>
        </TouchableOpacity>
      )
    }
  }

  _showingPostsOf = (username) => {
    if (username) {
      return (
        <View>
          <Text style={styles.logged_in}>Showing posts of user: {username}</Text>
          <TouchableOpacity onPress={() => this._getAllPosts()}>
            <Text style={styles.logged_in}>Show all posts</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <Text style={styles.logged_in}>Showing all posts</Text>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.titleContainer}> 
            <TouchableOpacity onPress={() => this.props.navigation.navigate("PostDetails")}>
              <View>
              <Text style={styles.title}>New post</Text>
              </View>  
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Text style={styles.search}>Search</Text>
          </View>
        </View>
        <View style={styles.logged_in}>
          <Text>Logged in as:</Text>
          <TouchableOpacity onPress={() => this._getPostsOfUser(this.state.loggedInUsername)}>
            <View>
              <Text>{this.state.loggedInUsername}</Text>
            </View>  
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('EditProfile')}>
            <View>
              <Text>(Edit profile)</Text>
            </View>  
          </TouchableOpacity>
        </View>
        <Button title="Logout"
            onPress={this._logOutAsync}/>
        { this._showingPostsOf(this.state.currentPostsShowingUsername) }
        <ScrollView keyboardShouldPersistTaps={'handled'}>
          {
            this.state.posts.map((post, postIndex) => {
              return (
                <View key={ postIndex } style={ styles.post_details }>
                  <TouchableOpacity onPress={() => this._getPostsOfUser(post["user"]["username"])}>
                    <Text style={ styles.logged_in }>User: { post["user"]["username"] }</Text>
                  </TouchableOpacity>
                  <Text>{ post["created"] }</Text>
                  <Image style={styles.post_media} source={{uri: post["resource"]}} />
                  <Text>Description:</Text>
                  <Text>{ post["description"] }</Text>
                  { this._showEditPostElement(post['edit_allowed'], post["id"]) }
                  
                  {/* COMMENTS SECTION */}
                  <Text>Comments:</Text>
                  <View style={ styles.newCommentContainer }>
                    <TextInput ref={'newCommentOnPostId_' + post["id"]} 
                      style={styles.new_comment} placeholder={'New comment'} multiline={true} />
                    <TouchableOpacity style={styles.add_comment_button}
                      onPress={() => this._addNewComment(post["id"], postIndex)}>
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                  { Array.isArray(post["comments"]) &&
                    post["comments"].map((comment, commentIndex) => {
                      return (
                        <View key={ commentIndex } style={ styles.comments }>
                          <Text>({ comment['username'] })</Text>
                          <View style={styles.commentContainer}>
                            <Text style={styles.commentText}>{ comment['text'] }</Text>
                            { this._showDeleteComment(comment['edit_allowed'], comment['id'], commentIndex, postIndex) }
                           
                          </View>
                          
                          {/* SUBCOMMENTS SECTION */}
                          <View style={ styles.new_subcomment_container }>
                            <TextInput ref={'newSubCommentOnCommentId_' + comment["id"]} 
                              style={styles.new_subcomment} placeholder={'New sub-comment'} multiline={true} />
                            <TouchableOpacity style={styles.add_subcomment_button}
                              onPress={() => this._addNewSubComment(postIndex, comment['id'], commentIndex)}>
                              <Text>+</Text>
                            </TouchableOpacity>
                          </View>
                          { Array.isArray(comment["subcomments"]) &&
                              comment["subcomments"].map((subComment, subCommentIndex) => {
                              return (
                                <View key={ subCommentIndex } style={ styles.subcomment }>
                                  <Text>({ subComment['username'] })</Text>
                                  <View style={styles.subCommentContainer}>
                                    <Text style={styles.subCommentText}>{ subComment['text'] }</Text>
                                    { this._showDeleteSubComment(subComment['edit_allowed'], subComment['id'], subCommentIndex, commentIndex, postIndex) }
                                  </View>
                                </View>
                              )
                            })
                          }
                        </View>
                      )
                    })
                  }
                </View>
              )
            })
          }
        </ScrollView>
        
      </View>
    );
  }

  componentDidMount() {
    this._getAllPosts();

    /**
     * Getting all the posts again after editing
     */
    willFocus = this.props.navigation.addListener(
      'willFocus',
      payload => {
        let needsRefresh = this.props.navigation.getParam('needsRefresh')
        if(needsRefresh === true) {
          this._getAllPosts();
        } 
      }
    );
  }
  

  _getAllPosts = () => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }

      let postsPath = '/all'
      
      let getUserDataPromise = getUsersData(accessToken)
      let getPostsPromise = getPost(accessToken, postsPath)
      
      Promise.all([getUserDataPromise, getPostsPromise])
      .then(([userDataResponse, postsResponse]) => {
        if (userDataResponse.statusCode === 200 && userDataResponse.data['user']) {
          this.setState({
            loggedInUsername: userDataResponse.data['user']['username']
          })
        }
        this.setState({
          currentPostsShowingUsername: null
        })
        this._updatePostList(postsResponse)

      })
    })
    .catch(errorLog)
  };

  _getPostsOfUser = (username) => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      if (username) {
        this.setState({
          currentPostsShowingUsername: username
        })
        let postsPath = '/user/username/' + username
        return getPost(accessToken, postsPath)
      }
    })
    .then((response) => this._updatePostList(response))
    .catch(errorLog)
  }; 

  _updatePostList = (response) => {
      if(response.statusCode === 200 && response.data){
        this.setState({
          posts: response.data['post']
        })
        }
        else {
          throw 'Password change else error:' 
          + '\nStatusCode: ' + response.statusCode 
          + '\nData: ' + JSON.stringify(response.data)
        }
      }

  _logOutAsync = () => {
    removeUserAccessToken()
    .then(() => removeUserRefreshToken())
    .then(() => this.props.navigation.navigate('Auth'))
    .catch(error => errorLog(error))
  };

  _addNewComment = (postId, postIndex) => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      let commentText = this.refs['newCommentOnPostId_' + postId]._lastNativeText

      if (!commentText) {
        throw('Empty comment')
      }

      let urlPath = '/' + postId + '/comment'

      let bodyFormData = new FormData()
      bodyFormData.append('text', commentText)

      return insertComment(accessToken, urlPath, bodyFormData)
    })
    .then((response) => {
      if((response.statusCode === 201) && response.data.comment){
        
        let newComment = response.data.comment
        let editedPost = this.state.posts[postIndex]

        editedPost['comments'] = [newComment, ...editedPost['comments']]

        this._deepStateUpdate(postIndex, editedPost)
        this.refs['newCommentOnPostId_' + postId].setNativeProps({text: ''})
      }
      else {
        throw 'Password change else error:' 
        + '\nStatusCode: ' + response.statusCode 
        + '\nData: ' + JSON.stringify(response.data)
      }
    })
    .catch(errorLog)
  }

  _addNewSubComment = (postIndex, commentId, commentIndex) => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      let subCommentText = this.refs['newSubCommentOnCommentId_' + commentId]._lastNativeText

      if (!subCommentText) {
        throw('Empty subcomment')
      }

      let urlPath = '/comment/' + commentId + '/subcomment'

      let bodyFormData = new FormData()
      bodyFormData.append('text', subCommentText)

      return insertSubComment(accessToken, urlPath, bodyFormData)
    })
    .then((response) => {
      if((response.statusCode === 201) && response.data.subcomment){
        let newSubComment = response.data.subcomment
        let editedPost = this.state.posts[postIndex]

        editedPost['comments'][commentIndex]['subcomments'] = [newSubComment, ...editedPost['comments'][commentIndex]['subcomments']]

        this._deepStateUpdate(postIndex, editedPost)
        this.refs['newSubCommentOnCommentId_' + commentId].setNativeProps({text: ''})
      }
      else {
        throw 'Password change else error:' 
        + '\nStatusCode: ' + response.statusCode 
        + '\nData: ' + JSON.stringify(response.data)
      }
    })
    .catch(errorLog)
  }

  _deleteComment = (commentId, commentIndex, postIndex) => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      let deleteCommentPath = '/comment/' + commentId
      return deletePost(accessToken, deleteCommentPath)
    })
    .then((response) => {
      if((response.statusCode === 200) && response.data){
        let editedPost = this.state.posts[postIndex]
        editedPost['comments'].splice(commentIndex, 1)
        
        this._deepStateUpdate(postIndex, editedPost)
      }
      else {
        throw 'Password change else error:' 
        + '\nStatusCode: ' + response.statusCode 
        + '\nData: ' + JSON.stringify(response.data)
      }
    })
    .catch(errorLog)
  }

  _deleteSubComment = (subCommentId, subCommentIndex, commentIndex, postIndex) => {
    getUserAccessToken()
    .then(checkAccessToken)
    .then((accessToken) => {
      if(!accessToken) {
        this.props.navigation.navigate('Auth')
      }
      let deleteSubCommentPath = '/comment/subcomment/' + subCommentId
      return deletePost(accessToken, deleteSubCommentPath)
    })
    .then((response) => {
      if((response.statusCode === 200) && response.data){
        let editedPost = this.state.posts[postIndex]
        editedPost['comments'][commentIndex]['subcomments'].splice(subCommentIndex, 1)
        
        this._deepStateUpdate(postIndex, editedPost)
        }
        else {
          throw 'Password change else error:' 
          + '\nStatusCode: ' + response.statusCode 
          + '\nData: ' + JSON.stringify(response.data)
        }
      })
    .catch(errorLog)
  }

  _deepStateUpdate = (postIndex, editedPost) => {
    this.setState({
      posts: [
        ...this.state.posts.slice(0, postIndex),
        editedPost,
        ...this.state.posts.slice(postIndex + 1, this.state.posts.length)
      ]
    })
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555',
  },
  topContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  titleContainer: {
    width: '60%',
    justifyContent: 'flex-start'
  },
  title: {
    color: '#fff',
  },
  searchContainer: {
    width: '40%',
    justifyContent: 'flex-start'
  },
  search: {
    color: '#fff',
  },
  logged_in: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  commentContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  commentText: {
    width: '90%'
  },
  deleteCommentButton: {
    flex: 1,
    textAlignVertical: "center",
    borderWidth: 1,
    width: '10%'
  },
  newCommentContainer: {
    flexDirection: 'row',
  },
  new_comment: {
    borderWidth: 1,
    width: '90%'
  },
  add_comment_button: {
    borderWidth: 1,
    width: '10%'
  },
  subCommentContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  subCommentText: {
    width: '90%'
  },
  deleteSubCommentButton: {
    flex: 1,
    textAlignVertical: "center",
    borderWidth: 1,
    width: '10%'
  },
  new_subcomment_container: {
    flexDirection: 'row',
    marginLeft: 20
  },
  subcomment: {
    marginLeft: 20
  },
  new_subcomment: {
    borderWidth: 1,
    width: '90%'
  },
  add_subcomment_button: {
    borderWidth: 1,
    width: '10%'
  },
  post_details: {
    backgroundColor: "grey",
    marginHorizontal: 25,
    marginTop: 10,

  },
  post_media: {
    width: 150,
    height: 150
  }
});