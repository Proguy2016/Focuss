/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    'system-ui',
                    'sans-serif'
                ]
            },
            colors: {
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    500: 'hsl(var(--primary))',
                },
                'primary-light': 'var(--primary-light)',
                'primary-dark': 'var(--primary-dark)',
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                'secondary-light': 'var(--secondary-light)',
                dark: 'var(--dark)',
                darker: 'var(--darker)',
                light: 'var(--light)',
                gray: {
                    DEFAULT: 'var(--gray)',
                    dark: 'var(--gray-dark)'
                },
                red: 'var(--red)',
                yellow: 'var(--yellow)',
                glass: 'var(--glass)',
                emerald: 'var(--emerald)',
                'slate-dark': 'var(--slate-dark)',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                },
                /* Aliases for legacy collaboration UI colour classes */
                'theme-primary': 'hsl(var(--primary))',
                'theme-primary-dark': 'hsl(var(--primary-dark))',
                'theme-secondary': 'hsl(var(--secondary))',
                'theme-red': 'var(--red)',
                'theme-emerald': 'var(--emerald)',
                'theme-gray-dark': 'var(--gray-dark)',
                'theme-dark': 'var(--dark)',
            },
            boxShadow: {
                DEFAULT: 'var(--shadow)',
                lg: 'var(--shadow-lg)',
                glow: 'var(--glow)'
            },
            animation: {
                glow: 'glow 1.5s ease-in-out infinite alternate',
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-slow': 'pulse 3s infinite',
                float: 'float 6s ease-in-out infinite',
                'gradient-x': 'gradient-x 15s ease infinite',
                'gradient-y': 'gradient-y 15s ease infinite',
                'gradient-xy': 'gradient-xy 15s ease infinite',
                'gradient-slow': 'gradient 8s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': {
                        boxShadow: '0 0 5px rgba(4, 217, 217, 0.2)'
                    },
                    '100%': {
                        boxShadow: 'var(--glow)'
                    }
                },
                fadeIn: {
                    '0%': {
                        opacity: '0'
                    },
                    '100%': {
                        opacity: '1'
                    }
                },
                slideUp: {
                    '0%': {
                        transform: 'translateY(10px)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1'
                    }
                },
                slideDown: {
                    '0%': {
                        transform: 'translateY(-10px)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: '1'
                    }
                },
                scaleIn: {
                    '0%': {
                        transform: 'scale(0.95)',
                        opacity: '0'
                    },
                    '100%': {
                        transform: 'scale(1)',
                        opacity: '1'
                    }
                },
                float: {
                    '0%, 100%': {
                        transform: 'translateY(0px)'
                    },
                    '50%': {
                        transform: 'translateY(-20px)'
                    }
                },
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    }
                },
                'gradient-y': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'center top'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'center bottom'
                    }
                },
                'gradient-xy': {
                    '0%, 100%': {
                        'background-size': '400% 400%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '400% 400%',
                        'background-position': 'right center'
                    }
                },
                gradient: {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    },
                },
            },
            backdropBlur: {
                xs: '2px'
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [
        require("tailwindcss-animate"),
        function({ addUtilities }) {
            const newUtilities = {
                '.animation-delay-500': {
                    'animation-delay': '0.5s',
                },
                '.animation-delay-1000': {
                    'animation-delay': '1s',
                },
                '.animation-delay-1500': {
                    'animation-delay': '1.5s',
                },
            }
            addUtilities(newUtilities, ['responsive', 'hover'])
        }
    ],
};