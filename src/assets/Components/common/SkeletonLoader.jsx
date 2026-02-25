import React from "react";

const Skeleton = () => {
  return (
    <div className="h-screen w-screen bg-[#000] flex flex-col p-4 gap-4 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="flex gap-4 h-full">
        <div className="w-[72px] h-full bg-[#111] rounded-2xl hidden md:block" />

        {/* Chat List Skeleton */}
        <div className="w-full md:w-[350px] h-full flex flex-col gap-4">
          <div className="h-12 w-32 bg-[#111] rounded-lg" />
          <div className="h-10 w-full bg-[#111] rounded-xl" />
          <div className="flex flex-col gap-3 mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full bg-[#111]" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-24 bg-[#111] rounded" />
                  <div className="h-3 w-full bg-[#111] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Box Skeleton */}
        <div className="flex-1 h-full bg-[#0a0a0a] rounded-2xl hidden md:flex flex-col p-6 items-center justify-center gap-4">
          <div className="w-24 h-24 rounded-full bg-[#111]" />
          <div className="h-4 w-48 bg-[#111] rounded" />
          <div className="h-3 w-64 bg-[#111] rounded" />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
