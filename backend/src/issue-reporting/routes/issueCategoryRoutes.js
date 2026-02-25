import express from 'express';
import {
    getCategoriesForDropdown,
    getSubCategoriesByCategoryId,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory
} from '../controllers/issueCategoryController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all active categories with their active subcategories (for dropdown)
router.get('/dropdown', getCategoriesForDropdown);

// Get subcategories by category ID
router.get('/:categoryId/subcategories', getSubCategoriesByCategoryId);

// ==================== ADMIN ROUTES ====================

// Get all categories (admin view)
router.get('/admin', getAllCategories);

// Create new category
router.post('/', createCategory);

// Update category
router.put('/:id', updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

// ==================== SUBCATEGORY ROUTES ====================

// Add subcategory to category
router.post('/:categoryId/subcategories', addSubCategory);

// Update subcategory
router.put('/:categoryId/subcategories/:subCategoryId', updateSubCategory);

// Delete subcategory
router.delete('/:categoryId/subcategories/:subCategoryId', deleteSubCategory);

export default router;