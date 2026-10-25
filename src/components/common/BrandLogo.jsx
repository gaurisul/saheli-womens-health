import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable BrandLogo component for Saheli.
 * Displays the existing Saheli logo and "Saheli" brand name beside it
 * using the warm ivory, burgundy, and blush-pink design system with editorial serif typography.
 */
export default function BrandLogo({
  to = '/',
  size = 'md',
  showText = true,
  imgHeight,
  fontSize,
  gap,
  className = '',
  style = {},
  imgStyle = {},
  textStyle = {},
  onClick,
  alt = 'Saheli logo',
  ...rest
}) {
  // Preset sizes matching Saheli design tokens & responsive contexts
  const sizeMap = {
    sm: {
      height: 32,
      fontSize: '1.25rem',
      gap: '0.5rem',
    },
    md: {
      height: 38,
      fontSize: '1.5rem',
      gap: '0.65rem',
    },
    sidebar: {
      height: 40,
      fontSize: '1.45rem',
      gap: '0.65rem',
    },
    lg: {
      height: 48,
      fontSize: '1.75rem',
      gap: '0.75rem',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const resolvedHeight = imgHeight || currentSize.height;
  const resolvedFontSize = fontSize || currentSize.fontSize;
  const resolvedGap = gap || currentSize.gap;

  const content = (
    <div
      className={`saheli-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: resolvedGap,
        userSelect: 'none',
        ...style,
      }}
      {...rest}
    >
      <img
        src="/logo.png"
        alt={alt}
        style={{
          height: typeof resolvedHeight === 'number' ? `${resolvedHeight}px` : resolvedHeight,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
          ...imgStyle,
        }}
      />
      {showText && (
        <span
          className="saheli-brand-text"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: resolvedFontSize,
            fontWeight: 600,
            color: 'var(--color-berry)',
            letterSpacing: '-0.015em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            ...textStyle,
          }}
        >
          Saheli
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        aria-label="Saheli Home"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
        }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
