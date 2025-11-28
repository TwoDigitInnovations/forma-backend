const authRoutes = require('../src/routes/authRoutes');
const projectRoutes = require('../src/routes/projectRoutes');
const planRoutes = require('../src/routes/planRoutes');
const trackerRoutes = require('../src/routes/trackerRoutes');
const roadRoutes = require('../src/routes/roadRoutes');

module.exports = (app) => {
  app.use('/auth', authRoutes);
  app.use('/project', projectRoutes);
  app.use('/workplan', planRoutes);
  app.use('/tracker', trackerRoutes)
  app.use('/roads', roadRoutes)
};
