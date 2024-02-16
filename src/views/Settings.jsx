import React, { useState, useEffect } from "react"
import NavBar from "../components/NavBar"
import axios from "axios"
import LoadingSpinner from "../components/LoadingSpinner"

const Settings = ({ sendUserInfo, navigate, receiveUserInfo }) => {
  const [apiLoading, setApiLoading] = useState(false)
  const [reset, setReset] = useState({
    newPasswordOne: "",
    newPasswordTwo: ""
  })

  const handleReset = () => {
    if (reset.newPasswordOne.length === 0 || reset.newPasswordTwo.length === 0) {
      alert("ERR: Password fields cannot be empty.")
      return
    }
    
    if (reset.newPasswordOne.length < 8 || reset.newPasswordTwo.length < 8) {
        alert("ERR: Passwords must be at least 8 characters long.")
        return
    }
    
    if (reset.newPasswordOne !== reset.newPasswordTwo) {
        alert("ERR: Passwords do not match.")
        return
    }  

    setApiLoading(true)

    axios({
      method: "POST",
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/reset-password",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
      data: reset
    }).then((response) => {
      alert(response.data.message)
      sendUserInfo(null)
      navigate('/login', {replace: true})
    }).catch((error) => {
      alert(error.response.data.message)
    }).finally(() => {
      setApiLoading(false)
    })
  }
  
  return (
    apiLoading == true ?

    (<LoadingSpinner />)

    :

    (
      <>
        <NavBar sendUserInfo={sendUserInfo} navigate={navigate} receiveUserInfo={receiveUserInfo} />

        <div className="settings-main">
          <input 
            type="text" 
            name="newPasswordOne" 
            placeholder="New Password" 
            value={reset.newPasswordOne} 
            onChange={(e) => { setReset({ ...reset, [e.target.name]: e.target.value }) }}
          />
          
          <input 
            type="text" 
            name="newPasswordTwo" 
            placeholder="New Password" 
            value={reset.newPasswordTwo} 
            onChange={(e) => { setReset({ ...reset, [e.target.name]: e.target.value }) }}
          />

          <button onClick={() => {
            if (window.confirm("Are you sure you want to reset your password?")) {
              handleReset()
            }
          }}>RESET PASSWORD</button>
        </div>
      </>
    )
  )
}

export default Settings