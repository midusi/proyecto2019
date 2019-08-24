import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Container, Segment, Grid, Button } from 'semantic-ui-react'

import * as faceapi from 'face-api.js'

import WebCamPicture from 'src/components/WebCamPicture'

import {
  MODEL_URL,
  MIN_CONFIDENCE,
  INPUT_SIZE,
  MIN_PROBABILITY,
} from 'src/config/recognition'

class RecognizeContainer extends Component {
  static async loadModels() {
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceExpressionModel(MODEL_URL)
  }

  constructor(props) {
    super(props)

    this.state = {
      recognize: false,
    }

    this.fullFaceDescriptions = null
    this.faceImages = null

    this.webCamPicture = React.createRef()
    this.canvasPicWebCam = React.createRef()
    // this.canvasFace = React.createRef()

    this.landmarkWebCamPicture = this.landmarkWebCamPicture.bind(this)
    this.runRecognition = this.runRecognition.bind(this)
    this.resetRecognition = this.resetRecognition.bind(this)
  }

  async componentDidMount() {
    await RecognizeContainer.loadModels()
  }

  async getFullFaceDescription(canvas) {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: INPUT_SIZE,
      scoreThreshold: MIN_CONFIDENCE
    })

    this.fullFaceDescriptions = await faceapi
      .detectAllFaces(canvas, options)
      .withFaceExpressions()
    
    this.faceImages = await faceapi
      .extractFaces(canvas, this.fullFaceDescriptions.map(({ detection }) => detection))
  }

  drawDescription(canvas) {
    const drawableDetections = this.fullFaceDescriptions
      .map(({ detection }) => detection)
      .map(fd => fd.box)

    const drawableExpressions = this.fullFaceDescriptions
      .map(({ detection, expressions }) => ({
        position: detection.box,
        expressions,
      }))

    faceapi.draw.drawDetections(canvas, drawableDetections)
    faceapi.draw.drawFaceExpressions(canvas, drawableExpressions, MIN_PROBABILITY)
  }

  landmarkWebCamPicture(picture) {
    const ctx = this.canvasPicWebCam.current.getContext('2d')
    // const ctxFace = this.canvasFace.current.getContext('2d')
    
    var image = new Image()
    
    image.onload = async () => {
      ctx.drawImage(image, 0, 0)
      
      await this.getFullFaceDescription(this.canvasPicWebCam.current)
      this.drawDescription(this.canvasPicWebCam.current)
      
      /* clean the canvas to avoid overlapping faces */
      // ctxFace.clearRect(0, 0, this.canvasFace.current.width, this.canvasFace.current.height)
      // this.faceImages[0] && ctxFace.drawImage(this.faceImages[0], 0, 0)
    }
    
    image.src = picture
  }

  runRecognition() {
    this.setState(() => ({
      recognize: true,
    }))

    this.webCamPicture.current.capture()
  }

  resetRecognition() {
    this.setState(() => ({
      recognize: false,
    }))

    this.fullFaceDescriptions = null
    this.faceImages = null
  }

  render() {
    const {
      recognize,
    } = this.state

    const {
      trans,
    } = this.props

    void trans

    return (
      <Container text>
        <Segment placeholder>
          <Grid columns={2}>
            <Grid.Column>
              <canvas
                ref={this.canvasPicWebCam}
                width={350}
                height={350}
                style={{ display: recognize ? undefined : 'none' }}
              />

              { recognize ? null : (
                <WebCamPicture
                  ref={this.webCamPicture}
                  landmarkPicture={this.landmarkWebCamPicture}
                  videoConstraints={{
                    width: 350,
                    height: 350,
                    facingMode: 'user',
                  }}
                />
              )}
            </Grid.Column>
            <Grid.Column verticalAlign='middle'>
              <Button 
                circular
                icon='camera'
                color='red'
                basic
                size='huge'
                onClick={recognize ? this.resetRecognition : this.runRecognition}
              />
            </Grid.Column>
          </Grid>
        </Segment>
      </Container>
    )
  }
}

RecognizeContainer.propTypes = {
  trans: PropTypes.func.isRequired,
}

export default RecognizeContainer