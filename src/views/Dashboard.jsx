import React, { useState, useEffect } from "react"
import NavBar from "../components/NavBar"
import axios from "axios"
import LoadingSpinner from "../components/LoadingSpinner"


const Dashboard = ({ sendUserInfo, navigate, receiveUserInfo }) => {
  const [dashboardData, setDashboardData] = useState()
  const [apiLoading, setApiLoading] = useState(false)

  useEffect(() => {
    setApiLoading(true)

    axios({
      method: "GET",
      url: "/api/get-dashboard-content",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
    })
    .then((response) => {
      setDashboardData(response.data[0])
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
  
  return (
    apiLoading == true ?

    (<LoadingSpinner />)

    :

    (
      <>
        <NavBar sendUserInfo={sendUserInfo} navigate={navigate} receiveUserInfo={receiveUserInfo} />

        <div className="dashboard-main">
          <div className="dashboard-main-one">
            <div>
              <span className="material-icons">event</span>
              <p>{dashboardData?.count_of_emails_sent_today.toLocaleString()} Emails sent today</p>
            </div>
              
            <div>
              <span className="material-icons">date_range</span>
              <p>{dashboardData?.count_of_emails_sent_week.toLocaleString()} Emails sent this week</p>
            </div>

            <div>
              <span className="material-icons">person</span>
              <p>Welcome, {dashboardData?.full_name}</p>
            </div>
          </div>

          <div className="dashboard-main-two">
            <div>
              <span className="material-icons">auto_stories</span>
              <p>{dashboardData?.leads_count.toLocaleString()}{dashboardData?.leads_count === 1 ? " Total Lead" : " Total Leads"}</p>
            </div>
              
            <div>
              <span className="material-icons">design_services</span>
              <p>{dashboardData?.template_count.toLocaleString()} {dashboardData?.template_count === 1 ? " Total Template" : " Total Templates"}</p>
            </div>
          </div>
        </div>
      </>
    )
  )
}

export default Dashboard