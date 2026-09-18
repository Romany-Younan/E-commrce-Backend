const Settings = require('../models/settings.model');
const catchAsync = require('../utilites/catchAsync.uti');

exports.getSettings = catchAsync(async (req, res, next) => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({ currentSeason: 'All Year' });
    }

    res.status(200).json({
        status: 'success',
        data: { settings }
    });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
    const { currentSeason } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({ currentSeason: currentSeason || 'All Year' });
    } else {
        if (currentSeason) settings.currentSeason = currentSeason;
        await settings.save();
    }

    res.status(200).json({
        status: 'success',
        data: { settings }
    });
});
