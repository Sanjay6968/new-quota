import { forwardRef, PropsWithChildren } from 'react';
import AnimateHeight from 'react-animate-height';

// Allow only valid height values for AnimateHeight
type HeightType = number | 'auto';

export interface CollapseProps {
  isOpen?: boolean;
  animateOpacity?: boolean;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  duration?: number;
  easing?: string;
  startingHeight?: HeightType;
  endingHeight?: HeightType;
}

const Collapse = forwardRef<HTMLDivElement, PropsWithChildren<CollapseProps>>(
  (
    {
      isOpen,
      animateOpacity = true,
      onAnimationStart,
      onAnimationEnd,
      duration,
      easing = 'ease',
      startingHeight = 0,
      endingHeight = 'auto',
      ...rest
    },
    ref,
  ) => {
    return (
      <AnimateHeight
        duration={duration}
        easing={easing}
        animateOpacity={animateOpacity}
        height={isOpen ? endingHeight : startingHeight}
        applyInlineTransitions={false}
        onAnimationStart={onAnimationStart}
        onAnimationEnd={onAnimationEnd}
        style={{
          transition: 'height .3s ease, opacity .3s ease-in-out, transform .3s ease-in-out',
          backfaceVisibility: 'hidden',
        }}
      >
        <div ref={ref} {...rest} />
      </AnimateHeight>
    );
  },
);

export default Collapse;
