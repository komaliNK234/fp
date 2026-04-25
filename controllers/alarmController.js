const Alarm = require("../models/Alarm");

exports.createAlarm = async (req, res) => {
  try {
    const { place, time, object } = req.body;
    const alarm = await Alarm.create({ user: req.user.id, place, time, object });
    res.json({ message: "Alarm created", alarm });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find({ user: req.user.id });
    res.json(alarms);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.stopAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findById(req.params.id);
    if (!alarm) return res.status(404).json({ error: "Alarm not found" });

    alarm.active = false;
    await alarm.save();
    res.json({ message: "Alarm stopped", alarm });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
