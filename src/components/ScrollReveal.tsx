import React from 'react';
import { useIntersectionObserver, UseIntersectionObserverOptions } from '../hooks/useIntersectionObserver';

export type ScrollAnimationType =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-up'
  | 'fade-in'
  | 'blur-in';

export interface ScrollRevealProps extends UseIntersectionObserverOptions {
  children: React.ReactNode;
  animation?: ScrollAnimationType;
  delay?: number; // in milliseconds
  duration?: number; // in milliseconds
  easing?: string;
  distance?: number; // in pixels
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
  distance = 28,
  className = '',
  as: Component = 'div',
  threshold = 0.1,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
  enabled = true,
  style = {},
}) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
    enabled,
  });

  // Calculate starting transform / opacity based on animation type
  const getInitialTransform = (): string => {
    switch (animation) {
      case 'fade-up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'fade-down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'fade-left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'fade-right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'scale-up':
        return 'scale3d(0.94, 0.94, 1)';
      case 'fade-in':
      case 'blur-in':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const getInitialFilter = (): string => {
    switch (animation) {
      case 'blur-in':
        return 'blur(8px)';
      case 'fade-up':
      case 'scale-up':
        return 'blur(2px)';
      default:
        return 'none';
    }
  };

  const dynamicStyle: React.CSSProperties = {
    ...style,
    transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1)' : getInitialTransform(),
    opacity: isVisible ? 1 : 0,
    filter: isVisible ? 'blur(0px)' : getInitialFilter(),
    transition: `transform ${duration}ms ${easing} ${delay}ms, opacity ${duration}ms ${easing} ${delay}ms, filter ${duration}ms ${easing} ${delay}ms`,
    willChange: isVisible ? 'auto' : 'transform, opacity, filter',
  };

  return (
    <Component ref={ref} className={className} style={dynamicStyle}>
      {children}
    </Component>
  );
};

export interface StaggerContainerProps extends UseIntersectionObserverOptions {
  children: React.ReactNode;
  staggerDelay?: number; // ms increment per child
  baseDelay?: number; // initial delay
  animation?: ScrollAnimationType;
  duration?: number;
  distance?: number;
  className?: string;
  as?: React.ElementType;
}

/**
 * Automatically applies an incrementing delay to all direct children
 * triggered together when the container enters the viewport.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 80,
  baseDelay = 0,
  animation = 'fade-up',
  duration = 650,
  distance = 24,
  className = '',
  as: Component = 'div',
  threshold = 0.08,
  rootMargin = '0px 0px -30px 0px',
  triggerOnce = true,
  enabled = true,
}) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>({
    threshold,
    rootMargin,
    triggerOnce,
    enabled,
  });

  const getInitialTransform = (): string => {
    switch (animation) {
      case 'fade-up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'fade-down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'fade-left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'fade-right':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'scale-up':
        return 'scale3d(0.94, 0.94, 1)';
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const validChildren = React.Children.toArray(children);

  return (
    <Component ref={ref} className={className}>
      {validChildren.map((child, index) => {
        const itemDelay = baseDelay + index * staggerDelay;
        const childStyle: React.CSSProperties = {
          transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1)' : getInitialTransform(),
          opacity: isVisible ? 1 : 0,
          filter: isVisible ? 'blur(0px)' : 'blur(2px)',
          transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${itemDelay}ms, opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${itemDelay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${itemDelay}ms`,
          willChange: isVisible ? 'auto' : 'transform, opacity',
        };

        return (
          <div key={index} style={childStyle}>
            {child}
          </div>
        );
      })}
    </Component>
  );
};
