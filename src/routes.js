const authRoutes = require('../src/routes/authRoutes');
const projectRoutes = require('../src/routes/projectRoutes')

module.exports = (app) => {
  app.use('/auth', authRoutes);
  app.use('/project', projectRoutes);
};
