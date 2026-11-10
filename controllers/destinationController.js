const mongoose = require("mongoose");
const Destination = require("../models/Destination");

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const nameQuery = (name) => ({ name: new RegExp(`^${escapeRegex(name)}$`, "i") });
const updateOptions = { new: true, runValidators: true };

const checkId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: `Invalid destination ID: ${id}` });
    return false;
  }
  return true;
};

// ---------- Challenge 01: Add ----------
// POST /api/destinations  -> Model.create()
exports.addDestination = async (req, res, next) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json({ success: true, message: "Destination added", data: destination });
  } catch (err) {
    next(err);
  }
};

// POST /api/destinations/bulk -> Model.insertMany()
exports.addManyDestinations = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ success: false, message: "Send a non-empty array of destinations" });
    }
    const destinations = await Destination.insertMany(req.body);
    res.status(201).json({ success: true, message: `${destinations.length} destinations added`, data: destinations });
  } catch (err) {
    next(err);
  }
};

// ---------- Challenge 02: Retrieve ----------
// GET /api/destinations -> Model.find()
exports.getAllDestinations = async (req, res, next) => {
  try {
    const destinations = await Destination.find();
    res.status(200).json({ success: true, count: destinations.length, data: destinations });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/:id -> Model.findById()
exports.getDestinationById = async (req, res, next) => {
  try {
    if (!checkId(req.params.id, res)) return;
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/name/:name -> Model.findOne()
exports.getDestinationByName = async (req, res, next) => {
  try {
    const destination = await Destination.findOne(nameQuery(req.params.name));
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, data: destination });
  } catch (err) {
    next(err);
  }
};

// ---------- Challenge 03: Update ----------
// PUT /api/destinations/:id -> Model.findByIdAndUpdate()
exports.updateDestinationById = async (req, res, next) => {
  try {
    if (!checkId(req.params.id, res)) return;
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, updateOptions);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, message: "Destination updated", data: destination });
  } catch (err) {
    next(err);
  }
};

// PUT /api/destinations/name/:name -> Model.findOneAndUpdate()
exports.updateDestinationByName = async (req, res, next) => {
  try {
    const destination = await Destination.findOneAndUpdate(nameQuery(req.params.name), req.body, updateOptions);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, message: "Destination updated", data: destination });
  } catch (err) {
    next(err);
  }
};

// ---------- Challenge 04: Smart Destination Discovery ----------
// GET /api/destinations/discover?category=&minPrice=&maxPrice=&sortBy=&order=&page=&limit=
// Uses find(), sort(), skip(), limit(), countDocuments()
exports.discoverDestinations = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, sortBy = "price", order = "asc" } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 50);

    const filter = {};
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // sortBy can be "price", "rating" or "price,rating" (multi-field sort)
    const allowed = ["price", "rating"];
    const sort = {};
    sortBy.split(",").forEach((field) => {
      if (allowed.includes(field.trim())) sort[field.trim()] = order === "desc" ? -1 : 1;
    });
    if (Object.keys(sort).length === 0) sort.price = 1;

    const total = await Destination.countDocuments(filter);
    const destinations = await Destination.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      count: destinations.length,
      data: destinations,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/categories -> Model.distinct()
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Destination.distinct("category");
    res.status(200).json({ success: true, count: categories.length, data: categories.sort() });
  } catch (err) {
    next(err);
  }
};

// GET /api/destinations/count -> Model.countDocuments()
exports.countDestinations = async (req, res, next) => {
  try {
    const filter = req.query.category ? { category: new RegExp(`^${escapeRegex(req.query.category)}$`, "i") } : {};
    const total = await Destination.countDocuments(filter);
    res.status(200).json({ success: true, total });
  } catch (err) {
    next(err);
  }
};

// ---------- Challenge 05: Cleanup ----------
// DELETE /api/destinations/:id -> Model.findByIdAndDelete()
exports.deleteDestinationById = async (req, res, next) => {
  try {
    if (!checkId(req.params.id, res)) return;
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, message: "Destination deleted", data: destination });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/destinations/name/:name -> Model.findOneAndDelete()
exports.deleteDestinationByName = async (req, res, next) => {
  try {
    const destination = await Destination.findOneAndDelete(nameQuery(req.params.name));
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
    res.status(200).json({ success: true, message: "Destination deleted", data: destination });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/destinations?category=&maxRating=&minPrice= -> Model.deleteMany()
exports.deleteManyDestinations = async (req, res, next) => {
  try {
    const { category, maxRating, minPrice } = req.query;
    const filter = {};
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    if (maxRating !== undefined) filter.rating = { $lt: Number(maxRating) };
    if (minPrice !== undefined) filter.price = { $gt: Number(minPrice) };

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one condition (category, maxRating or minPrice) to delete multiple destinations",
      });
    }
    const result = await Destination.deleteMany(filter);
    res.status(200).json({ success: true, message: `${result.deletedCount} destination(s) deleted`, deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
};
