import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button, Divider, Header } from 'semantic-ui-react'

import homeBackground from 'src-static/images/home-background.jpg'

const HomeContainer = props => {
  const {
    trans,
  } = props

  void trans

  return (
    <div id='home-container'>
      <div className='bg-image' style={{ backgroundImage: `url(${homeBackground})` }} />
      <div textAlign='center' className='bg-text'>
        <Header as='h2' inverted>
          { String(trans('home:title')).toUpperCase() }
          <Header.Subheader inverted>
            { trans('home:description') }
          </Header.Subheader>
        </Header>
        <Divider hidden />
        <Button
          as={Link}
          to='/game'
          basic
          inverted
          color='blue'
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
