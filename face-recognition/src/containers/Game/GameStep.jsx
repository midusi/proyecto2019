import React, { Component, Fragment } from 'react'
import * as faceapi from 'face-api.js'
import WebCamPicture from 'src/components/WebCamPicture'
import { withWindowDimensions } from 'src/helpers/window-size'
import {
  MODEL_URL,
  MIN_CONFIDENCE,
  INPUT_SIZE,
  MIN_PROBABILITY,
  SCORE_WIDTH,
  SCORE_HEIGHT,
} from 'src/config/recognition'

import {
  centroid,
  slope,
  distance,
  generateBoxWithXCentroid
} from 'src/helpers/math'

class GameStepContainer extends Component {
  static async loadModels() {
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceExpressionModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
  }

  constructor(props) {
    super(props)

    this.state = {
      recognize: false,
      faceExpresions: [],
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
    await GameStepContainer.loadModels()
    
    setInterval(() => this.runRecognition(), 5000)
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
    ctxFace.drawImage(
      offscreen.transferToImageBitmap(),
      points[0].x, points[0].y,
      desiredFaceWidth, desiredFaceHeight, 
      0, 0,
      desiredFaceWidth,desiredFaceHeight
    )
  }

  drawDescription(canvas) {
    faceapi.draw.drawDetections(canvas, this.fullFaceDescriptions.map(({ detection }) => detection))
    faceapi.draw.drawFaceExpressions(canvas, this.fullFaceDescriptions, MIN_PROBABILITY)
  }

  runRecognition() {
    if (!this.webCamPicture.current)
      return

    this.webCamPicture.current.capture()
    
    this.setState(() => ({
      recognize: true,
    }))
  }

  resetRecognition() {
    this.setState(() => ({
      recognize: false,
    }))

    this.fullFaceDescriptions = null
  }

  landmarkWebCamPicture(picture) {
    const {
      match: {
        params: {
          expression,
        }
      },
      handleRecognition,
    } = this.props

    const ctx = this.canvasPicWebCam.current.getContext('2d')

    const image = new Image()
    
    image.onload = async () => {
      ctx.drawImage(image, 0, 0)

      await this.getFullFaceDescription(this.canvasPicWebCam.current)

      if (this.fullFaceDescriptions[0]) {
        this.extractFaces(image)
        this.drawDescription(this.canvasPicWebCam.current)
        
        handleRecognition(expression, this.canvasFace.current.toDataURL(), 1)
      }
    }
    
    image.src = picture
  }

  render() {
    const { recognize, faceExpresions } = this.state
    const { windowHeight, windowWidth } = this.props
    
    void recognize, faceExpresions

    return (
      <Fragment>
        <canvas
          ref={this.canvasPicWebCam}
          width={windowWidth}
          height={windowHeight}
          style={{ display: recognize ? undefined : 'none' }}
        />
        {recognize ? null : (
          <WebCamPicture
            ref={this.webCamPicture}
            landmarkPicture={this.landmarkWebCamPicture}
            height={windowHeight}
            width={windowWidth}
            videoConstraints={{
              height: windowHeight,
              width: windowWidth,
              facingMode: 'user',
            }}
          />
        )}
        <canvas
          style={{ visibility: 'hidden' }}
          ref={this.canvasFace}
          width={SCORE_WIDTH}
          height={SCORE_HEIGHT}
        />
      </Fragment>
      
    )
  }
}

export default withWindowDimensions(GameStepContainer)
