import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import * as faceapi from 'face-api.js'
import { Image as ImageComponent } from 'semantic-ui-react'

import { withWindowDimensions } from 'src/helpers/window-size'
import {
  MIN_CONFIDENCE,
  STEP_TIME,
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
  constructor(props) {
    super(props)

    this.state = {
      faceExpresions: [],
    }

    this.fullFaceDescriptions = null
    this.winnerDescription = null

    this.canvasPicWebCam = React.createRef()
    this.canvasFace = React.createRef()

    this.landmarkWebCamPicture = this.landmarkWebCamPicture.bind(this)
    this.runRecognition = this.runRecognition.bind(this)
    this.resetRecognition = this.resetRecognition.bind(this)
    this.endStep = this.endStep.bind(this)
    this.drawBox = this.drawBox.bind(this)
  }

  componentDidMount() {
    const { setPictureHandler, setActive } = this.props

    setActive('step')
    setPictureHandler(this.landmarkWebCamPicture)

    setTimeout(() => this.endStep(), STEP_TIME * 1000)
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

  drawBox(canvas, box, confidence) {
    const {
      expression: {
        minHigh: minHigh,
        maxHigh: maxHigh
      },
    } = this.props

    const ctx = canvas.getContext('2d')
    const lineWidth = 5
    const initialColor = 0x0040
    const finalColor = 0x00FF

    let color = '#00' + initialColor.toString(16) + initialColor.toString(16)
    if (confidence > minHigh) {
      let ratio = (confidence - minHigh)/(maxHigh - minHigh)
      if (ratio > 1) ratio = 1
      let intensity = Math.floor(initialColor + (finalColor - initialColor)*ratio)
      color = '#00' + intensity.toString(16) + initialColor.toString(16)
    }

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.strokeRect(box.x, box.y, box.width, box.height)
  }

  drawDescription(canvas, expression) {
    this.fullFaceDescriptions.forEach(
      ({ detection, expressions }) => {
        this.drawBox(canvas, detection.box, expressions[expression])
      }
    )
  }

  runRecognition() {
    if (!this.webCamPicture.current)
      return

    this.webCamPicture.current.capture()
    
  }

  resetRecognition() {
    const {
      handleNextStep,
    } = this.props

    handleNextStep(false)
  }

  endStep() {
    const {
      handleRecognition,
      expression: {
        name: expression,
      },
    } = this.props

    if (!(this.winnerDescription && this.winnerDescription.expressions[expression] > MIN_PROBABILITY)) {
      return this.resetRecognition()
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

    if (!this.canvasPicWebCam.current) {
      return
    }
    
    const ctx = this.canvasPicWebCam.current.getContext('2d')

    const image = new Image()

    image.onload = async () => {
      await this.getFullFaceDescription(image)
      
      if (this.fullFaceDescriptions && this.fullFaceDescriptions.length) {
        let frameWinnerDescription = winner(expression)(this.fullFaceDescriptions)
        
        if (!this.winnerDescription || (frameWinnerDescription && frameWinnerDescription.expressions[expression] > this.winnerDescription.expressions[expression])) {
          this.winnerDescription = frameWinnerDescription
        }
        
        if (!this.canvasPicWebCam.current || !this.canvasFace.current) {
          return
        }
        
        this.extractFaces(image)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
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
        image,
      },
    } = this.props
    
    void faceExpresions

    return (
      <Fragment>
        <canvas
          ref={this.canvasPicWebCam}
          width={windowWidth}
          height={windowHeight}
          style={{ position: 'absolute', transform: 'scaleX(-1)' }}
        />
        <ImageComponent
          size='small'
          src={image}
          avatar
          style={{
            position: 'absolute',
            left: '5px',
            top: '5px',
            zIndex: 2000,
          }}
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

export default connect(state => ({ score: state.score }))(withWindowDimensions(props => {
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
}))
