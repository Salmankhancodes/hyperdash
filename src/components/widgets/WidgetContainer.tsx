import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface WidgetContainerProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
}

export default function WidgetContainer({
  title,
  children,
  actions,
  footer,
}: WidgetContainerProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">
          {title}
        </CardTitle>
        {actions && <div>{actions}</div>}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-2">
        {children}
      </CardContent>

      {footer && (
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </Card>
  );
}
