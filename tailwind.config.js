/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // subtle reference palette for IOTrix
        iotrix: {
          50: '#f5fbff',
          100: '#e6f6ff',
          500: '#06b6d4',
          700: '#0ea5e9'
        }
      }
    }
  },
  plugins: []
}
