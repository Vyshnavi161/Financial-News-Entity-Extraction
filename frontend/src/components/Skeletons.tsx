import React from "react";

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-darkBorder animate-pulse">
      <div className="shimmer h-4 w-1/3 rounded mb-4"></div>
      <div className="shimmer h-8 w-2/3 rounded mb-2"></div>
      <div className="shimmer h-3 w-1/2 rounded"></div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="flex space-x-4">
        <div className="shimmer h-10 w-1/4 rounded"></div>
        <div className="shimmer h-10 w-1/2 rounded"></div>
        <div className="shimmer h-10 w-1/4 rounded"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="shimmer h-12 w-full rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-darkBorder w-full h-[300px] flex flex-col justify-between">
      <div className="shimmer h-5 w-1/4 rounded mb-4"></div>
      <div className="flex-1 flex items-end space-x-4 pb-2">
        <div className="shimmer h-[30%] w-full rounded"></div>
        <div className="shimmer h-[60%] w-full rounded"></div>
        <div className="shimmer h-[45%] w-full rounded"></div>
        <div className="shimmer h-[80%] w-full rounded"></div>
        <div className="shimmer h-[50%] w-full rounded"></div>
      </div>
    </div>
  );
};

export const TextSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 w-full">
      <div className="shimmer h-4 w-full rounded"></div>
      <div className="shimmer h-4 w-11/12 rounded"></div>
      <div className="shimmer h-4 w-4/5 rounded"></div>
      <div className="shimmer h-4 w-full rounded"></div>
      <div className="shimmer h-4 w-2/3 rounded"></div>
    </div>
  );
};
