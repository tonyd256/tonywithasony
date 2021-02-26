module.exports = {
  target: 'serverless',
  webpack: function (config, { isServer }) {
    if (isServer) {
      require('./scripts/generate-sitemap');
    }
    return config;
  },
  images: {
    domains: ["ik.imagekit.io"]
  }
};
