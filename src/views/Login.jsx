import React, { useState, useEffect } from "react"
import axios from "axios"
import LoadingSpinner from "../components/LoadingSpinner"

const Login = ({ receiveUserInfo, sendUserInfo, navigate }) => {
  const [loginApiLoading, setLoginApiLoading] = useState(false)
  const [login, setLogin] = useState({
    userEmail: "",
    userPassword: ""
  })

  const handleLogin = () => {
    if (login.userEmail.length === 0) {
      alert("ERR: Email entry non existent")
      return 
    }
    
    if (login.userPassword.length === 0) {
      alert("ERR: Password entry non existent")
      return 
    }

    setLoginApiLoading(true)

    axios({
      method: 'POST',
      url: 'http://3.23.81.35/api/login',
      data: {
        userEmail: login.userEmail,
        userPassword: login.userPassword
      }
    }).then((response) => {
      sendUserInfo(response.data)
      navigate('/dashboard', {replace: true})
    }).catch((error) => {
      alert(error.response.data.message)
    }).finally(() => {
      setLoginApiLoading(false)
    })
  }
  
  return (
    loginApiLoading == true ?

    (<LoadingSpinner />)

    :

    (
      receiveUserInfo !== null ?
      
      (navigate('/dashboard', {replace: true}))

      :

      (
        <div className="login-main">
          <h1><span>MEMBER</span> LOGIN</h1>

          <input 
            type="email" 
            name="userEmail" 
            placeholder="User's Email" 
            value={login.userEmail} 
            onChange={(e) => { setLogin({ ...login, [e.target.name]: e.target.value }) }}
          />
          
          <input 
            type="password" 
            name="userPassword" 
            placeholder="User's Password" 
            value={login.userPassword} 
            onChange={(e) => { setLogin({ ...login, [e.target.name]: e.target.value }) }}
          />

          <button onClick={() => {handleLogin()}} >LOGIN</button>
        </div>
      )
    )
  )
}

export default Login