import React, { Component } from 'react'
import Webcam from 'react-webcam'
import { Button } from 'semantic-ui-react'

const videoConstraints = {
  width: 350,
  height: 350,
  facingMode: 'user',
}

class WebCamPicure extends Component {
  constructor(props){
    super(props)

    this.image = null
    this.webcam = React.createRef()

    this.capture = this.capture.bind(this)
  }

  capture() {
    const {
      landmarkPicture,
    } = this.props

    const imageSrc = this.webcam.current.getScreenshot()

    landmarkPicture(imageSrc)
  }

  render() {
    return (
      <div className="App" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Webcam
          audio={false}
          height={350}
          ref={this.webcam}
          screenshotFormat="image/jpeg"
          width={350}
          videoConstraints={videoConstraints}
        />
        <Button
          onClick={this.capture}
          content='asd'
        />
      </div>
    )
  }
}

export default WebCamPicure