import _ from 'underscore'
import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Container, Card, Divider, Rating, Header, Responsive, Image, Transition } from 'semantic-ui-react'
import Slider from 'react-slick'
import Sound from 'react-sound'

import { withWindowDimensions } from 'src/helpers/window-size'
import { supportedExpressions } from 'src/config/recognition'
import * as scoreActions from 'src/actions/score-actions'
import levelSuccess from 'src-static/sound/level-success.mp3'

import label1 from 'src-static/images/label-1.png'
import label2 from 'src-static/images/label-2.png'
import label3 from 'src-static/images/label-3.png'

const labels = {
  label1,
  label2,
  label3,
}

class GameSummaryPage extends Component {
  componentDidMount() {
    const {
      setPictureHandler,
      setActive,
      actions: {
        onScoreFormClear,
        getScores,
      }
    } = this.props

    setActive('summary')
    setPictureHandler(() => null)
    onScoreFormClear()
    getScores()
  }

  render() {
    const {
      handleNextRound,
      trans,
      score: {
        collections: {
          scores,
        }
      },
    } = this.props

    const arrayedScores = Array.from(scores || [])

    const settings = {
      dots: true,
      draggable: true,
      infinite: true,
      autoplay: false,
      speed: 5000,
      autoplaySpeed: 500,
      cssEase: 'linear',
      slidesToShow: arrayedScores.length < 4 ? arrayedScores.length : 3,
      slidesToScroll: 1,
    }

    const scoresList = arrayedScores.reverse().map((score, i) => (
      <div
        key={`score-${i+1}`}
        style={{
          padding: '0.5px',
        }}
      >
        <Card
          style={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            paddingTop: '25px'
          }}
        > 
          <Image
            src={labels[`label${i+1}`]}
            size='tiny'
            floated='right'
            style={{
              position: 'absolute',
              top: '0px',
              right: '-13.5%',
              zIndex: 2001,
              backgroundColor: 'transparent',
            }}
          />
          <Image src={score.image} fluid style={{ backgroundColor: 'transparent' }} />
          <Card.Content style={{ position: 'absolute', bottom: 0, borderTopWidth: 0 }}>
            <Rating
              icon='star'
              size='massive'
              maxRating={5}
              rating={score.probability*5}
            />
          </Card.Content>
        </Card>
      </div>
    ))

    const expression = _.isEmpty(arrayedScores)
      ? null
      : supportedExpressions.find(expr => expr.name === arrayedScores[0].expression)

    return (
      <Fragment>
        {expression && (
          <Image
            size='tiny'
            src={expression.image}
            avatar
            style={{
              position: 'absolute',
              left: '5px',
              top: '5px',
              zIndex: 2000,
            }}
          />
        )}
    
        <Transition animation='zoom' visible={expression} duration={500}>
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
            {expression && (
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
                {trans('recognize:expl', { expression: trans(`recognize:expression.${expression.name}`) })}
              </Header>
            )}
          </center>
        </Transition>

        <Sound
          url={levelSuccess}
          playStatus={Sound.status.PLAYING}
          onFinishedPlaying={() => handleNextRound()}
        />

        <Container
          style={{
            paddingTop: '75px',
            position: 'absolute',
            top: '10%',
            right: '10%',
          }}
        >
          <Responsive {...Responsive.onlyMobile}>
            <Slider
              {...settings}
              slidesToShow={1}
              slidesToScroll={1}
            >
              {scoresList}
            </Slider>
          </Responsive>
          <Responsive {...Responsive.onlyTablet}>
            <Slider
              {...settings}
              slidesToShow={arrayedScores.length < 3 ? arrayedScores.length : 2}
              slidesToScroll={2}
            >
              {scoresList}
            </Slider>
          </Responsive>
          <Responsive minWidth={Responsive.onlyComputer.minWidth}>
            <Slider
              {...settings}
              slidesToShow={arrayedScores.length < 4 ? arrayedScores.length : 3}
              slidesToScroll={3}
            >
              {scoresList}
            </Slider>
          </Responsive>
          <Divider hidden />
        </Container>
      </Fragment>
    )
  }  
}

GameSummaryPage.propTypes = {
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

export default withWindowDimensions(connect(mapStateToProps, mapDispatchToProps)(GameSummaryPage))
