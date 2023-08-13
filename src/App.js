import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import './App.css';
import Logo from './components/Logo/Logo';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import ParticlesBg from 'particles-bg';
// import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
//  const app = new Clarifai.App({
//     apiKey: '045b85ffb95e4fac866439aaf842f5e2'
//   });
const returnClarifaiRequestOptions = (imageUrl) => {
const PAT = '946a532eefcb49cda8d49f93cd972236';
const USER_ID = 'acorey81';       
const APP_ID = 'smartBrain';
const MODEL_ID = 'face-detection';    
const IMAGE_URL = imageUrl;

const raw = JSON.stringify({
  "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID
  },
  "inputs": [
      {
          "data": {
              "image": {
                  "url": IMAGE_URL
              }
          }
      }
  ]
});

const requestOptions = {
 method: 'POST',
 headers: {
    'Accept': 'application/json',
    'Authorization': `Key ${PAT}`
 },
 body: raw
};
return requestOptions
}

const initialState = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
  }})
  }

       calculateFaceLocation = (data) => {
       const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
       const image = document.getElementById('inputimage');
       const width = Number(image.width);
       const height = Number(image.height);
       return {
         leftCol: clarifaiFace.left_col * width,
         topRow: clarifaiFace.top_row * height,
         rightCol: width - (clarifaiFace.right_col * width),
         bottomRow: height - (clarifaiFace.bottom_row * height)
        };
      }

       displayFaceBox = (box) => {
        this.setState({box: box});
       };

  onInputChange = (event)  => {
     this.setState({input: event.target.value});
  };
 
  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
  fetch(`https://api.clarifai.com/v2/models/face-detection/outputs`, returnClarifaiRequestOptions(this.state.input))
  .then(response => response.json()) 
       .then(response => {
           if (response) {
            fetch('https://evening-spire-01506-01f8f28ec7e1.herokuapp.com/image', {
             method: 'put',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({id: this.state.user.id})
           })
             .then(response => response.json())
             .then(count => {
               this.setState(Object.assign(this.state.user, { entries: count }));
              })
              .catch(console.log)
            }
         this.displayFaceBox(this.calculateFaceLocation(response)); 
      })
       .catch(err => console.log(err));
  }

      onRouteChange = (route) => {
        if (route === 'signout') {
          this.setState(initialState)
        } else if (route === 'home') {
          this.setState({isSignedIn: true})
        }
         this.setState({route: route});
      }

      render() {
         const { isSignedIn, imageUrl, route, box } = this.state;
        return (
         <div className="App">
          <ParticlesBg color="#ffD700" type="cobweb" num={150} bg={true} 
          />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
          { route === 'home'
           ? <div> 
              <Logo />
              <Rank
                name={this.state.user.name}
                entries={this.state.user.entries}
                />
           <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}
         />
           <FaceRecognition box={box} imageUrl={imageUrl} />
           </div>
         : (
          route === 'signin'
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )  
          }
        </div>
      );
    }
  }
      
export default App;
