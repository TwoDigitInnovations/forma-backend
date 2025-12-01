const authRoutes = require('../src/routes/authRoutes');
const projectRoutes = require('../src/routes/projectRoutes');
const planRoutes = require('../src/routes/planRoutes');
const trackerRoutes = require('../src/routes/trackerRoutes');
const roadRoutes = require('../src/routes/roadRoutes');
const checkList = require('../src/routes/checkListRoute');
const actionPoints = require('../src/routes/actionPointsRoutes');
const dailylogs = require('../src/routes/logsRoute');

module.exports = (app) => {
  app.use('/auth', authRoutes);
  app.use('/project', projectRoutes);
  app.use('/workplan', planRoutes);
  app.use('/tracker', trackerRoutes);
  app.use('/roads', roadRoutes);
  app.use('/checklist', checkList);
  app.use('/action-Point', actionPoints);
  app.use('/dailylogs', dailylogs);
};
