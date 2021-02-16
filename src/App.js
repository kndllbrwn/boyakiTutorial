import React, {useState, useEffect} from 'react';
import './App.css';

// import { withAuthenticator } from '@aws-amplify/ui-react';

import {
  HashRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

import AllPosts from './containers/AllPosts';
import PostsBySpecifiedUser from './containers/PostsBySpecifiedUser';

// import Amplify from 'aws-amplify';
// import PubSub from '@aws-amplify/pubsub'
// import awsmobile from './aws-exports';

// Amplify.configure(awsmobile);
// PubSub.configure(awsmobile)

import {Auth, Hub } from "aws-amplify"
console.log(Auth);
const initialFormState = {
  username: "", password: "", email: "", authCode: "", formType: "signUp"
}

const drawerWidth = 240;

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#1EA1F2',
      contrastText: "#fff",
    },
    background: {
      default: '#15202B',
      paper: '#15202B',
    },
    divider: '#37444C',
  },
  overrides: {
    MuiButton: {
      color: 'white',
    },
  },
  typography: {
    fontFamily: [
      'Arial', 
    ].join(','),
  },
  status: {
    danger: 'orange',
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    width: 800,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  appBar: {
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
}));

function App() {
  const classes = useStyles();
  const [formState, updateFormState] = useState(initialFormState)
  const [user, updateUser] = useState(null)
  async function checkUser(){
    try {
      debugger;
      const user = await Auth.currentAuthenticatedUser()
      updateUser(user)
      updateFormState(() => ({...formState, formType: "signedIn"}))
      console.log(user)
    } catch {
      updateUser(null)
    }
  }
  async function setAuthListener(){
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signIn':
            console.log('user signed in');
            updateUser(data.username)
            break;
        case 'signOut':
          console.log(("data from event: ", data))
          updateFormState(() => ({...formState, formType: "signUp"}))
            break;
        default:
          break
    }});
    
  }
  useEffect(() => {
    checkUser()
    setAuthListener()
  }, [])
  function onChange(e){
    e.persist()
    updateFormState(() => ({...formState, [e.target.name]: e.target.value}))
  }
  const {formType} = formState
  async function signUp() {
    const {username, email, password } = formState
    await Auth.signUp({username, password, attributes: {email}})
    updateFormState(() => ({...formState, formType: "confirmSignUp"}))
  }
  async function confirmSignUp() {
    const {username, authCode} = formState
    await Auth.confirmSignUp(username, authCode)
    updateFormState(() => ({...formState, formType: "signIn"}))
  }
  async function signIn() {
    const {username, password} = formState
    await Auth.signIn(username, password)
    updateFormState(() => ({...formState, formType: "signedIn"}))
  }
  return (
    <div className={classes.root} >
      {
        formType === "signUp" && (
          <div>
            <input name="username" onChange={onChange} placeholder="username" />
            <input name="password" type=" password" onChange={onChange} placeholder="password" />
            <input name="email" onChange={onChange} placeholder="email" />
            <button onClick={signUp}>Sign Up</button>
            <button onClick={() => updateFormState(() => ({
              ...formState, formType: "signIn"
            }))}>Sign In</button>
          </div>
        )
      }
      {
        formType === "signIn" && (
          <div>
            <input name="username" onChange={onChange} placeholder="username" />
            <input name="password" type=" password" onChange={onChange} placeholder="password" />
            <button onClick={signIn}>Sign In</button>
          </div>
        )
      }
      {
        formType === "confirmSignUp" && (
          <div>
            <input name="authCode" type=" password" onChange={onChange} placeholder="Confirmation code" />
            <button onClick={confirmSignUp}>Confirm Sign Up</button>
          </div>
        )
      }
      {/* {
        formType === "signedIn" && (
          <div>
            <h1>Hello world, welcome user.</h1>
            <button onClick={
            () => Auth.signOut()
            }>Sign Out</button>
          </div>
        )
      } */}
      {user && (<ThemeProvider theme={theme}>
        <CssBaseline />
        <HashRouter>
          <Switch>
            <Route exact path='/' component={AllPosts} />
            <Route exact path='/global-timeline' component={AllPosts} />
            <Route exact path='/:userId' component={PostsBySpecifiedUser}/>
            <Redirect path="*" to="/" />
          </Switch>
        </HashRouter>
      </ThemeProvider>)}
    </div>
  );
}

// export default withAuthenticator(App, {
//   signUpConfig: {
//     hiddenDefaults: ['phone_number']
//   }
// });
export default App;