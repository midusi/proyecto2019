import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button, Divider,  } from 'semantic-ui-react'
import Sound from 'react-sound'

import homeBackground from 'src-static/images/home-background.jpg'
import yee from 'src-static/sound/yee.mp3'

const HomeContainer = props => {
  const {
    trans,
  } = props

  void trans

  return (
    <div id='home-container'>
      <Sound url={yee} loop playStatus={Sound.status.PLAYING} />
      <div className='bg-image' style={{ backgroundImage: `url(${homeBackground})` }} />
      <div textAlign='center' className='bg-text'>
        <div className='cracked'>
          <span>{ trans('home:title') }</span>
          <span>{ trans('home:title') }</span>
          <span>{ trans('home:title') }</span>
        </div>
        <Divider hidden />
        <Button
          as={Link}
          size='huge'
          to='/game'
          color='facebook'
        >
          { trans('home:option.recognize') }
        </Button>
      </div>
    </div>
  )
}

HomeContainer.propTypes = {
  trans: PropTypes.func.isRequired,
}

export default HomeContainer
