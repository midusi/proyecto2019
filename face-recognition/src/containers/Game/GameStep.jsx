import _ from 'underscore'
import React, { PureComponent, Fragment } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import * as faceapi from 'face-api.js'
import { Image as ImageComponent, Transition, Header } from 'semantic-ui-react'

import { withWindowDimensions } from 'src/helpers/window-size'
import {
  MIN_CONFIDENCE,
  INPUT_SIZE,
  MIN_PROBABILITY,
  SCORE_WIDTH,
  SCORE_HEIGHT,
  MIN_CONSISTENCY,
  supportedExpressions,
} from 'src/config/recognition'

import { winners } from 'src/helpers/face'
import {
  centroid,
  slope,
  distance,
  generateBoxWithXCentroid
} from 'src/helpers/math'

class GameStepContainer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      visible: false,
      started: false,
    }

    this.fullFaceDescriptions = null
    this.winnersDescription = null
    this.framesTimeout = null
    this.winnerImage = null

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

    this.setState({ visible: true, })
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
  }

  gameStarter(winners){
    const {
      initTimeout,
      expression: {
        name: expression,
      }
    } = this.props

    if( this.fullFaceDescriptions && winners[0].expressions[expression] > MIN_PROBABILITY){
      if (this.framesTimeout == null){
        this.framesTimeout = Date.now()
      }
    } else{
      this.framesTimeout = null
    }

    if (this.framesTimeout != null && this.framesTimeout != 0 && Date.now() - this.framesTimeout > MIN_CONSISTENCY) {
      this.framesTimeout = null
      this.setState({ started: true })
      initTimeout(this.endStep)
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
    const lineWidth = 6
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
    ctx.strokeRect(box.x, box.y - 75, box.width, box.height + 75)
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

    handleNextStep(false, false)
  }

  endStep() {
    const {
      handleRecognitions,
      expression: {
        name: expression,
      },
    } = this.props

    this.setState({ started: false, visible: false })

    if (_.isEmpty(this.winnersDescription)) {
      return this.resetRecognition()
    }

    handleRecognitions(_.map(this.winnersDescription, winnerDescription => {
      const { landmarks } = winnerDescription
      this.rightEyeCentroid = centroid(landmarks.getRightEye())
      this.leftEyeCentroid = centroid(landmarks.getLeftEye())
      this.faceAngle = Math.atan(slope(this.leftEyeCentroid, this.rightEyeCentroid))
      this.extractFaces(this.winnerImage)

      return {
        expression,
        image: this.canvasFace.current.toDataURL(),
        probability: winnerDescription.expressions[expression],
      }
    }))
  }

  landmarkWebCamPicture(picture) {
    const { started } = this.state

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
        this.winnersDescription = winners(expression)(this.fullFaceDescriptions)
        this.winnerImage = image

        if (!started){
          this.gameStarter(this.winnersDescription)
        }
        
        if (!this.canvasPicWebCam.current || !this.canvasFace.current) {
          return
        }
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        this.drawDescription(this.canvasPicWebCam.current, expression)
      }

    }

    image.src = picture
  }

  render() {
    const { visible, started } = this.state

    const {
      windowHeight,
      windowWidth,
      trans,
      expression: {
        image,
        name,
      },
    } = this.props

    return (
      <Fragment>
        <canvas
          ref={this.canvasPicWebCam}
          width={windowWidth}
          height={windowHeight}
          style={{ position: 'absolute', transform: 'scaleX(-1)' }}
        />
        <Transition animation='zoom' visible={visible && !started} duration={500}>
          <center
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              color: 'white',
              zIndex: 2000,
              overflowY: 'hidden',
            }}
          >
            <ImageComponent
              size='large'
              src={image}
              avatar
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.63,
              }}
            />
            <Header
              inverted
              style={{
                position: 'absolute',
                bottom: '25px',
                left: '50%',
                transform: 'translate(-50%, 20%)',
                textTransform: 'uppercase',
                fontSize: '12.53rem',
              }}
            >
              {trans('recognize:expl', { expression: trans(`recognize:expression.${name}`) })}
            </Header>
          </center>
        </Transition>
        <Transition animation='zoom' visible={visible && started} duration={500}>
          <ImageComponent
            size='tiny'
            src={image}
            avatar
            style={{
              position: 'absolute',
              left: '5px',
              top: '5px',
              zIndex: 2000,
            }}
          />
        </Transition>
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
