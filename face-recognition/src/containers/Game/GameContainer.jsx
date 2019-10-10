import _ from 'underscore'
import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Modal, Image, Select } from 'semantic-ui-react'
import CountTo from 'react-count-to'
import Sound from 'react-sound'

import WebCamPicture from 'src/components/WebCamPicture'
import { withWindowDimensions } from 'src/helpers/window-size'
import GameRoutes from 'src/routes/game'
import * as scoreActions from 'src/actions/score-actions'
import {
  STEPS,
  REFRESH_TIME,
  STEP_TIME,
  supportedExpressions,
} from 'src/config/recognition'

import title from 'src-static/images/title.png'
import settings from 'src-static/images/settings.png'
import countdown from 'src-static/sound/countdown.mp3'
import camera from 'src-static/sound/camera.mp3'

class GameContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      expressions: _.sample(supportedExpressions, STEPS),
      devices: [],
      active: 'step',
      leftTime: 0,
      playCameraSound: false,
      landmarkWebCamPicture: () => null,
    }

    this.webCamPicture = React.createRef()
    this.endStep = () => null

    this.handleNextStep = this.handleNextStep.bind(this)
    this.handleNextRound = this.handleNextRound.bind(this)
    this.handleRecognitions = this.handleRecognitions.bind(this)
  }

  componentDidMount() {
    const {
      actions: {
        onScoreFormClear,
        setDevice,
      }
    } = this.props

    onScoreFormClear()
    
    navigator.mediaDevices.enumerateDevices()
      .then(devices => this.setState(() => {
        const mappedDevices = devices.filter(device => device.kind === 'videoinput').map(device => ({
          key: device.deviceId,
          value: device.deviceId,
          text: device.label,
        }))
        
        !_.isEmpty(mappedDevices) && setDevice(mappedDevices[0].value)
        
        return {
          devices: mappedDevices,
        } 
      }))
  }

  handleNextStep(next = true, summary = true) {
    const { expressions } = this.state
    const {
      history,
      actions: {
        onScoreFormClear,
      }
    } = this.props

    onScoreFormClear()

    if (summary) {
      setTimeout(() => history.push('/game/summary'), 1000)
      return
    }

    let current, nextExpressions
    
    if (_.isEmpty(expressions)) {
      [current, ...nextExpressions] = _.sample(supportedExpressions, STEPS)
    } else if (!next) {
      const [r] = _.shuffle(_.sample(supportedExpressions, STEPS))

      nextExpressions = [...expressions, r]
      current = expressions.shift()
    } else {
      [current, ...nextExpressions] = expressions
    }

    this.setState({
      leftTime: 0,
      playCameraSound: false,
      expressions: nextExpressions,
    })

    onScoreFormClear()

    history.replace('/game/step')
    setTimeout(() => {
      history.push(`/game/step/${current.name}`)
    })
  }

  handleRecognitions(recognitions) {
    const {
      actions: {
        onScoreFormFieldChange,
        addScore,
      }
    } = this.props

    _.forEach(recognitions, async ({expression, probability, image}) => {
      onScoreFormFieldChange('expression', expression)
      onScoreFormFieldChange('probability', probability)
      onScoreFormFieldChange('image', image)

      await addScore()
    })

    this.handleNextStep()
  }

  handleNextRound() {
    const {
      actions: {
        clearScores
      }
    } = this.props

    this.setState({
      active: 'step',
      landmarkWebCamPicture: () => null,
    })

    clearScores()
    this.handleNextStep(true, false)
  }

  render() {
    const { devices, active, landmarkWebCamPicture, leftTime, playCameraSound } = this.state

    const {
      t,
      trans,
      windowHeight,
      windowWidth,
      actions: {
        setDevice,
      },
      score: {
        device,
        form: {
          fields: {
            image,
          }
        }
      },
    } = this.props

    return (
      <Fragment>
        <GameRoutes
          t={t}
          trans={trans}
          handleNextStep={this.handleNextStep}
          handleNextRound={this.handleNextRound}
          handleRecognitions={this.handleRecognitions}
          initTimeout={(endStep) => {
            this.setState({ leftTime: STEP_TIME })

            this.endStep = endStep
          }}
          setActive={active => this.setState({ active })}
          setPictureHandler={handler => this.setState({ landmarkWebCamPicture: handler })}
        />
        <WebCamPicture
          ref={this.webCamPicture}
          landmarkPicture={landmarkWebCamPicture}
          refreshTime={REFRESH_TIME}
          height={windowHeight}
          width={windowWidth}
          screenshotFormat="image/jpeg"
          screenshotQuality={1}
          videoConstraints={{
            height: windowHeight,
            width: windowWidth,
            deviceId: device ? {
              exact: device,
            } : undefined,
          }}
          style={active === 'summary' ? {
            '-webkit-filter': 'blur(8px)',
            '-moz-filter': 'blur(8px)',
            '-ms-filter': 'blur(8px)',
            '-o-filter': 'blur(8px)',
            filter: 'blur(8px)',
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: -1,
          } : { position: 'absolute', top: 0, left: 0, zIndex: -1, }}
        />
        {active === 'step' && !!leftTime && (
          <Fragment>
            <CountTo
              from={leftTime}
              to={1}
              speed={leftTime * 1000}
              delay={1000}
              onComplete={() => {
                this.endStep()
                this.setState({ playCameraSound: true })
              }}
            >
              {value => (
                <center
                  size='huge'
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: '50%',
                    color: 'white',
                    fontSize: '40rem',
                    opacity: 0.6,
                  }}
                >
                  {value}
                </center>
              )}
            </CountTo>
            {!image && <Sound url={countdown} volume={50} playStatus={Sound.status.PLAYING} />}
          </Fragment>
        )}
        <Sound
          url={camera}
          playStatus={playCameraSound ? Sound.status.PLAYING : undefined}
          onComplete={() => {
            this.setState({ playCameraSound: false })
          }}
        />
        <Image
          inverted
          src={title}
          style={{
            position: 'absolute',
            top: '7%',
            left: '50%',
            height: '20%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <Modal
          dimmer='blurring'
          trigger={(
            <Image
              size='tiny'
              src={settings}
              avatar
              floated='right'
              style={{
                position: 'absolute',
                right: '5px',
                top: '5px',
                zIndex: 2001,
              }}
            />
          )}
        >
          <Modal.Content>
            <Select
              fluid
              value={device}
              loadind={!devices}
              options={devices}
              onChange={(e, {value}) => {
                setDevice(value)
              }}
            />
          </Modal.Content>
        </Modal>
      </Fragment>
    )
  }  
}

GameContainer.propTypes = {
  t: PropTypes.func.isRequired,
  trans: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  const { score } = state

  return {
    score
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...scoreActions,
    }, dispatch),
  }
}

export default withWindowDimensions(connect(mapStateToProps, mapDispatchToProps)(GameContainer))
