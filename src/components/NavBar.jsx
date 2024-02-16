import React from "react"
import { Link } from "react-router-dom"

const NavBar = ({ sendUserInfo, navigate, receiveUserInfo }) => {
  const logoutFunc = () => {
    sendUserInfo(null)
    navigate('/login', {replace: true})
  }

  return (
    <div className="nav-bar-main">
      <div style={{width: "60%"}}>
        <Link to="/dashboard" style={{textDecoration: "none"}}>
          <p>{receiveUserInfo.companyName}</p>
        </Link>
        <span>{`(Logged In: ${receiveUserInfo.firstName}, ${receiveUserInfo.lastName}) (Last Logged In: ${new Date(receiveUserInfo.lastLogin)})`}</span>
      </div>

      <div style={{width: "40%"}}>
        <Link to="/dashboard"><span className="material-icons">dashboard</span></Link>
        <Link to="/messageTool"><span className="material-icons">forward_to_inbox</span></Link>
        <Link to="/leadTool"><span className="material-icons">auto_stories</span></Link>
        <Link to="/templateTool"><span className="material-icons">design_services</span></Link>
        <Link to="/settings"><span className="material-icons">settings</span></Link>
        <span onClick={() => {logoutFunc()}} className="material-icons">logout</span>
      </div>
    </div>
  )
}

export default NavBar