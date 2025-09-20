const authRoutes = require('../src/routes/authRoutes');
const projectRoutes = require('../src/routes/projectRoutes');
const boqRoutes = require('../src/routes/boqRoute');
const templateRoutes = require('../src/routes/templateRoute');

module.exports = (app) => {
  app.use('/auth', authRoutes);
  app.use('/project', projectRoutes);
  app.use('/boq', boqRoutes);
  app.use('/template', templateRoutes);
};
