const Roads = require('../models/RoadsSchema');
const response = require('../../responses');

const roadsController = {
  addRoad: async (req, res) => {
    try {
      const payload = req.body || {};
      payload.createdBy = req.user?.id || req.userId;

      if (payload.carriageway && Array.isArray(payload.constructionLayers)) {
        const defaultSides =
          payload.carriageway === 'Double Carriageway'
            ? [
                { side: 'Left', StartChainageKM: 0, EndChainageKM: 0 },
                { side: 'Right', StartChainageKM: 0, EndChainageKM: 0 },
              ]
            : [{ side: 'Single', StartChainageKM: 0, EndChainageKM: 0 }];
        payload.constructionLayers = payload.constructionLayers.map(
          (layer) => ({
            ...layer,
            sides: defaultSides,
          }),
        );
      }

      const road = new Roads(payload);
      await road.save();

      return response.ok(res, {
        message: 'Road added successfully',
        data: road,
      });
    } catch (error) {
      console.error('Add Road Error:', error);
      return response.error(res, error.message || 'Failed to add road');
    }
  },

  getRoads: async (req, res) => {
    try {
      const { projectId } = req.params;

      const roads = await Roads.find({
        projectId,
        isActive: { $ne: false },
      });

      return response.ok(res, {
        message: 'Road list fetched successfully',
        data: roads,
      });
    } catch (error) {
      console.error('Get Roads Error:', error);
      return response.error(res, error.message || 'Failed to fetch roads');
    }
  },

  getRoadById: async (req, res) => {
    try {
      const { roadId } = req.params;

      const road = await Roads.findOne({
        _id: roadId,
        isActive: { $ne: false },
      });

      if (!road) {
        return response.error(res, 'Road not found');
      }

      return response.ok(res, {
        message: 'Road fetched successfully',
        data: road,
      });
    } catch (error) {
      console.error('Get Road By ID Error:', error);
      return response.error(res, error.message || 'Failed to fetch road');
    }
  },

  updateRoad: async (req, res) => {
    try {
      const { roadId } = req.params;
      const payload = req.body;

      const updatedRoad = await Roads.findByIdAndUpdate(
        roadId,
        { $set: payload },
        { new: true },
      );

      return response.ok(res, {
        message: 'Road updated successfully',
        data: updatedRoad,
      });
    } catch (error) {
      console.error('Update Road Error:', error);
      return response.error(res, error.message || 'Failed to update road');
    }
  },

  deleteRoad: async (req, res) => {
    try {
      const { roadID } = req.params;

      const deleted = await Roads.findByIdAndDelete(roadID);

      return response.ok(res, {
        message: 'Road deleted successfully',
        data: deleted,
      });
    } catch (error) {
      console.error('Delete Road Error:', error);
      return response.error(res, error.message || 'Failed to delete road');
    }
  },

  updateLayer: async (req, res) => {
    try {
      const { roadId, layerId } = req.params;
      const payload = req.body;

      const road = await Roads.findOne({
        _id: roadId,
        'constructionLayers._id': layerId,
      });

      if (!road) return response.error(res, 'Road or Layer not found');

      const layer = road.constructionLayers.find(
        (lay) => lay._id.toString() === layerId,
      );

      let updatedSides = [...layer.sides];

      if (payload.carriageway === 'Left') {
        const leftIndex = updatedSides.findIndex(
          (s) => s.side.toLowerCase() === 'left',
        );

        const newLeft = {
          side: 'Left',
          StartChainageKM: payload.StartChainageKM,
          EndChainageKM: payload.EndChainageKM,
        };

        if (leftIndex !== -1) {
          updatedSides[leftIndex] = newLeft;
        } else {
          updatedSides.push(newLeft);
        }
      } else if (payload.carriageway === 'Right') {
        const rightIndex = updatedSides.findIndex(
          (s) => s.side.toLowerCase() === 'right',
        );

        const newRight = {
          side: 'Right',
          StartChainageKM: payload.StartChainageKM,
          EndChainageKM: payload.EndChainageKM,
        };

        if (rightIndex !== -1) {
          updatedSides[rightIndex] = newRight;
        } else {
          updatedSides.push(newRight);
        }
      } else {
        updatedSides = [
          {
            side: 'Single',
            StartChainageKM: payload.StartChainageKM,
            EndChainageKM: payload.EndChainageKM,
          },
        ];
      }

      const historyEntry = {
        start: payload.StartChainageKM,
        end: payload.EndChainageKM,
        date: new Date(),
      };

      let sideIndex = updatedSides.findIndex(
        (s) =>
          s.side.toLowerCase() === payload.carriageway?.toLowerCase() ||
          s.side.toLowerCase() === 'single',
      );

      if (sideIndex !== -1) {
        if (!updatedSides[sideIndex].history) {
          updatedSides[sideIndex].history = [];
        }

        updatedSides[sideIndex].history.push(historyEntry);
      }

      const updatedRoad = await Roads.findOneAndUpdate(
        {
          _id: roadId,
          'constructionLayers._id': layerId,
        },
        {
          $set: { 'constructionLayers.$.sides': updatedSides },
        },
        { new: true },
      );

      const updatedLayer = updatedRoad.constructionLayers.find(
        (l) => l._id.toString() === layerId,
      );

      return response.ok(res, {
        message: 'Layer updated successfully',
        data: updatedLayer,
      });
    } catch (error) {
      console.error('Update Layer Error:', error);
      return response.error(res, error.message || 'Failed to update layer');
    }
  },

  refreshLayer: async (req, res) => {
    try {
      const { roadId, layerId } = req.params;

      const road = await Roads.findOne({
        _id: roadId,
        'constructionLayers._id': layerId,
      });

      if (!road) return response.error(res, 'Road or Layer not found');

      let layer = road.constructionLayers.find(
        (l) => l._id.toString() === layerId,
      );

      updatedSides = layer.sides.map((side) => ({
        ...side.toObject(),
        StartChainageKM: null,
        EndChainageKM: null,
        CompletionDate: null,
        notes: '',
        history: [],
      }));

      const updatedRoad = await Roads.findOneAndUpdate(
        {
          _id: roadId,
          'constructionLayers._id': layerId,
        },
        {
          $set: { 'constructionLayers.$.sides': updatedSides },
        },
        { new: true },
      );

      return response.ok(res, {
        message: 'Layer reset successfully',
        data: updatedRoad.constructionLayers.find(
          (l) => l._id.toString() === layerId,
        ),
      });
    } catch (error) {
      console.log('Reset Layer Error:', error);
      return response.error(res, error.message || 'Failed to reset layer');
    }
  },
};

module.exports = roadsController;
