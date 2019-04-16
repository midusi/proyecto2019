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
} from 'src/config/recognition'

import { centroid, slope, detectionCoordinates, rotate } from './mathHelper'

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

    ReactChartkick.addAdapter(Chart)
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
      .withFaceLandmarks()
    
    if (this.fullFaceDescriptions[0]){
      this.faceAngle = Math.atan(slope(centroid(this.fullFaceDescriptions[0].landmarks.getLeftEye()),centroid(this.fullFaceDescriptions[0].landmarks.getRightEye())))
      this.setState(() => (
        {faceExpresions: this.fullFaceDescriptions[0].expressions.map(
          (expression) => {return [expression.expression, expression.probability]}
        )}
      ))
    }
  }

  extractFaces(img){
    var points = detectionCoordinates(this.fullFaceDescriptions[0].detection.box)
    var width=this.fullFaceDescriptions[0].detection.box.width
    var height=this.fullFaceDescriptions[0].detection.box.height
    var xc = points[0].x + width/2
    var yc = points[0].y + height/2
    for(i=0;i<points.length;i++){
      p = points[i]
      points[i] = rotate(xc, yc, p.x, p.y, -this.faceAngle)
    }
    // calculate the size of the user's clipping area
    var minX=10000;
    var minY=10000;
    var maxX=-10000;
    var maxY=-10000;
    var i, p
    for(i=0;i<points.length;i++){
      p=points[i];
      if(p.x<minX){minX=p.x;}
      if(p.y<minY){minY=p.y;}
      if(p.x>maxX){maxX=p.x;}
      if(p.y>maxY){maxY=p.y;}
    }
    width=maxX-minX;
    height=maxY-minY;

    // clip the image into the user's clipping area
    var offscreen = new OffscreenCanvas(this.canvasPicWebCam.current.width, this.canvasPicWebCam.current.height);
    var ctx = offscreen.getContext('2d')
    ctx.save();
    ctx.clearRect(0,0,this.canvasPicWebCam.current.width, this.canvasPicWebCam.current.height);
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    for(i=1;i<points.length;i++){
      p=points[i];
      ctx.lineTo(points[i].x,points[i].y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img,0,0);
    ctx.restore();

    // resize the new canvas to the size of the clipping area
    const ctxFace = this.canvasFace.current.getContext('2d')
    ctxFace.clearRect(0, 0, this.canvasFace.current.width, this.canvasFace.current.height)
    this.canvasFace.current.width=width;
    this.canvasFace.current.height=height;

    // draw the clipped image from the main canvas to the new canvas
    ctxFace.save()
    ctxFace.translate(width/2, height/2); //let's translate
    ctxFace.rotate(-this.faceAngle)
    ctxFace.translate(-(width/2), -(height/2)); //let's translate
    ctxFace.drawImage(offscreen.transferToImageBitmap(), minX,minY,width,height, 0,0,width,height);
    ctxFace.restore()
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

    faceapi.drawDetection(canvas, drawableDetections)
    faceapi.drawFaceExpressions(canvas, drawableExpressions)
  }

  landmarkWebCamPicture(picture) {
    const ctx = this.canvasPicWebCam.current.getContext('2d')
    // const ctxFace = this.canvasFace.current.getContext('2d')
    
    var image = new Image()
    
    image.onload = async () => {
      ctx.drawImage(image, 0, 0)
      
      await this.getFullFaceDescription(this.canvasPicWebCam.current)
      if (this.fullFaceDescriptions[0]){
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
                { faceExpresions == [] ? null : <ColumnChart data={faceExpresions} />}
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
