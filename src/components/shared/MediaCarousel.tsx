import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface MediaCarouselProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  children: ReactNode;
  className?: string;
}

export function MediaCarousel({ title, subtitle, viewAllLink, children, className }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      className={cn("relative py-4", className)}
    >
      <div className="flex items-baseline justify-between mb-4 px-4 md:px-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text font-[family-name:var(--font-display)]">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-sm text-primary hover:text-primary-hover transition-colors font-medium"
          >
            View All
          </a>
        )}
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <div className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-surface transition-colors">
              <ChevronLeft className="w-5 h-5 text-text" />
            </div>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar scroll-smooth px-4 md:px-8 pb-2"
        >
          {children}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <div className="w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-surface transition-colors">
              <ChevronRight className="w-5 h-5 text-text" />
            </div>
          </button>
        )}
      </div>
    </motion.section>
  );
}
