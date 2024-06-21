const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    // Extract category data from request body
    const { Name, Description } = req.body;

    // Create a new category instance
    const newCategory = new Category({
      Name,
      Description,
    });

    // Save the new category to the database
    await newCategory.save();

    // Respond with the newly created category
    res.status(201).json(newCategory);
  } catch (error) {
    // If an error occurs during category creation, handle it
    res.status(400).json({ message: error.message });
  }
};
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { Name, Description } = req.body;

    let category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.Name = Name;
    category.Description = Description;
    await category.save();

    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
