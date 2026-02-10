export const pwaConfig = {
  mode: 'development',
  registerType: 'autoUpdate',
  manifest: {
    name: 'ophi',
    short_name: 'ophi',
    description: 'La mejor aplicación para tener precaución con los alimentos que comprás',
    theme_color: '#005b8e',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  devOptions: {
    enabled: true
  }
}