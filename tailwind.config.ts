
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#0057FF',
					foreground: '#FFFFFF',
					50: '#E6F0FF',
					100: '#CCE0FF',
					500: '#0057FF',
					600: '#0044CC',
					700: '#003399'
				},
				secondary: {
					DEFAULT: '#FF6F00',
					foreground: '#FFFFFF',
					50: '#FFF3E6',
					100: '#FFE6CC',
					500: '#FF6F00',
					600: '#E65500',
					700: '#CC4400'
				},
				destructive: {
					DEFAULT: '#FF3B30',
					foreground: '#FFFFFF'
				},
				muted: {
					DEFAULT: '#F5F5F5',
					foreground: '#666666'
				},
				accent: {
					DEFAULT: '#8E2DE2',
					foreground: '#FFFFFF',
					50: '#F5E6FF',
					100: '#EBCCFF',
					500: '#8E2DE2',
					600: '#7A26C2',
					700: '#661FA3'
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#333333'
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#333333'
				},
				sidebar: {
					DEFAULT: '#FFFFFF',
					foreground: '#333333',
					primary: '#0057FF',
					'primary-foreground': '#FFFFFF',
					accent: '#F5F5F5',
					'accent-foreground': '#333333',
					border: '#E0E0E0',
					ring: '#0057FF'
				}
			},
			borderRadius: {
				lg: '12px',
				md: '8px',
				sm: '6px'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					from: {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
