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
import { protect, checkAccountStatus, authorizeRoles } from "../../middleware/authMiddleware.js";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get all active categories with their active subcategories (for dropdown)
router.get('/dropdown', getCategoriesForDropdown);

// Get subcategories by category ID
router.get('/:categoryId/subcategories', getSubCategoriesByCategoryId);

// ==================== ADMIN ROUTES ====================

// Get all categories (admin view)
router.get('/admin', protect, checkAccountStatus, authorizeRoles('ADMIN'), getAllCategories);

// Create new category
router.post('/', protect, checkAccountStatus, authorizeRoles('ADMIN'), createCategory);

// Update category
router.put('/:id', protect, checkAccountStatus, authorizeRoles('ADMIN'), updateCategory);

// Delete category
router.delete('/:id', protect, checkAccountStatus, authorizeRoles('ADMIN'), deleteCategory);

// ==================== SUBCATEGORY ROUTES ====================

// Add subcategory to category
router.post('/:categoryId/subcategories', protect, checkAccountStatus, authorizeRoles('ADMIN'), addSubCategory);

// Update subcategory
router.put('/:categoryId/subcategories/:subCategoryId', protect, checkAccountStatus, authorizeRoles('ADMIN'), updateSubCategory);

// Delete subcategory
router.delete('/:categoryId/subcategories/:subCategoryId', protect, checkAccountStatus, authorizeRoles('ADMIN'), deleteSubCategory);

export default router;