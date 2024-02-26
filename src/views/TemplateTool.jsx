import React, { useState, useEffect } from "react"
import NavBar from "../components/NavBar"
import LoadingSpinner from "../components/LoadingSpinner"
import { EditorState, convertToRaw } from "draft-js"
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import draftToHtml from "draftjs-to-html"
import axios from "axios"

import { evaluateMathExpressions } from "../components/evaluateMathExpressions"
import { sampleData } from "../components/sampleData"

const TemplateTool = ({ sendUserInfo, navigate, receiveUserInfo }) => {
  const [apiLoading, setApiLoading] = useState(false)
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [userTemplateData, setUserTemplateData] = useState(null)
  const [templatePack, setTemplatePack] = useState({
    templateName: "",
    templateHTML: "",
  })

  useEffect(() => {
    setApiLoading(true)

    axios({
      method: "GET",
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/get-template",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
    })
    .then((response) => {
      setUserTemplateData(response.data)
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
    if (templatePack.templateName.length === 0) {
      alert("ERR: Template name cannot be empty")
      return 
    }
    
    if (templatePack.templateHTML.length === 0) {
      alert("ERR: Template area cannot be empty")
      return 
    }

    setApiLoading(true)

    axios({
      method: "POST",
      url: "https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/create-template",
      headers: {
        Authorization: `Bearer ${receiveUserInfo?.token}`
      },
      data: templatePack
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

  const handleDelete = (selectedValuedIdentification) => {
    if (selectedValuedIdentification.length === 0) {
      alert("ERR: Template must be selected")
      return 
    }
    
    setApiLoading(true)

    axios({
      method: "DELETE",
      url: `https://glacial-harbor-81192-6ae27de8e915.herokuapp.com/api/delete-template/${selectedValuedIdentification}`,
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

  const handleEditorStateChange = (newState) => {
    const contentState = newState.getCurrentContent()
    const rawContentState = convertToRaw(contentState)
    const htmlContent = draftToHtml(rawContentState)
    setEditorState(newState)
    setTemplatePack({ ...templatePack, templateHTML: htmlContent })
  }

  const handlePreview = () => {
    const contentState = editorState.getCurrentContent()
    const rawContentState = convertToRaw(contentState)
    const htmlContent = draftToHtml(rawContentState)
    displayHtmlPreview(htmlContent)
  }

  const displayHtmlPreview = (htmlContent) => {
    const previewWindow = window.open("", "_blank")
    previewWindow.document.write(evaluateMathExpressions(htmlContent, sampleData))
  }

  const displayHtmlOnSite = (htmlContent) => {
    const previewWindow = window.open("", "_blank")
    previewWindow.document.write(evaluateMathExpressions(htmlContent, sampleData))
  }

  const handleDragStart = (event, item) => {
    event.dataTransfer.setData("text/plain", item)
  }

  return (
    apiLoading == true ?

    (<LoadingSpinner/>)

    :

    (
      <>
        <NavBar sendUserInfo={sendUserInfo} navigate={navigate} receiveUserInfo={receiveUserInfo} />

        <div className="template-tool-main">
          <div className="template-tool-main-one">
            <input
              className="input-spc" 
              type="text"
              name="templateName"
              placeholder="Template Name"
              value={templatePack.templateName}
              onChange={(e) => {setTemplatePack({ ...templatePack, [e.target.name]: e.target.value })}}
            />

            <div className="draggable-items">
              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "first_name")} >
                First Name
              </div>

              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "last_name")} >
                Last Name
              </div>

              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "company_name")} >
                Company Name
              </div>

              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "$[monthly_revenue]")} >
                Monthly Revenue
              </div>

              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "$[monthly_revenue * 0.80]")} >
                percent of monthly revenue approved
              </div>

              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "$[monthly_revenue * 0.80 * 1.25]")} >
                factor rate on approval 
              </div>

              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "$[monthly_revenue * 0.80 * 1.25 / 52]")} >
                daily / weekly payment remittance
              </div>

              <div className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, "$[monthly_revenue * 0.80 * 0.025]")} >
                bank fee on approval
              </div>
            </div>

            <Editor
              editorState={editorState}
              onEditorStateChange={handleEditorStateChange}
              wrapperStyle={{
                minHeight: "575px",
                height: "auto",
                overflowY: "auto",
              }}
            />

            <div>
              <button className="button-spc" style={{ marginRight: "5%" }} onClick={handlePreview}>Preview Template</button>
              <button className="button-spc" onClick={handleSave}>Save Template</button>
            </div>
          </div>

          <div className="template-tool-main-two">
            {userTemplateData?.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date)).map((template, index) => (
              <div key={index}>
                <p>{`${index + 1}) `}{template.template_name}</p>

                <section>
                  <span onClick={ () => {displayHtmlOnSite(template.template_contents)} } style={{color: "#0F9D58"}} className="material-icons">open_in_new</span>
                  <span onClick={() => {
                    if (window.confirm("Are you sure you want to delete this template?")) {
                      handleDelete(template.template_id)
                    }
                  }} style={{color: "#DB4437"}} className="material-icons">delete</span>
                </section>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  )
}

export default TemplateTool