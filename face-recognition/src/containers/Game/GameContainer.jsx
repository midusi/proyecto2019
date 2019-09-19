import _ from 'underscore'
import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Modal, Icon, Image, Header, Button, Rating, Select } from 'semantic-ui-react'
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
  supportedExpressions as expressions,
} from 'src/config/recognition'

import settings from 'src-static/images/settings.png'
import countdown from 'src-static/sound/countdown.mp3'
import levelSuccess from 'src-static/sound/level-success.mp3'

class GameContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      expressions: _.shuffle(_.sample(expressions, STEPS)),
      devices: [],
      active: 'step',
      leftTime: 0,
      landmarkWebCamPicture: () => null,
    }

    this.webCamPicture = React.createRef()
    this.endStep = () => null

    this.handleNextStep = this.handleNextStep.bind(this)
    this.handleNextRound = this.handleNextRound.bind(this)
    this.handleRecognition = this.handleRecognition.bind(this)
  }

  componentDidMount() {
    const {
      actions: {
        onScoreFormClear,
        clearScores,
        setDevice,
      }
    } = this.props

    onScoreFormClear()
    clearScores()
    
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

  handleNextStep(next = true) {
    const { expressions } = this.state
    const {
      history,
      actions: {
        onScoreFormClear,
      }
    } = this.props

    if (_.isEmpty(expressions)) {
      history.push('/game/summary')
      return
    }

    const [current, ...rest] = expressions

    const [r] = _.shuffle(_.sample(expressions, STEPS))

    this.setState({
      leftTime: 0,
      expressions: next ? rest : [...rest, r],
    })

    onScoreFormClear()

    history.replace('/game/step')
    setTimeout(() => {
      next ?
        history.push(`/game/step/${current.name}`) :
        history.push(`/game/step/${[...rest, r][0].name}`)
    })
  }

  handleRecognition(expression, image, probability) {
    const {
      actions: {
        onScoreFormFieldChange,
        addScore,
      }
    } = this.props

    onScoreFormFieldChange('expression', expression)
    onScoreFormFieldChange('probability', probability)
    onScoreFormFieldChange('image', image)

    addScore()

    setTimeout(() => this.handleNextStep(), 5000)
  }

  handleNextRound() {
    this.setState({
      expressions: _.shuffle(_.sample(expressions, STEPS)),
      active: 'step',
      landmarkWebCamPicture: () => null,
    })

    this.handleNextStep()
  }

  render() {
    const { devices, active, landmarkWebCamPicture, leftTime } = this.state

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
            expression,
            probability,
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
          handleRecognition={this.handleRecognition}
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
              onComplete={() => this.endStep()}
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
            {!image && leftTime && <Sound url={countdown} volume={50} playStatus={Sound.status.PLAYING} />}
          </Fragment>
        )}
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
        <Modal dimmer='blurring' open={!!image}>
          <Modal.Header>{trans('recognize:winner')}</Modal.Header>
          <Modal.Content image>
            <Sound url={levelSuccess} playFromPosition={250} playStatus={Sound.status.PLAYING} />
            <Image wrapped size='medium' src={image} style={{ transform: 'scaleX(-1)' }} />
            <Modal.Description>
              <Header>{trans(`recognize:expression.${expression}`)}</Header>
              <Rating
                icon='star'
                size='massive'
                maxRating={5}
                rating={probability*5}
              />
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color='blue' onClick={() => this.handleNextStep()}>
              {trans('recognize:options.next')}
              <Icon name='chevron right' />
            </Button>
          </Modal.Actions>
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
