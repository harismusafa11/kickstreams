"use client";

import { SPORT_CATEGORIES, type SportCategory } from "@/lib/api";
import { LayoutGrid } from "lucide-react";
import type { ReactNode } from "react";

const iconMap: Record<string, ReactNode> = {
  All: <LayoutGrid size={14} />,
  Soccer: <span style={{ fontSize: "14px" }}>⚽</span>,
  Basketball: <span style={{ fontSize: "14px" }}>🏀</span>,
  Football: <span style={{ fontSize: "14px" }}>🏈</span>,
  Hockey: <span style={{ fontSize: "14px" }}>🏒</span>,
  Baseball: <span style={{ fontSize: "14px" }}>⚾</span>,
  Combat: <span style={{ fontSize: "14px" }}>🥊</span>,
  Racing: <span style={{ fontSize: "14px" }}>🏎️</span>,
  Tennis: <span style={{ fontSize: "14px" }}>🎾</span>,
  Cricket: <span style={{ fontSize: "14px" }}>🏏</span>,
};

interface SportTabsProps {
  activeCategory: SportCategory;
  onCategoryChange: (category: SportCategory) => void;
  counts?: Record<string, number>;
}

export default function SportTabs({
  activeCategory,
  onCategoryChange,
  counts,
}: SportTabsProps) {
  return (
    <div className="sport-tabs" id="sport-tabs">
      {SPORT_CATEGORIES.map((cat) => {
        const count = counts?.[cat] ?? 0;
        return (
          <button
            key={cat}
            className={`sport-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => onCategoryChange(cat)}
            id={`tab-${cat.toLowerCase()}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {iconMap[cat] || <span>🏆</span>}
            {cat}
            {counts && (
              <span className="tab-count">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
