module.exports = {
  siteUrl: 'https://fessnap.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  outDir: 'public',
  changefreq: 'daily',
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
}; 