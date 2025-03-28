/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind CSS - A utility-first CSS framework
    tailwindcss: {},
    
    // Autoprefixer - Parse CSS and add vendor prefixes to rules
    autoprefixer: {},
    
    // PostCSS Nested - Unwrap nested rules like how Sass does
    'postcss-nested': {},
  },
};

export default config;
