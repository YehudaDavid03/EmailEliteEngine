import React, { useState, useEffect } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"

import Login from "./views/Login"
import Dashboard from "./views/Dashboard"
import TemplateTool from "./views/TemplateTool"
import LeadTool from "./views/LeadTool"
import MessageTool from "./views/MessageTool"
import Settings from "./views/Settings"

function App() {
  const navigate = useNavigate()
  const localData = localStorage.getItem("userData")
  const [receiveUserInfo, setReceiveUserInfo] = useState(localData !== null ? JSON.parse(localData) : null)

  const sendUserInfo = (sendUserInfo) => {
    setReceiveUserInfo(sendUserInfo)
  }

  function RedirectToLogin() {
    navigate("/login", {replace: true})
  }  

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(receiveUserInfo))
  }, [receiveUserInfo])

  return (
    <div className="app-main">
      <Routes>
        <Route path="/login" element={<Login receiveUserInfo={receiveUserInfo} sendUserInfo={sendUserInfo} navigate={navigate} />} />

        {
          receiveUserInfo !== null ?

          (
            <>
              <Route path="/dashboard" element={<Dashboard receiveUserInfo={receiveUserInfo} sendUserInfo={sendUserInfo} navigate={navigate} />} />
              <Route path="/templateTool" element={<TemplateTool receiveUserInfo={receiveUserInfo} sendUserInfo={sendUserInfo} navigate={navigate} />} />
              <Route path="/leadTool" element={<LeadTool receiveUserInfo={receiveUserInfo} sendUserInfo={sendUserInfo} navigate={navigate} />} />
              <Route path="/messageTool" element={<MessageTool receiveUserInfo={receiveUserInfo} sendUserInfo={sendUserInfo} navigate={navigate} />} />
              <Route path="/settings" element={<Settings receiveUserInfo={receiveUserInfo} sendUserInfo={sendUserInfo} navigate={navigate} />} />
            </>
          )

          :

          (
            <></>
          )
        }

        <Route path="*" element={<RedirectToLogin />} />
      </Routes>
    </div>
  )
}

export default App