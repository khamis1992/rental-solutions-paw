import { theme } from './theme';

export const cardStyles = {
  base: `
    bg-white
    border
    border-gray-200
    rounded-lg
    shadow-card
    hover:shadow-cardHover
    transition-shadow
    duration-300
    p-6
  `,
};

export const buttonStyles = {
  base: `
    inline-flex
    items-center
    justify-center
    rounded-md
    px-4
    py-2
    text-sm
    font-medium
    transition-all
    duration-300
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
  `,
  variants: {
    primary: `
      bg-primary
      text-white
      hover:bg-primary-hover
      focus:ring-primary
    `,
    secondary: `
      bg-secondary
      text-white
      hover:bg-secondary-hover
      focus:ring-secondary
    `,
    outline: `
      border
      border-gray-300
      bg-transparent
      hover:bg-gray-50
      focus:ring-primary
    `,
  },
};

export const textStyles = {
  h1: `
    text-h1
    font-bold
    leading-h1
    text-text
  `,
  h2: `
    text-h2
    font-semibold
    leading-h2
    text-text
  `,
  h3: `
    text-h3
    font-semibold
    leading-h3
    text-text
  `,
  body: `
    text-body
    font-normal
    leading-body
    text-text
  `,
  muted: `
    text-sm
    text-text-muted
  `,
};

export const layoutStyles = {
  container: `
    max-w-[1400px]
    mx-auto
    px-4
    sm:px-6
    lg:px-8
  `,
  section: `
    py-section
  `,
  grid: `
    grid
    gap-grid-gap
  `,
};