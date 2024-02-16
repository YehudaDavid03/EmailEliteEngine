import React, { useState, useEffect } from "react"
import NavBar from "../components/NavBar"
import axios from "axios"
import LoadingSpinner from "../components/LoadingSpinner"

import { evaluateMathExpressions } from "../components/evaluateMathExpressions"
import { sampleData } from "../components/sampleData"
import profileAvatar from "../assets/profile-avatar.png"

const MessageTool = ({ sendUserInfo, navigate, receiveUserInfo }) => {
  const [optionsData, setOptionsData] = useState()
  const [apiLoading, setApiLoading] = useState(false)
  const [blastData, setBlastData] = useState({ 
    emailSubject: "", 
    emailTemplate: 0, 
    emailLeadPackage: ""
  })

  useEffect(() => {
    setApiLoading(true)

    axios({
      method: "GET",
      url: "http://3.23.81.35/api/get-message-options",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
    })
    .then((response) => {
      setOptionsData(response.data)
    })
    .catch((error) => {
      if (error.response.data.message == "Access token is invalid or expired") {
        sendUserInfo(null)
      }

      alert(error.response.data.message)
    }).finally(() => {
      setApiLoading(false)
    })
  }, [])

  const handleBlast = () => {
    if (blastData.emailSubject.length === 0) {
      alert("ERR: Email subject line cannot be empty")
      return 
    }
    
    if (blastData.emailTemplate === 0) {
      alert("ERR: No template selected")
      return 
    }

    if (blastData.emailLeadPackage.length === 0) {
      alert("ERR: No lead package selected")
      return 
    }

    setApiLoading(true)

    axios({
      method: "POST",
      url: "http://3.23.81.35/api/send-mass-initiation",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
      data: blastData
    }).then((response) => {
      alert(response.data.message)
      window.location.reload()
    }).catch((error) => {
      if (error.response.data.message == "Access token is invalid or expired") {
        sendUserInfo(null)
      }
      
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

        <div className="message-tool-main">
          <div className="message-tool-main-one">
            <input 
              type="text" 
              readOnly
              value={receiveUserInfo.emailAddress}
            />

            <input 
              type="text" 
              name="emailSubject" 
              placeholder="Email Subject" 
              value={blastData.emailSubject}
              onChange={(e) => { setBlastData({ ...blastData, [e.target.name]: e.target.value }) }}
            />

            <select name="emailTemplate" onChange={(e) => setBlastData({ ...blastData, [e.target.name]: parseInt(e.target.value) })}>
              <option value={0}>Template Choice</option>

              {optionsData?.templateList?.map((item, index) => (
                <option key={index} value={parseInt(item?.template_id)}>{item?.template_name}</option>
              ))}
            </select>


            <select name="emailLeadPackage" onChange={(e) => setBlastData({ ...blastData, [e.target.name]: e.target.value })}>
              <option value="">Lead Package List</option>
              
              {optionsData?.leadPackagesList?.map((item, index) => (
                <option key={index} value={item?.lead_package_id}>{item?.lead_package_name}</option>
              ))}
            </select>

            <div>
              {/* <button>Preview Email</button> */}
              <button onClick={() => {
                if (window.confirm("Are you sure you want to start blasting with the proper configuration?")) {
                  handleBlast()
                }
              }}>Start Email Blast</button>
            </div>
          </div>

          {
            blastData.emailSubject === "" || blastData.emailTemplate === 0 ?

            (<></>)

            :

            (
              <div className="message-tool-main-two">
                <h1 id="h1">
                  {evaluateMathExpressions(blastData?.emailSubject, sampleData)}
                </h1>
    
                <div id="div">
                  <img id="img" src={profileAvatar} alt="Image Profile Avatar"/>
    
                  <main id="main">
                    <p><span style={{fontWeight: "600"}}>From: </span>{receiveUserInfo?.emailAddress}</p>
                    <p><span style={{fontWeight: "600"}}>To: </span>{sampleData?.email_address}</p>
                  </main>
                </div>
                
                <section dangerouslySetInnerHTML={{ __html: evaluateMathExpressions(optionsData?.templateList[optionsData?.templateList.findIndex(item => item.template_id === blastData.emailTemplate)]?.template_contents, sampleData) + "<br /><br />" }} />
                <section style={{marginBottom: "0%"}} dangerouslySetInnerHTML={{ __html: receiveUserInfo?.userEmailSignature }} />
              </div>
            )
          }
        </div>
      </>
    )
  )
}

export default MessageTool