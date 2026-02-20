import express from 'express';
import IssueCategory from '../models/issueCategoryModel.js';
import User from '../models/userModel.js';  // Placeholder - ensures User model is registered

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all active categories with their active subcategories (for dropdown)
router.get('/dropdown', async (req, res) => {
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
});

// Get subcategories by category ID
router.get('/:categoryId/subcategories', async (req, res) => {
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
});

// ==================== ADMIN ROUTES ====================

// Get all categories (admin view)
router.get('/admin', async (req, res) => {
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
});

// Create new category
router.post('/', async (req, res) => {
    try {
        const { name, description, subCategories, createdBy } = req.body;
        
        if (!name || !createdBy) {
            return res.status(400).json({
                success: false,
                message: 'Name and createdBy are required'
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
            createdBy
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
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive, updatedBy } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (updatedBy) updateData.updatedBy = updatedBy;
        
        const updatedCategory = await IssueCategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy updatedBy', 'name email');
        
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
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
});

// ==================== SUBCATEGORY ROUTES ====================

// Add subcategory to category
router.post('/:categoryId/subcategories', async (req, res) => {
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
        
        if (updatedBy) {
            category.updatedBy = updatedBy;
        }
        
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
});

// Update subcategory
router.put('/:categoryId/subcategories/:subCategoryId', async (req, res) => {
    try {
        const { categoryId, subCategoryId } = req.params;
        const { name, description, isActive, updatedBy } = req.body;
        
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
        
        if (name !== undefined) subCategory.name = name;
        if (description !== undefined) subCategory.description = description;
        if (isActive !== undefined) subCategory.isActive = isActive;
        if (updatedBy) category.updatedBy = updatedBy;
        
        await category.save();
        
        res.json({
            success: true,
            message: 'Subcategory updated successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete subcategory
router.delete('/:categoryId/subcategories/:subCategoryId', async (req, res) => {
    try {
        const { categoryId, subCategoryId } = req.params;
        const { updatedBy } = req.body;
        
        const category = await IssueCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        category.subCategories.id(subCategoryId).deleteOne();
        
        if (updatedBy) {
            category.updatedBy = updatedBy;
        }
        
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
});

export default router;