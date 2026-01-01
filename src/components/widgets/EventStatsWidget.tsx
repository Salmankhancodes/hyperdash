import WidgetContainer from './WidgetContainer'
import useEventStore from '@/store/useEventStore'

const EventStatsWidget = () => {
  const {
    eventThisSec,
    totalEvents
  } = useEventStore()
  return <WidgetContainer title='Event Streams'>
    <p className="text-sm text-muted-foreground">
      Events/sec: {eventThisSec}
    </p>
    <p className="text-sm text-muted-foreground">
      Total events: {totalEvents}
    </p>
  </WidgetContainer>
}

export default EventStatsWidget