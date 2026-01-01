import WidgetContainer from '@/components/widgets/WidgetContainer'
import React from 'react'

const MyChild = () => <>Hello world</>

const dash2 = () => {
  return (
      <WidgetContainer title='title' children={<MyChild />} actions={<MyChild />} />
  )
}

export default dash2