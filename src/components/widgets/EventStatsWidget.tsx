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
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide"
           title="Events successfully processed per second. This is the effective throughput after degradation filtering.">
          Current Throughput
        </p>
        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{eventThisSec}</p>
        <p className="text-xs text-muted-foreground mt-1">processed events per second</p>
      </div>

      {/* Total Processed */}
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide"
           title="Cumulative count of events that were computed and committed to the UI since the session started.">
          Total Processed
        </p>
        <p className="text-2xl font-semibold">{totalEvents.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">since session start</p>
      </div>
    </div>
  </WidgetContainer>
}

export default EventStatsWidget