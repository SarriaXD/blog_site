import { useState, useEffect, useCallback, useRef } from "react";

export enum Axis {
  X = "x",
  Y = "y",
}
export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
  Still = "still",
}

type ScrollProps = {
  thr?: number;
  axis?: Axis;
  scrollUp?: Direction;
  scrollDown?: Direction;
  still?: Direction;
};

function useScrollDir(props: ScrollProps = {}): Direction {
  const {
    thr = 0,
    axis = Axis.Y,
    scrollUp = axis === Axis.Y ? Direction.Up : Direction.Left,
    scrollDown = axis === Axis.Y ? Direction.Down : Direction.Right,
    still = Direction.Still,
  } = props;

  const [scrollDir, setScrollDir] = useState<Direction>(still);

  const threshold = Math.max(0, thr);
  const ticking = useRef(false);
  const lastScroll = useRef(0);

  const updateScrollDir = useCallback(() => {
    const scroll = axis !== Axis.Y ? window.scrollX : window.scrollY;
    if (Math.abs(scroll - lastScroll.current) >= threshold) {
      setScrollDir(scroll > lastScroll.current ? scrollDown : scrollUp);
      lastScroll.current = Math.max(0, scroll);
    }
    ticking.current = false;
  }, [axis, threshold, scrollDown, scrollUp]);

  useEffect(() => {
    lastScroll.current = axis === Axis.Y ? window.scrollY : window.scrollX;
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDir);
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [axis, updateScrollDir]);
  return scrollDir;
}

export default useScrollDir;
