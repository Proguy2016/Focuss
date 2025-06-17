import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProductivityChart } from './ProductivityChart';
import { AnalyticsStats } from './AnalyticsStats';
import { ProductivityByHourChart } from './ProductivityByHourChart';

type Tab = 'weekly' | 'stats' | 'hourly';

export const TabbedCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('weekly');

  const renderContent = () => {
    switch (activeTab) {
      case 'weekly':
        return <ProductivityChart />;
      case 'stats':
        return <AnalyticsStats />;
      case 'hourly':
        return <ProductivityByHourChart />;
      default:
        return <ProductivityChart />;
    }
  };

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Productivity Overview</h3>
        <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
          <Button
            variant={activeTab === 'weekly' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stats')}
          >
            Stats
          </Button>
          <Button
            variant={activeTab === 'hourly' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('hourly')}
          >
            By Hour
          </Button>
        </div>
      </div>
      <div className="p-4">
        {renderContent()}
      </div>
    </Card>
  );
}; 