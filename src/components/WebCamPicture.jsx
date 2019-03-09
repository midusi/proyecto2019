import React, { Component } from 'react'
import Webcam from 'react-webcam'

class WebCamPicure extends Component {
  constructor(props){
    super(props)

    this.image = null
    this.webcam = React.createRef()

    this.capture = this.capture.bind(this)
  }

  componentDidMount() {
    const {
      refreshTime,
    } = this.props

    setInterval(this.capture, refreshTime)
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
      videoConstraints
    } = this.props

    return (
      <Webcam
        audio={false}
        height={350}
        ref={this.webcam}
        screenshotFormat="image/jpeg"
        width={350}
        videoConstraints={videoConstraints}
      />
    )
  }
}

export default WebCamPicure