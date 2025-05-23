/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': '#F0F4FA', // Light blue page background
        'sidebar-bg': '#2D3748', // Dark gray sidebar background
        'sidebar-text': '#E2E8F0', // Light gray text for sidebar
        'sidebar-hover-bg': '#4A5568', // Hover background for sidebar items
        'sidebar-active-bg': '#3B82F6', // Active background for sidebar items (primary blue)
        'sidebar-active-text': '#FFFFFF', // White text for active sidebar items
        'primary': '#3B82F6', // Primary blue for buttons, links
        'primary-dark': '#2563EB', // Darker primary blue for hover/active states
        'content-bg': '#FFFFFF', // White for cards, top bar, etc.
        'text-primary': '#1F2937', // Dark gray for main text
        'text-secondary': '#4B5563', // Medium gray for secondary text
        'text-light': '#6B7280', // Lighter gray for less prominent text
        'border-color': '#D1D5DB', // Default border color
        'input-bg': '#F9FAFB', // Background for input fields
        'input-border': '#D1D5DB', // Border for input fields
        'danger': '#EF4444', // Red for danger/delete actions
        'success': '#10B981', // Green for success actions
        'warning': '#F59E0B', // Yellow for warning actions
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      }
    },
  },
  plugins: [],
}
