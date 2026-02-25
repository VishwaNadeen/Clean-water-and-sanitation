import IssueCategory from '../models/issueCategoryModel.js';
import mongoose from 'mongoose';

// ==================== PUBLIC CONTROLLERS ====================

// Get all active categories with their active subcategories (for dropdown)
export const getCategoriesForDropdown = async (req, res) => {
    try {
        const categories = await IssueCategory.find({ isActive: true })
            .select('name subCategories')
            .lean();
        
        // Filter only active subcategories
        const formattedCategories = categories.map(category => ({
            _id: category._id,
            name: category.name,
            subCategories: category.subCategories.filter(sub => sub.isActive)
        }));
        
        res.json({
            success: true,
            data: formattedCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get subcategories by category ID
export const getSubCategoriesByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await IssueCategory.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        const activeSubCategories = category.subCategories.filter(sub => sub.isActive);
        
        res.json({
            success: true,
            data: activeSubCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== ADMIN CONTROLLERS ====================

// Get all categories (admin view)
export const getAllCategories = async (req, res) => {
    try {
        const categories = await IssueCategory.find()
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create new category
export const createCategory = async (req, res) => {
    try {
        const { name, description, subCategories } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }
        
        // Check if category name already exists
        const existingCategory = await IssueCategory.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category name already exists'
            });
        }
        
        const newCategory = new IssueCategory({
            name,
            description: description || "",
            subCategories: subCategories || [],
            createdBy: req.user._id
        });
        
        const savedCategory = await newCategory.save();
        await savedCategory.populate('createdBy', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: savedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;
        
        // VALIDATION
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID format. Please provide a valid category ID.'
            });
        }

        // Check if category exists
        const existingCategory = await IssueCategory.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Build update data
        const updateData = {
            updatedBy: req.user._id
        };
        
        if (name !== undefined) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name cannot be empty'
                });
            }
            
            // Check if name already exists (excluding current category)
            const nameExists = await IssueCategory.findOne({
                _id: { $ne: id }, 
                name: { $regex: new RegExp('^' + name.trim() + '$', 'i') }
            });
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name already exists. Please choose a different name.'
                });
            }
            
            updateData.name = name.trim();
        }
        
        if (description !== undefined) {
            updateData.description = description || '';
        }
        
        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'isActive must be true or false'
                });
            }
            updateData.isActive = isActive;
        }
        
        const updatedCategory = await IssueCategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy updatedBy', 'name email');
        
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedCategory = await IssueCategory.findByIdAndDelete(id);
        
        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== SUBCATEGORY CONTROLLERS ====================

// Add subcategory to category
export const addSubCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, description, updatedBy } = req.body;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name is required'
            });
        }
        
        const category = await IssueCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Check if subcategory name already exists in this category
        const existingSubCategory = category.subCategories.find(
            sub => sub.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingSubCategory) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name already exists in this category'
            });
        }
        
        category.subCategories.push({
            name,
            description: description || ""
        });
        
        category.updatedBy = req.user._id;
        
        await category.save();
        
        res.status(201).json({
            success: true,
            message: 'Subcategory added successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update subcategory
export const updateSubCategory = async (req, res) => {
    try {
        const { categoryId, subCategoryId } = req.params;
        const { name, description, isActive } = req.body;
        
        // VALIDATION
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID format. Please provide a valid category ID.'
            });
        }

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory ID is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subcategory ID format. Please provide a valid subcategory ID.'
            });
        }
        
        const category = await IssueCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        const subCategory = category.subCategories.id(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Validate and update fields
        if (name !== undefined) {
            if (!name || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Subcategory name cannot be empty'
                });
            }
            
            // Check if name already exists in this category (excluding current subcategory)
            const nameExists = category.subCategories.find(
                sub => sub._id.toString() !== subCategoryId && 
                       sub.name.toLowerCase() === name.trim().toLowerCase()
            );
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Subcategory name already exists in this category. Please choose a different name.'
                });
            }
            
            subCategory.name = name.trim();
        }
        
        if (description !== undefined) {
            subCategory.description = description || '';
        }
        
        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'isActive must be true or false'
                });
            }
            subCategory.isActive = isActive;
        }
        
        category.updatedBy = req.user._id;
        await category.save();
        
        res.json({
            success: true,
            message: 'Subcategory updated successfully',
            data: {
                category: {
                    _id: category._id,
                    name: category.name
                },
                subcategory: {
                    _id: subCategory._id,
                    name: subCategory.name,
                    description: subCategory.description,
                    isActive: subCategory.isActive
                }
            }
        });
    } catch (error) {
        console.error('Update subcategory error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating subcategory',
            error: error.message
        });
    }
};

// Delete subcategory
export const deleteSubCategory = async (req, res) => {
    try {
        const { categoryId, subCategoryId } = req.params;
        
        const category = await IssueCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        category.subCategories.id(subCategoryId).deleteOne();
        
        category.updatedBy = req.user._id;
        
        await category.save();
        
        res.json({
            success: true,
            message: 'Subcategory deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
