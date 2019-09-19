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

  componentDidMount() {
    const {
      refreshTime,
    } = this.props

    this.interval = setInterval(this.capture, refreshTime)
  }
  
  componentWillUnmount() {
    clearInterval(this.interval)
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
      style,
      ...rest
    } = this.props

    return (
      <Webcam
        audio={false}
        ref={this.webcam}
        screenshotFormat="image/jpeg"
        style={{
          ...(style || {}),
          transform: 'scaleX(-1)'
        }}
        {...rest}
        videoConstraints={videoConstraints}
      />
    )
  }
}

export default WebCamPicure