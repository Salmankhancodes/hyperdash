import useEventStore from "@/store/useEventStore";
import WidgetContainer from "./WidgetContainer";

const LogsWidget = () => {
  const events = useEventStore((s) => s.eventsBuffer);

  const recent = events.slice(-200).reverse();

  return (
    <WidgetContainer title="Logs">
      <div className="space-y-1 max-h-64 overflow-auto text-xs">
        {recent.map((e, i) => (
          <div key={i} className="text-muted-foreground">
            Event {events.length - i}: {e}
          </div>
        ))}
      </div>
    </WidgetContainer>
  );
};

export default LogsWidget
