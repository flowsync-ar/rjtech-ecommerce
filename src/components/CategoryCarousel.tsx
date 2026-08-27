"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categoryLabels, homeCategoryIds } from "@/lib/products";
import { useCategoriesStore } from "@/store/categories-store";

/** px por segundo — desplazamiento continuo */
const SPEED = 42;
const DRAG_THRESHOLD = 8;

export function CategoryCarousel() {
  const router = useRouter();
  const storeCategories = useCategoriesStore((s) => s.categories);

  const items = useMemo(() => {
    const active = storeCategories
      .filter((c) => c.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ id: c.id, label: c.name }));
    if (active.length > 0) return active;
    return homeCategoryIds.map((id) => ({
      id,
      label: categoryLabels[id] ?? id,
    }));
  }, [storeCategories]);

  // Varias copias para que siempre haya overflow y el loop sea invisible
  const track = useMemo(() => {
    if (items.length === 0) return [];
    const copies = Math.max(3, Math.ceil(16 / items.length));
    return Array.from({ length: copies }, () => items).flat();
  }, [items]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const setWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startScroll: 0,
    dragging: false,
    suppressClick: false,
  });
  const [dragging, setDragging] = useState(false);

  const measureSet = () => {
    const el = scrollerRef.current;
    if (!el || items.length === 0) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-cat-card]");
    if (cards.length < items.length) return;
    const first = cards[0];
    const lastOfSet = cards[items.length - 1];
    setWidthRef.current =
      lastOfSet.offsetLeft + lastOfSet.offsetWidth - first.offsetLeft + 14;
  };

  const normalizeLoop = () => {
    const el = scrollerRef.current;
    const w = setWidthRef.current;
    if (!el || w <= 0) return;
    while (el.scrollLeft >= w) el.scrollLeft -= w;
    while (el.scrollLeft < 0) el.scrollLeft += w;
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || items.length === 0) return;

    measureSet();
    el.scrollLeft = 0;

    const ro = new ResizeObserver(() => measureSet());
    ro.observe(el);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!pausedRef.current && !draggingRef.current && setWidthRef.current > 0) {
        el.scrollLeft += (SPEED * dt) / 1000;
        normalizeLoop();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [items, track.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startScroll: scrollerRef.current?.scrollLeft ?? 0,
      dragging: false,
      suppressClick: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollerRef.current;
    const d = dragRef.current;
    if (!el || d.pointerId !== e.pointerId) return;

    const dx = e.clientX - d.startX;
    if (!d.dragging) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.dragging = true;
      d.suppressClick = true;
      draggingRef.current = true;
      setDragging(true);
      el.setPointerCapture(e.pointerId);
      pausedRef.current = true;
    }

    el.scrollLeft = d.startScroll - dx;
    normalizeLoop();
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (d.pointerId !== e.pointerId) return;

    if (d.dragging) {
      try {
        scrollerRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }

    draggingRef.current = false;
    setDragging(false);
    d.pointerId = -1;
    d.dragging = false;
  };

  const goToCategory = (id: string) => {
    router.push(`/catalogo?categoria=${encodeURIComponent(id)}`);
  };

  if (items.length === 0) return null;

  return (
    <section
      className="pb-11"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (!draggingRef.current) pausedRef.current = false;
      }}
    >
      <div className="relative overflow-hidden">
        <div
          ref={scrollerRef}
          className={`flex gap-3.5 overflow-x-auto px-0.5 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            dragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          style={{ touchAction: "pan-y" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {track.map((cat, i) => (
            <Link
              key={`${cat.id}-${i}`}
              href={`/catalogo?categoria=${encodeURIComponent(cat.id)}`}
              data-cat-card
              draggable={false}
              onClick={(e) => {
                if (dragRef.current.suppressClick) {
                  e.preventDefault();
                  dragRef.current.suppressClick = false;
                  return;
                }
                e.preventDefault();
                goToCategory(cat.id);
              }}
              className="flex w-[118px] shrink-0 cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-border bg-surface px-2 py-[18px] no-underline transition-colors hover:border-muted-soft hover:bg-accent-soft hover:!no-underline sm:w-[132px]"
            >
              <CategoryIcon category={cat.id} />
              <div className="text-center text-[12.5px] font-semibold text-foreground">
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
