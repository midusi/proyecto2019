import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Container, Segment, Grid, Button } from 'semantic-ui-react'

import * as faceapi from 'face-api.js'

import WebCamPicture from 'src/components/WebCamPicture'

import ReactChartkick, { ColumnChart } from 'react-chartkick'
import Chart from 'chart.js'

import {
  MODEL_URL,
  MIN_CONFIDENCE,
  INPUT_SIZE,
  MIN_PROBABILITY,
} from 'src/config/recognition'

import {
  centroid,
  slope,
  distance,
  generateBoxWithXCentroid
} from 'src/helpers/math'

class RecognizeContainer extends Component {
  static async loadModels() {
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceExpressionModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
  }

  constructor(props) {
    super(props)

    this.state = {
      recognize: false,
      faceExpresions: []
    }

    this.fullFaceDescriptions = null

    this.webCamPicture = React.createRef()
    this.canvasPicWebCam = React.createRef()
    this.canvasFace = React.createRef()

    this.landmarkWebCamPicture = this.landmarkWebCamPicture.bind(this)
    this.runRecognition = this.runRecognition.bind(this)
    this.resetRecognition = this.resetRecognition.bind(this)
  }

  async componentDidMount() {
    await RecognizeContainer.loadModels()
    
    ReactChartkick.addAdapter(Chart)
  }

  async getFullFaceDescription(canvas) {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: INPUT_SIZE,
      scoreThreshold: MIN_CONFIDENCE
    })

    this.fullFaceDescriptions = await faceapi
      .detectAllFaces(canvas, options)
      .withFaceLandmarks()
      .withFaceExpressions()

    console.log(this.fullFaceDescriptions)
    
    if (this.fullFaceDescriptions && this.fullFaceDescriptions[0]) {
      const { landmarks, expressions } = this.fullFaceDescriptions[0]

      this.rightEyeCentroid = centroid(landmarks.getRightEye())
      this.leftEyeCentroid = centroid(landmarks.getLeftEye())
      this.faceAngle = Math.atan(slope(this.leftEyeCentroid, this.rightEyeCentroid))

      this.setState(() => ({
        faceExpresions: Object.entries(expressions)
      }))
    }
  }

  extractFaces(img) {
    const desiredFaceWidth = 256
    const desiredFaceHeight = desiredFaceWidth

    const desiredLeftEye = { x: 0.35, y: 0.2 }
    const desiredRightEyeX = 1.0 - desiredLeftEye.x
    
    // calculate scale to desired width
    const dist = distance(this.rightEyeCentroid, this.leftEyeCentroid)
    const desiredDist = (desiredRightEyeX - desiredLeftEye.x) * desiredFaceWidth
    
    const scale = desiredDist / dist

    // generate the box
    const eyesCentroid = centroid([this.leftEyeCentroid, this.rightEyeCentroid])
    const points = generateBoxWithXCentroid(eyesCentroid, desiredFaceWidth, desiredFaceHeight, desiredLeftEye)

    const offscreen = new OffscreenCanvas(this.canvasPicWebCam.current.width, this.canvasPicWebCam.current.height)
    const ctx = offscreen.getContext('2d')

    ctx.save()
    ctx.clearRect(0,0,this.canvasPicWebCam.current.width, this.canvasPicWebCam.current.height)
    ctx.translate(eyesCentroid.x, eyesCentroid.y)
    ctx.rotate(-this.faceAngle)
    ctx.scale(scale, scale)
    ctx.translate(-eyesCentroid.x, -eyesCentroid.y)
    ctx.drawImage(img, 0, 0)
    ctx.restore()

    // resize the new canvas to the size of the clipping area
    const ctxFace = this.canvasFace.current.getContext('2d')
    ctxFace.clearRect(0, 0, this.canvasFace.current.width, this.canvasFace.current.height)
    this.canvasFace.current.width = desiredFaceWidth
    this.canvasFace.current.height = desiredFaceHeight

    // draw the clipped image from the main canvas to the new canvas
    ctxFace.drawImage(offscreen.transferToImageBitmap(), points[0].x, points[0].y, desiredFaceWidth, desiredFaceHeight, 
      0, 0, desiredFaceWidth,desiredFaceHeight)
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
    
    const image = new Image()
    
    image.onload = async () => {
      ctx.drawImage(image, 0, 0)
      
      await this.getFullFaceDescription(this.canvasPicWebCam.current)

      if (this.fullFaceDescriptions[0]) {
        this.extractFaces(image)
        this.drawDescription(this.canvasPicWebCam.current)
      }
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
  }

  render() {
    const {
      recognize,
      faceExpresions
    } = this.state

    const {
      trans,
    } = this.props

    void trans

    return (
      <Container text>
        <Segment placeholder>
          <Grid columns={2}>
            <Grid.Row>
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
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <canvas ref={this.canvasFace} width={350} height={350} />
              </Grid.Column>
              <Grid.Column>
                { !Array.from(faceExpresions || []).length ? null : <ColumnChart data={faceExpresions} />}
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