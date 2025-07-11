const config = {
  mode: 'jit',
  purge: [
    './src/app/**/*.{js,ts,jsx,tsx,scss}',
    './frontend/components/**/*.{js,ts,jsx,tsx,scss}',
    './frontend/styles/**/*.{scss}'
  ],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
}
export default config