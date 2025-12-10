import { useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import "./Carousel.css";

interface CarouselProps {
  children: ReactNode;
}

export function Carousel({ children }: CarouselProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (wrapperRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = wrapperRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (wrapper) {
      updateScrollState();
      wrapper.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);
      return () => {
        wrapper.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }
  }, [updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (wrapperRef.current) {
      const scrollAmount = 300;
      wrapperRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="carousel-container">
      {canScrollLeft && (
        <button className="carousel-arrow left" onClick={() => scroll("left")}>
          ‹
        </button>
      )}
      <div className="carousel-wrapper" ref={wrapperRef}>
        <div className="carousel">{children}</div>
      </div>
      {canScrollRight && (
        <button className="carousel-arrow right" onClick={() => scroll("right")}>
          ›
        </button>
      )}
    </div>
  );
}
