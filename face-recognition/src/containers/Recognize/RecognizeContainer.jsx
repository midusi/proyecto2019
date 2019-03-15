import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Container, Segment, Grid } from 'semantic-ui-react'

import * as faceapi from 'face-api.js'

import WebCamPicture from 'src/components/WebCamPicture'

import {
  MODEL_URL,
  MIN_CONFIDENCE,
  INPUT_SIZE,
  REFRESH_TIME,
} from 'src/config/recognition'

class RecognizeContainer extends Component {
  static async loadModels () {
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceExpressionModel(MODEL_URL)
  }

  constructor(props) {
    super(props)

    this.fullFaceDescriptions = null
    this.faces = null
    this.faceImages = null

    this.canvasPicWebCam = React.createRef()
    this.canvasFace = React.createRef()

    this.landmarkWebCamPicture = this.landmarkWebCamPicture.bind(this)
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
    
    this.faces = this.fullFaceDescriptions.map(({ detection }) => detection)
    this.faceImages = await faceapi.extractFaces(canvas, this.faces)
  }

  drawDescription(canvas) {
    Array.from(this.faces || []).forEach(fd => {
      faceapi.drawDetection(canvas, fd.box)
    })
  }

  landmarkWebCamPicture(picture) {
    const ctx = this.canvasPicWebCam.current.getContext('2d')
    const ctxFace = this.canvasFace.current.getContext('2d')
    
    var image = new Image()
    
    image.onload = async () => {
      ctx.drawImage(image, 0, 0)
      
      await this.getFullFaceDescription(this.canvasPicWebCam.current)
      this.drawDescription(this.canvasPicWebCam.current)
      
      /* clean the canvas to avoid overlapping faces */
      ctxFace.clearRect(0, 0, this.canvasFace.current.width, this.canvasFace.current.height)
      this.faceImages[0] && ctxFace.drawImage(this.faceImages[0], 0, 0)
    }
    
    image.src = picture
  }

  render() {
    const {
      trans,
    } = this.props

    return (
      <Container>
        <Segment>
          <Grid columns={3} doubling centered>
            <Grid.Row>
              <Grid.Column>
                { trans('recognize:webcam') }
              </Grid.Column>
              <Grid.Column>
                { trans('recognize:capturedImages') }
              </Grid.Column>
              <Grid.Column>
                { trans('recognize:capturedFace') }
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <WebCamPicture
                  landmarkPicture={this.landmarkWebCamPicture}
                  refreshTime={REFRESH_TIME}
                  videoConstraints={{
                    width: 350,
                    height: 350,
                    facingMode: 'user',
                  }}
                />

              </Grid.Column>
              <Grid.Column>
                <canvas ref={this.canvasPicWebCam} width={350} height={350} />
              </Grid.Column>
              <Grid.Column>
                <canvas ref={this.canvasFace} width={350} height={350} />
              </Grid.Column>
            </Grid.Row>
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
