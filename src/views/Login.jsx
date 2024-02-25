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
      setLogin({ userEmail: "", userPassword: "" })
      return 
    }
    
    if (login.userPassword.length === 0) {
      alert("ERR: Password entry non existent")
      setLogin({ userEmail: "", userPassword: "" })
      return 
    }

    setLoginApiLoading(true)

    axios({
      method: "POST",
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/login",
      data: {
        userEmail: login.userEmail,
        userPassword: login.userPassword
      }
    }).then((response) => {
      sendUserInfo(response.data)
      navigate("/dashboard", {replace: true})
    }).catch((error) => {
      if (error.response.data.message === "Invalid password") {
        setLogin({ ...login, userPassword: "" })
      } else {
        setLogin({ userEmail: "", userPassword: "" })
      }
      alert(error.response.data.message)
    }).finally(() => {
      setLoginApiLoading(false)
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }
  
  return (
    loginApiLoading == true ?

    (<LoadingSpinner />)

    :

    (
      receiveUserInfo !== null ?
      
      (navigate("/dashboard", {replace: true}))

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
            onKeyDown={handleKeyDown}
          />
          
          <input 
            type="password" 
            name="userPassword" 
            placeholder="User's Password" 
            value={login.userPassword} 
            onChange={(e) => { setLogin({ ...login, [e.target.name]: e.target.value }) }}
            onKeyDown={handleKeyDown}
          />

          <button onClick={() => {handleLogin()}} >LOGIN</button>
        </div>
      )
    )
  )
}

export default Login