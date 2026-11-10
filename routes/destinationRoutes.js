const express = require("express");
const c = require("../controllers/destinationController");

const router = express.Router();

// Static routes must be declared before "/:id" so they are not treated as IDs
router.get("/discover", c.discoverDestinations);
router.get("/categories", c.getCategories);
router.get("/count", c.countDestinations);

router.post("/bulk", c.addManyDestinations);

router
  .route("/name/:name")
  .get(c.getDestinationByName)
  .put(c.updateDestinationByName)
  .delete(c.deleteDestinationByName);

router
  .route("/")
  .get(c.getAllDestinations)
  .post(c.addDestination)
  .delete(c.deleteManyDestinations);

router
  .route("/:id")
  .get(c.getDestinationById)
  .put(c.updateDestinationById)
  .delete(c.deleteDestinationById);

module.exports = router;
