import React, { useState, useEffect } from "react"
import NavBar from "../components/NavBar"
import LoadingSpinner from "../components/LoadingSpinner"
import * as XLSX from "xlsx"
import axios from "axios"

const LeadTool = ({ sendUserInfo, navigate, receiveUserInfo }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [receivedLeadPack, setReceivedLeadPack] = useState([])
  const [receivedLeadIndividual, setReceivedLeadIndividual] = useState([])

  const [selectedFile, setSelectedFile] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [leadPack, setLeadPack] = useState({
    leadPackageName: "",
    jsonEmailList: []
  })

  const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

  const convertMoneyStringToNumber = (moneyString) => {
    if (!moneyString) return 0
  
    const regex = /(?:^|\s)(?:\$)?(\d+(?:,\d{3})*(?:\.\d{1,2})?)([KMB]?)(?=\s|$)/gi
    const matches = [...moneyString.matchAll(regex)]
  
    let num = 0
  
    for (const match of matches) {
      const [fullMatch, valueStr, suffix] = match
      let value = parseFloat(valueStr.replace(/,/g, ""))
  
      switch (suffix.toUpperCase()) {
        case "K":
          value *= 1000
          break
        case "M":
          value *= 1000000
          break
        case "B":
          value *= 1000000000
          break
      }
  
      num += value
    }
  
    return Math.round(num)
  }

  const handleFile = async (e) => {
    setApiLoading(true)
    const newArray = []
    const file = e.target.files[0]
    setSelectedFile(file.name)

    if (["csv", "numbers", "xlsx"].includes(file.name.split(".").pop())) {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const workSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(workSheet, { raw: true })

      for (const obj of jsonData) {
        const newObj = {}
        for (const key in obj) {
            if (key.toLowerCase().includes("first") || key.toLowerCase().includes("last")) {
                const capitalizedWord = obj[key]
                    .trim()
                    .toLowerCase()
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ")
                newObj[key.toLowerCase().includes("first") ? "firstName" : "lastName"] = capitalizedWord
            } else if (key.toLowerCase().includes("company")) {
                const capitalizedCompanyName = obj[key].trim().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
                newObj["companyName"] = capitalizedCompanyName
            } else if (key.toLowerCase().includes("email")) {
                newObj["emailAddress"] = obj[key].trim().toLowerCase()
            } else if (key.toLowerCase().includes("revenue")) {
                newObj["monthlyRevenue"] = convertMoneyStringToNumber(obj[key].toString().split('-').pop().split('to').pop().split(' ').pop().split(':').pop().trim())
            }
        }
    
        if (newObj.firstName && newObj.lastName && newObj.companyName && newObj.emailAddress) {
            if (!newObj.monthlyRevenue || newObj.monthlyRevenue > 0) {
                newArray.push(newObj)
            }
        }
    }    
    
      setLeadPack({ ...leadPack, jsonEmailList: newArray })
    } else {
      alert("Please only select 'csv' / 'numbers' / 'xlsx' files")
    }

    delay(500).then(() => setApiLoading(false))
  }

  useEffect(() => {
    setApiLoading(true)

    axios({
      method: "GET",
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/get-lead-package",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
    })
    .then((response) => {
      setReceivedLeadPack(response.data)
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

  const handleSave = () => {
    if (leadPack.leadPackageName.length === 0) {
      alert("ERR: Lead pack name cannot be empty")
      return 
    }
    
    if (leadPack.jsonEmailList.length === 0) {
      alert("ERR: No Lead file selected")
      return 
    }

    setApiLoading(true)

    axios({
      method: "POST",
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/create-lead-package",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
      data: leadPack
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

  const handleChosen = (selectedLeadSource) => {
    if (selectedLeadSource.length === 0) {
      alert("ERR: Lead source must be selected")
      return 
    }

    setApiLoading(true)

    axios({
      method: "GET",
      url: `https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/get-individual-leads/${selectedLeadSource}`,
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
    }).then((response) => {
      setReceivedLeadIndividual(response.data)
    }).catch((error) => {
      if (error.response.data.message == "Access token is invalid or expired") {
        sendUserInfo(null)
      }

      alert(error.response.data.message)
    }).finally(() => {
      setApiLoading(false)
    })
  }

  const handleDeleteLead = (selectedValuedDelete) => {
    if (selectedValuedDelete.length === 0) {
      alert("ERR: Lead source must be selected")
      return 
    }

    setApiLoading(true)

    axios({
      method: "DELETE",
      url: `https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/delete-individual-lead/${selectedValuedDelete}`,
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
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

  const handleDeleteLeadPack = (selectedLeadPack) => {
    if (selectedLeadPack.length === 0) {
      alert("ERR: Lead source must be selected")
      return 
    }

    setApiLoading(true)

    axios({
      method: "DELETE",
      url: `https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/delete-lead-pack/${selectedLeadPack}`,
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
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

  const filteredLeads = receivedLeadIndividual?.filter(lead => {
    return (
      lead?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead?.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead?.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    apiLoading ?

      (<LoadingSpinner />)

      :

      (
        <>
          <NavBar sendUserInfo={sendUserInfo} navigate={navigate} receiveUserInfo={receiveUserInfo} />
          <div className="lead-tool-main">
            <div className="lead-tool-main-one">
              <div>
                <input
                  type="text"
                  name="leadPackageName"
                  placeholder="Lead Package Name"
                  value={leadPack.leadPackageName}
                  onChange={(e) => setLeadPack({ ...leadPack, [e.target.name]: e.target.value })}
                />

                <input
                  type="file"
                  name=""
                  onChange={handleFile}
                  accept=".csv,.numbers,.xlsx"
                />

                <button onClick={handleSave}>Save Lead Package</button>
              </div>

              <div>
                {receivedLeadPack?.map((LeadPackage, index) => (
                  <div key={LeadPackage?.lead_package_id}>
                    <p>{`${index + 1}) `}{LeadPackage?.lead_package_name}</p>
                    <section>
                      <span onClick={() => { handleChosen(LeadPackage?.lead_package_id) }} style={{ color: "#0F9D58" }} className="material-icons">open_in_new</span>
                      <span onClick={() => {
                        if (window.confirm("Are you sure you want to delete this lead package?")) {
                          handleDeleteLeadPack(LeadPackage?.lead_package_id)
                        }
                      }} style={{color: "#DB4437"}} className="material-icons">delete</span>
                    </section>
                  </div>
                ))}
              </div>
            </div>

            <div className="lead-tool-main-two">
              {
                receivedLeadIndividual.length > 0 ?

                (
                  <input
                    type="text"
                    name=""
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                )

                :

                (<></>)
              }

              {filteredLeads?.map((LeadPackageIndividual, index) => (
                <div key={LeadPackageIndividual?.lead_id}>
                  <p>{LeadPackageIndividual?.first_name + ", " + LeadPackageIndividual?.last_name}</p>
                  <p>{LeadPackageIndividual?.email_address}</p>
                  <p>{LeadPackageIndividual?.company_name}</p>
                  <p>{LeadPackageIndividual?.monthly_revenue.toLocaleString("en-US", { style: "currency", currency: "USD" })}</p>
                  <p>
                    <span onClick={() => {
                      if (window.confirm("Are you sure you want to delete this lead?")) {
                        handleDeleteLead(LeadPackageIndividual?.lead_id)
                      }
                    }} style={{color: "#DB4437"}} className="material-icons">delete</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )
  )
}

export default LeadTool