"use client";
import { useEffect, useRef, useState } from "react";
import { useScrollSync } from "@/app/components/useScrollSync";

const boucle = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const THUMBD_WIDTH = 55;
const INTEREST_POINTS = [5, 10, 15];
export default function Home() {
  const div1 = useRef<HTMLDivElement>(null);
  const div2 = useRef<HTMLDivElement>(null);
  useScrollSync([div1, div2]);

  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [thumbLeftPosition, setThumbLeftPosition] = useState(0);
  const [markerPositions, setMarkerPositions] = useState<{ [key: string]: number }>({});


  const handleScroll = (e: any) => {
    const scrollLeft = e?.target?.scrollLeft;
    const scrollWidth = e.target!.scrollWidth - e.target!.clientWidth;

    if (div1?.current) {
      div1.current.scrollLeft = scrollLeft;
    }
    if (div2?.current) {
      div2.current.scrollLeft = scrollLeft;
    }
    const clientWidth = trackRef?.current?.clientWidth;
    if (clientWidth) {
      let position = (+scrollLeft / +scrollWidth) * clientWidth;
      position = Math.min(position, clientWidth - THUMBD_WIDTH);


      setThumbLeftPosition(position);
    }
  };


  useEffect(() => {
    // Calcul des positions des marqueurs
    const divPositions = INTEREST_POINTS.reduce<{ [key: string]: number }>((acc, el) => {
      const elRef = document?.getElementById(el?.toString());

      if (elRef) {
        const rect = elRef.getBoundingClientRect();
        acc[elRef.textContent!] = (rect.left - div1.current!.getBoundingClientRect().left) / div1.current!.scrollWidth * 100;
      }
      return acc;
    }, {});
    setMarkerPositions(divPositions);
  }, []);
  const handleMouseUp = () => {
    setIsDragging(false);
  };


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && thumbRef.current && trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const trackWidth = rect.width;
        const thumbWidth = THUMBD_WIDTH;
        let position = e.pageX - rect.left - (thumbWidth / 2); // Adjust for thumb's half width;

        // Ensure position stays within bounds
        position = Math.max(0, Math.min(position, trackWidth - thumbWidth));

        // Convert position to percentage
        const percentage = (position / (trackWidth - thumbWidth)) * 100;
        setThumbLeftPosition(position);

        // Convert percentage to scrollLeft value
        const scrollLeft = (percentage / 100) * (div1.current!.scrollWidth - div1.current!.clientWidth);
        div1.current!.scrollLeft = scrollLeft;
        div2.current!.scrollLeft = scrollLeft;
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    if (div1.current) {
      div1.current.addEventListener("scroll", handleScroll);
    }
    if (div2.current) {
      div2.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (div1.current) {
        div1.current.removeEventListener("scroll", handleScroll);
      }
      if (div2.current) {
        div2.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleMouseMove, isDragging]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <main className="h-screen w-screen space-y-2">
      <div className={"flex overflow-x-scroll bg-red-50 w-full"} ref={div1} onScroll={handleScroll}>
        {boucle?.map((el) => (
          <div key={el} className={"border border-teal-500 h-10"}>
            <p className={"min-w-96"}>{el}</p>
          </div>
        ))}
      </div>

      <div className={"flex overflow-x-scroll bg-yellow-50 w-full"} ref={div2} onScroll={handleScroll}>
        {boucle?.map((el) => (
          <div key={el} className={"border border-teal-500 h-10"} id={el?.toString()}>
            <p className={"min-w-96"}>{el}</p>
          </div>
        ))}
      </div>

      {/* SCROLLBAR */}
      <div
        className={"w-full bg-slate-50 h-4 relative rounded-md"}
        ref={trackRef}
        style={{ cursor: "pointer", overflowX: "hidden" }}
      >
        <div
          ref={thumbRef}
          className={"absolute bg-red-500 h-4   rounded-md  overflow-hidden"}
          style={{
            left: `${thumbLeftPosition}px`,
            width: `${THUMBD_WIDTH}px`,
            cursor: isDragging ? "grabbing" : "grab"
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Marqueurs */}
        {Object.entries(markerPositions).map(([key, value]) => (
          <div
            key={key}
            className="absolute bg-blue-500 w-1 h-full top-0 pointer-events-none"
            style={{ left: `${value}%`, transform: "translateX(-50%)" }}
          />
        ))}
      </div>

    </main>
  );
}