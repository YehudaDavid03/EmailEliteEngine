import React, { useState, useEffect } from "react"
import NavBar from "../components/NavBar"
import axios from "axios"
import LoadingSpinner from "../components/LoadingSpinner"

import { evaluateMathExpressions } from "../components/evaluateMathExpressions"
import { sampleData } from "../components/sampleData"
import profileAvatar from "../assets/profile-avatar.png"

const MessageTool = ({ sendUserInfo, navigate, receiveUserInfo }) => {
  const [jobRunningList, setJobRunningList] = useState()

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
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/get-message-options",
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

  useEffect(() => {
    const runLoadOut = () => {
      axios({
        method: "GET",
        url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/get-current-jobs",
        headers: {
          Authorization: `Bearer ${receiveUserInfo?.token}`
        },
      })
      .then((response) => {
        setJobRunningList(response.data)

        if (response.data.some(job => job.jobStatus === true)) {
          setTimeout(() => { runLoadOut() }, 30000)
        }
      })
      .catch((error) => {
        if (error.response.data.message === "Access token is invalid or expired") {
          sendUserInfo(null)
        }
        
        alert(error.response.data.message)
      })
    }

    runLoadOut()
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
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/send-mass-initiation",
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

  const handleStopSelectedJob = (selectedJobId) => {
    if (selectedJobId.length === 0) {
      alert("ERR: Please reload the page")
      return 
    }

    setApiLoading(true)

    axios({
      method: "POST",
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/terminate-selected-job",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
      data: { selectedJobId: selectedJobId }
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

              {optionsData?.templateList?.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date)).map((item, index) => (
                <option key={index} value={parseInt(item?.template_id)}>{item?.template_name}</option>
              ))}
            </select>


            <select name="emailLeadPackage" onChange={(e) => setBlastData({ ...blastData, [e.target.name]: e.target.value })}>
              <option value="">Lead Package List</option>
              
              {optionsData?.leadPackagesList?.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date)).map((item, index) => (
                <option key={index} value={item?.lead_package_id}>{item?.lead_package_name}, {`(${item?.lead_count.toLocaleString()})`}</option>
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

            {jobRunningList?.sort((a, b) => new Date(b.jobStartDate) - new Date(a.jobStartDate)).map((item, index) => (
              <div style={item?.jobStatus ? {backgroundColor: "#0F9D58"} : {backgroundColor: "#ffd151"}} className="job-list" key={index}>
                <p>{item?.jobStatus ? "Running" : item?.jobSize === item?.jobCompeted ? "Completed" : "Terminated"}</p>
                <p>{item?.estimate}</p>
                <p>{item?.jobStartDate ? new Date(item?.jobStartDate).toLocaleString() : ""}</p>
                {item?.jobStatus ? <span onClick={() => {
                  if (window.confirm("Are you sure you to terminate this process?")) {
                    handleStopSelectedJob(item?.jobId)
                  }
                }} className="material-icons">power_settings_new</span> : <span className="material-icons">bookmark</span>}
              </div>
            ))}
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