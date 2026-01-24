import { useRenderCount } from '@/hooks/useRenderCount'
import WidgetContainer from './WidgetContainer'
import useEventStore from '@/store/useEventStore'

const EventStatsWidget = () => {
  useRenderCount('EventStatsWidget')
  const {
    eventThisSec,
    totalEvents,
    workerEnabled
  } = useEventStore()
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

      {/* Processing Mode */}
      <div className="pt-3 border-t">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Processing Mode</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            workerEnabled 
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
              : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
          }`}>
            {workerEnabled ? '⚡ Web Worker' : '🔄 Main Thread'}
          </span>
          <span className="text-xs text-muted-foreground">
            {workerEnabled ? 'Offloaded' : 'Processing locally'}
          </span>
        </div>
      </div>
    </div>
  </WidgetContainer>
}

export default EventStatsWidget