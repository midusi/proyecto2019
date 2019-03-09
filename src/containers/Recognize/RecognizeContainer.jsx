import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Container, Divider } from 'semantic-ui-react'

import * as faceapi from 'face-api.js'

import WebCamPicture from 'src/components/WebCamPicture'

const MODEL_URL = '/models'
const minConfidence = 0.6

class RecognizeContainer extends Component {
  constructor(props) {
    super(props)

    this.fullFaceDescriptions = null
    this.canvasPicWebCam = React.createRef()

    this.landmarkWebCamPicture = this.landmarkWebCamPicture.bind(this)
  }

  async componentDidMount() {
    await this.loadModels()
  }

  async getFullFaceDescription(canvas) {
    console.log(canvas);
    this.fullFaceDescriptions = await faceapi.allFaces(canvas, minConfidence);
    console.log(this.fullFaceDescriptions);
  }

  drawDescription(canvas) {
    this.fullFaceDescriptions.forEach(fd => {
      faceapi.drawLandmarks(canvas, fd.landmarks, { drawLines: false })
    })
  }

  landmarkWebCamPicture(picture) {
    const ctx = this.canvasPicWebCam.current.getContext('2d')
    var image = new Image()
    
    image.onload = async () => {
      ctx.drawImage(image, 0, 0)
      await this.getFullFaceDescription(this.canvasPicWebCam.current)
      this.drawDescription(this.canvasPicWebCam.current)
    }
    
    image.src = picture
  }

  async loadModels () {
    void this

    // await faceapi.loadModels(MODEL_URL)

    await faceapi.loadFaceDetectionModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
  }

  render() {
    const {
      trans,
    } = this.props

    void trans

    return (
      <Container textAlign='center'>
        <WebCamPicture landmarkPicture={this.landmarkWebCamPicture} />
        <canvas ref={this.canvasPicWebCam} width={350} height={350} />
        <Divider hidden />
      </Container>
    )
  }
}

RecognizeContainer.propTypes = {
  trans: PropTypes.func.isRequired,
}

export default RecognizeContainer
