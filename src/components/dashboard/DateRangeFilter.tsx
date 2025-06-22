
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter } from 'lucide-react';

export type DateRange = '7d' | '30d' | '90d' | '1y';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedRange,
  onRangeChange
}) => {
  const ranges = [
    { value: '7d' as DateRange, label: '7 dias', shortLabel: '7d' },
    { value: '30d' as DateRange, label: '30 dias', shortLabel: '30d' },
    { value: '90d' as DateRange, label: '90 dias', shortLabel: '90d' },
    { value: '1y' as DateRange, label: '1 ano', shortLabel: '1a' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Período de Análise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {ranges.map((range) => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRangeChange(range.value)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{range.label}</span>
              <span className="sm:hidden">{range.shortLabel}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DateRangeFilter;
