import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Container, Card, Divider, Rating, Responsive } from 'semantic-ui-react'
import Slider from 'react-slick'
import Sound from 'react-sound'

import { withWindowDimensions } from 'src/helpers/window-size'
import * as scoreActions from 'src/actions/score-actions'
import levelSuccess from 'src-static/sound/level-success.mp3'

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
      autoplay: true,
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
          padding: '0.5px'
        }}
      >
        <Card
          image={score.image}
          header={score.expression}
          meta={trans('recognize:probability')}
          style={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }}
          description={(
            <Rating
              icon='star'
              size='massive'
              maxRating={5}
              rating={score.probability*5}
            />
          )}
        />
      </div>
    ))

    return (
      <Fragment>
        <Sound url={levelSuccess} playStatus={Sound.status.PLAYING} onFinishedPlaying={() => handleNextRound()} />
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
