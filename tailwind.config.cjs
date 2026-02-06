/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                psychedelic: {
                    '0%': { background: 'linear-gradient(0deg, #ff00ff, #00ffff, #ffff00)' },
                    '33%': { background: 'linear-gradient(120deg, #00ff00, #ff00ff, #00ffff)' },
                    '66%': { background: 'linear-gradient(240deg, #ffff00, #00ff00, #ff00ff)' },
                    '100%': { background: 'linear-gradient(0deg, #ff00ff, #00ffff, #ffff00)' },
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                blob: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0, 0) scale(1)' },
                },
            },
            animation: {
                psychedelic: 'psychedelic 8s ease-in-out infinite',
                'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                blob: 'blob 7s infinite',
            },
        },
    },
    plugins: [],
}
