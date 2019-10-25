// default fallback to test acc creds for demo / quick start
module.exports = {
  userAgent: process.env.REDDIT_USER_AGENT || "btcftw_test",
  clientId: process.env.REDDIT_CLIENT_ID || "lLF-1n9gaoVn4g",
  clientSecret: process.env.REDDIT_CLIENT_SECRET || "8Or0RguiWEeN4DSqLiIdm2A9kmI",
  username: process.env.REDDIT_USERNAME || "btcftw_test",
  password: process.env.REDDIT_PASSWORD || "btcftw_test"
};
