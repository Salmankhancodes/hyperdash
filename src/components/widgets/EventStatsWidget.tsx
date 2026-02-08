import { useRenderCount } from '@/hooks/useRenderCount'
import WidgetContainer from './WidgetContainer'
import useEventStore from '@/store/useEventStore'

const EventStatsWidget = () => {
  useRenderCount('EventStatsWidget')
  const eventThisSec =  useEventStore(s => s.eventThisSec);
  const totalEvents = useEventStore(s => s.totalEvents);
  return <WidgetContainer title='Event Streams'>
    <div className="space-y-4">
      {/* Current Rate */}
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Current Ingestion Rate</p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{eventThisSec}</p>
        <p className="text-xs text-muted-foreground mt-1">events per second</p>
      </div>

      {/* Total Processed */}
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Processed</p>
        <p className="text-2xl font-semibold">{totalEvents.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">since session start</p>
      </div>
    </div>
  </WidgetContainer>
}

export default EventStatsWidget