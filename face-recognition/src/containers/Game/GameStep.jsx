import React, { Component, Fragment } from 'react'
import { Redirect } from 'react-router-dom'
import * as faceapi from 'face-api.js'
import { Button } from 'semantic-ui-react'

import WebCamPicture from 'src/components/WebCamPicture'
import { withWindowDimensions } from 'src/helpers/window-size'
import {
  MODEL_URL,
  MIN_CONFIDENCE,
  INPUT_SIZE,
  MIN_PROBABILITY,
  SCORE_WIDTH,
  SCORE_HEIGHT,
  supportedExpressions,
} from 'src/config/recognition'

import { winner } from 'src/helpers/face'
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
      faceExpresions: [],
    }

    this.fullFaceDescriptions = null
    this.winnerDescription = null

    this.webCamPicture = React.createRef()
    this.canvasPicWebCam = React.createRef()
    this.canvasFace = React.createRef()

    this.landmarkWebCamPicture = this.landmarkWebCamPicture.bind(this)
    this.runRecognition = this.runRecognition.bind(this)
    this.resetRecognition = this.resetRecognition.bind(this)
    this.endStep = this.endStep.bind(this)
    this.drawBox = this.drawBox.bind(this)
  }

  async componentDidMount() {
    await GameStepContainer.loadModels()
    
    setInterval(() => this.runRecognition(), 10)
    setTimeout(() => this.endStep(), 5000)
  }

  async getFullFaceDescription(canvas) {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: INPUT_SIZE,
      scoreThreshold: MIN_CONFIDENCE
    })

    const {
      expression: {
        name: expression,
      }
    } = this.props

    const winnerForExpression = winner(expression)

    this.fullFaceDescriptions = await faceapi
      .detectAllFaces(canvas, options)
      .withFaceLandmarks()
      .withFaceExpressions()

    if (this.fullFaceDescriptions && winnerForExpression(this.fullFaceDescriptions)) {
      const { landmarks, expressions } = winnerForExpression(this.fullFaceDescriptions)

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
    
    const scale = desiredDist/dist

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

  drawBox(canvas, box, confidence){
    const {
      expression: {
        minHigh: minHigh,
        maxHigh: maxHigh
      },
    } = this.props

    let ctx = canvas.getContext('2d')
    const lineWidth = 2
    const initialColor = 0x40
    const finalColor = 0xFF
    let color = '#' + initialColor.toString(16) + '0000'
    if (confidence > minHigh){
      let ratio = (confidence - minHigh)/(maxHigh - minHigh)
      if (ratio > 1) ratio = 1
      let intensity = Math.floor(initialColor + (finalColor - initialColor)*ratio)
      color = '#' + intensity.toString(16) + '0000'  
    }
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.strokeRect(box.x, box.y, box.width, box.height)
  }

  drawDescription(canvas, expression) {
    // faceapi.draw.drawDetections(canvas, this.fullFaceDescriptions.map(({ detection }) => detection))
    // faceapi.draw.drawFaceExpressions(canvas, this.fullFaceDescriptions, MIN_PROBABILITY)
    this.fullFaceDescriptions.forEach(
      ({ detection, expressions }) => {
        if(expressions[expression] > MIN_PROBABILITY){
          GameStepContainer.drawBox(canvas, detection.box, expressions[expression])
        }
      }
    )
  }

  runRecognition() {
    if (!this.webCamPicture.current)
      return

    this.webCamPicture.current.capture()
    
  }

  resetRecognition() {

    setTimeout(() => this.endStep(), 5000)
  }

  endStep(){
    const {
      handleRecognition,
      expression: {
        name: expression,
      },
    } = this.props

    if (!(this.winnerDescription && this.winnerDescription.expressions[expression] > MIN_PROBABILITY)) {
      this.resetRecognition()
      return
    }

    handleRecognition(
      expression,
      this.canvasFace.current.toDataURL(),
      this.winnerDescription.expressions[expression]
    )

  }

  landmarkWebCamPicture(picture) {
    const {
      expression: {
        name: expression,
      },
    } = this.props
    
    const ctx = this.canvasPicWebCam.current.getContext('2d')

    const image = new Image()

    image.onload = async () => {
      ctx.drawImage(image, 0, 0)
      await this.getFullFaceDescription(this.canvasPicWebCam.current)

      if (this.fullFaceDescriptions && this.fullFaceDescriptions.length){
        let frameWinnerDescription = winner(expression)(this.fullFaceDescriptions)

        if (!this.winnerDescription || (frameWinnerDescription && frameWinnerDescription.expressions[expression] > this.winnerDescription.expressions[expression])){
          this.winnerDescription = frameWinnerDescription
        }

        this.extractFaces(image)
        this.drawDescription(this.canvasPicWebCam.current, expression)  
      }

    }

    image.src = picture
  }

  render() {
    const { faceExpresions } = this.state
    const {
      windowHeight,
      windowWidth,
      expression: {
        icon,
      },
    } = this.props
    
    void faceExpresions

    return (
      <Fragment>
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
          style={{ position: 'absolute' }}
        />
        <canvas
          ref={this.canvasPicWebCam}
          width={windowWidth}
          height={windowHeight}
          style={{ position: 'absolute' }}
        />
        <Button
          size='huge'
          icon={icon}
          color='orange'
          circular
          basic
          floated='left'
          style={{ position: 'absolute' }}
        />
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

export default withWindowDimensions(props => {
  const {
    match: {
      params: {
        expression,
      }
    }
  } = props

  const found = supportedExpressions.find(expr => expr.name === expression)

  if (!found) {
    return <Redirect to='/game' />
  }

  return <GameStepContainer {...props} expression={found} />
})
