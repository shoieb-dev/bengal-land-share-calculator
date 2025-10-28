import { User, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface FamilyMember {
  name: string;
  percentage: string;
  generation: number;
  children?: FamilyMember[];
  note?: string;
  isDeceased?: boolean;
  isMale?: boolean;
}

interface HorizontalFamilyTreeProps {
  tree: FamilyMember[];
}

export default function HorizontalFamilyTree({ tree }: HorizontalFamilyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [scale, setScale] = useState(0.6);

  // Mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollLeft(containerRef.current.scrollLeft);
    setScrollTop(containerRef.current.scrollTop);
    containerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX) * 2; // Multiply for faster scroll
    const walkY = (y - startY) * 2;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
  };

  // Zoom with scroll wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 3);
      setScale(newScale);
    }
  };

  // Zoom buttons
  const zoomIn = () => {
    setScale(Math.min(scale + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(0.6);
  };

  const renderPerson = (member: FamilyMember) => (
    <div className="flex flex-col items-center pointer-events-none">
      {/* Person Card */}
      <div className={`relative w-32 ${member.isDeceased ? "opacity-80" : ""}`}>
        {/* Avatar/Icon */}
        <div
          className={`w-1/2 mx-auto rounded-lg flex items-center justify-center mb-2 ${
            member.isMale ? "bg-linear-to-br from-blue-600 to-blue-800" : "bg-linear-to-br from-pink-600 to-pink-800"
          } border-4 ${
            member.generation === 0
              ? "border-yellow-500"
              : member.generation === 1
              ? "border-blue-400"
              : "border-green-400"
          }`}
        >
          <User size={48} className="text-white" />
        </div>

        {/* Name and Info */}
        <div className="text-center">
          <div
            className={`font-bold text-sm mb-1 ${member.isDeceased ? "text-gray-400 line-through" : "text-gray-100"}`}
          >
            {member.name}
          </div>

          {/* Percentage Badge */}
          <div
            className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
              member.generation === 0 ? "bg-yellow-600" : member.generation === 1 ? "bg-blue-600" : "bg-green-600"
            } text-white`}
          >
            {member.percentage}
          </div>

          {member.note && <div className="text-xs text-gray-500 mt-1">{member.note}</div>}

          {member.isDeceased && <div className="text-xs text-red-400 mt-1">মৃত</div>}
        </div>
      </div>
    </div>
  );

  const renderGeneration = (members: FamilyMember[], generation: number) => (
    <div className="flex flex-col items-center">
      {/* Generation Label */}
      <div
        className={`text-xs font-semibold mb-4 px-3 py-1 rounded-full ${
          generation === 0
            ? "bg-yellow-900 text-yellow-300"
            : generation === 1
            ? "bg-blue-900 text-blue-300"
            : "bg-green-900 text-green-300"
        }`}
      >
        {generation === 0
          ? "১ম প্রজন্ম (মূল ভাই)"
          : generation === 1
          ? "২য় প্রজন্ম (সন্তান)"
          : "৩য় প্রজন্ম (নাতি-নাতনি)"}
      </div>

      {/* Members Row */}
      <div className="flex gap-8 items-start">
        {members.map((member, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {renderPerson(member)}

            {/* Vertical Line Down */}
            {member.children && member.children.length > 0 && <div className="w-0.5 h-8 bg-gray-600 my-2"></div>}

            {/* Children Container */}
            {member.children && member.children.length > 0 && (
              <div className="relative">
                {/* Horizontal Line */}
                {member.children.length > 1 && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 bg-gray-600"
                    style={{
                      width: `${(member.children.length - 1) * 25}rem`,
                      left: "45%",
                      transform: "translateX(-50%)",
                    }}
                  />
                )}

                {/* Children */}
                <div className="flex gap-8 pt-8">
                  {member.children.map((child, childIdx) => (
                    <div key={childIdx} className="relative">
                      {/* Vertical Line Up to Parent */}
                      <div className="absolute bottom-full left-1/2 w-0.5 h-8 bg-gray-600 -translate-x-1/2"></div>

                      {renderPerson(child)}

                      {/* Grandchildren */}
                      {child.children && child.children.length > 0 && (
                        <div className="relative">
                          <div className="w-0.5 h-8 bg-gray-600 my-2 mx-auto"></div>

                          {child.children.length > 1 && (
                            <div
                              className="absolute top-8 left-0 right-0 h-0.5 bg-gray-600"
                              style={{
                                width: `${(child.children.length - 1) * 10}rem`,
                                left: "50%",
                                transform: "translateX(-50%)",
                              }}
                            />
                          )}

                          <div className="flex gap-8 pt-8">
                            {child.children.map((grandchild, gcIdx) => (
                              <div key={gcIdx} className="relative">
                                <div className="absolute bottom-full left-1/2 w-0.5 h-8 bg-gray-600 -translate-x-1/2"></div>
                                {renderPerson(grandchild)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg mb-4 overflow-hidden">
      {/* Header with Zoom Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <h5 className="font-semibold text-gray-200 text-lg">পরিবার বৃক্ষ (বি এস খতিয়ান অনুযায়ী)</h5>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">জুম: {Math.round(scale * 100)}%</span>
          <div className="flex gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Zoom Out (Ctrl + Scroll Down)"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={resetZoom}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              title="Reset Zoom"
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={zoomIn}
              disabled={scale >= 3}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Zoom In (Ctrl + Scroll Up)"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 bg-blue-900 bg-opacity-30 border-b border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          💡 টিপস: মাউস দিয়ে টেনে সরান • Ctrl + স্ক্রল করে জুম করুন • জুম বাটন ব্যবহার করুন
        </p>
      </div>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="overflow-auto cursor-grab select-none"
        style={{
          maxHeight: "60vh",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <div
          ref={contentRef}
          className="min-w-max p-2 transition-transform duration-100"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {renderGeneration(tree, 0)}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="text-xs text-gray-400 mb-3 text-center">প্রজন্ম:</div>
        <div className="flex justify-center gap-6 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded border-2 border-yellow-500"></div>
            <span className="text-gray-300">১ম প্রজন্ম</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded border-2 border-blue-400"></div>
            <span className="text-gray-300">২য় প্রজন্ম</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded border-2 border-green-400"></div>
            <span className="text-gray-300">৩য় প্রজন্ম</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-700 rounded"></div>
            <span className="text-gray-300">পুরুষ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-700 rounded"></div>
            <span className="text-gray-300">মহিলা</span>
          </div>
        </div>
      </div>
    </div>
  );
}
