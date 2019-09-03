import React, { Component } from 'react'
import Webcam from 'react-webcam'

class WebCamPicure extends Component {
  constructor(props){
    super(props)

    this.image = null
    this.webcam = React.createRef()

    this.capture = this.capture.bind(this)
    this.interval = null
  }

  capture() {
    const {
      landmarkPicture,
    } = this.props

    const imageSrc = this.webcam.current.getScreenshot()

    landmarkPicture(imageSrc)
  }

  render() {
    const {
      videoConstraints,
      ...rest
    } = this.props

    return (
      <Webcam
        audio={false}
        ref={this.webcam}
        screenshotFormat="image/jpeg"
        {...rest}
        videoConstraints={videoConstraints}
      />
    )
  }
}

export default WebCamPicure