import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Divider,  } from 'semantic-ui-react'
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
      <div className='bg-text'>
        {/*<div className='cracked'>
          <span>{ trans('home:title') }</span>
          <span>{ trans('home:title') }</span>
          <span>{ trans('home:title') }</span>
        </div>*/}

        <div id='text-slicer-gradient'>
          {new Array(40).fill(1).map((_, i) => (
            <div key={`slice-${i+1}`} className='text'>{trans('home:title')}</div>
          ))}
        </div>

        <Divider hidden />
        <Link to='/game'>
          <button
            type='button'
            className='gradient-button'
          >
            { trans('home:option.recognize') }
          </button>
        </Link>
      </div>
    </div>
  )
}

HomeContainer.propTypes = {
  trans: PropTypes.func.isRequired,
}

export default HomeContainer
