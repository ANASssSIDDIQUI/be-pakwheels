const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const multer = require("multer");

const cors = require("cors");

const app = express();           // ✅ initialize app

app.use(cors());                // ✅ enable CORS
app.use(express.json());        // ✅ enable JSON body parsing

const router = express.Router();

const DATA_FILE = path.resolve(__dirname, "../data.json");

const storage = multer.diskStorage({
  destination: function (_, _, cb) {
    cb(null, "public/");
  },
  filename: function (_, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit I have set
  },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { cars: [], nextId: 1 };
  }
};

const writeData = async (data) => {
  try {
    console.log("Writing data to:", DATA_FILE);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("Data written successfully");
  } catch (error) {
    console.error("Error writing data file:", error);
    throw error;
  }
};

// Get all cars with optional filtering
router.get("/api/cars", async (req, res) => {
  try {
    const data = await readData();
    console.log(data);
    let cars = data.cars;

    // I can send these queries in my request as ?search=BMW&location=LA
    const {
      search,
      make,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      location,
      condition,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      cars = cars.filter(
        (car) =>
          car.make.toLowerCase().includes(searchTerm) ||
          car.model.toLowerCase().includes(searchTerm) ||
          car.location.toLowerCase().includes(searchTerm)
      );
    }

    // Make filter
    if (make) {
      cars = cars.filter(
        (car) => car.make.toLowerCase() === make.toLowerCase()
      );
    }

    // Model filter
    if (model) {
      cars = cars.filter(
        (car) => car.model.toLowerCase() === model.toLowerCase()
      );
    }

    // Price range filter
    if (minPrice) {
      cars = cars.filter((car) => car.price >= parseInt(minPrice));
    }
    if (maxPrice) {
      cars = cars.filter((car) => car.price <= parseInt(maxPrice));
    }

    // Year range filter
    if (minYear) {
      cars = cars.filter((car) => car.year >= parseInt(minYear));
    }
    if (maxYear) {
      cars = cars.filter((car) => car.year <= parseInt(maxYear));
    }

    // Location filter
    if (location) {
      cars = cars.filter((car) =>
        car.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Condition filter
    if (condition) {
      cars = cars.filter(
        (car) => car.condition.toLowerCase() === condition.toLowerCase()
      );
    }

    // Sorting
    cars.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price" || sortBy === "year" || sortBy === "mileage") {
        aValue = parseInt(aValue);
        bValue = parseInt(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get car by ID
router.get("/api/cars/:id", async (req, res) => {
  try {
    const data = await readData();
    const car = data.cars.find((c) => c.id === parseInt(req.params.id));

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add new car listing
router.post("/api/cars", async (req, res) => {
  try {
    const data = await readData();

    const { make, model, year, price, location, condition, image } = req.body;

    // Validation
    if (!make || !model || !year || !price || !location || !condition || !image) {
      return res.status(400).json({
        error:
          "Missing required fields: make, model, year, price, location, condition",
      });
    }

    // Handle uploaded images
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const newCar = {
      id: data.nextId,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year),
      price: parseInt(price),
      location: location.trim(),
      condition: condition.trim(),
      image: image.trim(),
      createdAt: new Date().toISOString(),
    };

    data.cars.push(newCar);
    data.nextId++;

    await writeData(data);

    res.status(201).json(newCar);
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get unique makes for filter dropdown
router.get("/api/makes", async (req, res) => {
  try {
    const data = await readData();
    const makes = [...new Set(data.cars.map((car) => car.make))].sort();
    res.status(200).json(makes);
  } catch (error) {
    console.error("Error fetching makes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get unique models for a specific make
router.get("/api/makes/:make/models", async (req, res) => {
  try {
    const data = await readData();
    const make = req.params.make;
    const models = [
      ...new Set(
        data.cars
          .filter((car) => car.make.toLowerCase() === make.toLowerCase())
          .map((car) => car.model)
      ),
    ].sort();
    res.status(200).json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get unique locations for filter dropdown
router.get("/api/locations", async (req, res) => {
  try {
    const data = await readData();
    const locations = [...new Set(data.cars.map((car) => car.location))].sort();
    res.status(200).json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get price range
router.get("/api/price-range", async (req, res) => {
  try {
    const data = await readData();
    const prices = data.cars.map((car) => car.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    res.status(200).json({ minPrice, maxPrice });
  } catch (error) {
    console.error("Error fetching price range:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get year range
router.get("/api/year-range", async (req, res) => {
  try {
    const data = await readData();
    const years = data.cars.map((car) => car.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    res.status(200).json({ minYear, maxYear });
  } catch (error) {
    console.error("Error fetching year range:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
router.use((error, _, res) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }

  if (error.message === "Only image files are allowed") {
    return res.status(400).json({ error: "Only image files are allowed" });
  }

  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = router;
