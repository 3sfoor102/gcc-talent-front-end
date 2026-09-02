import { useState, useEffect } from "react";
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from "../services/admin-service";

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [modalError, setModalError] = useState(null);

    const [formData, setFormData] = useState({ name: '', isFeatured: false });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getAdminCategories();
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setFormData({ name: '', isFeatured: false });
        setSelectedCategory(null);
        setModalError(null);
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setFormData({ name: category.name, isFeatured: category.isFeatured });
        setSelectedCategory(category);
        setModalError(null);
        setIsModalOpen(true);
    };

    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setModalError(null);
        setIsDeleteModalOpen(true);
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setModalError(null);

        try {
            if (selectedCategory) {
                const updated = await updateCategory(selectedCategory._id, formData);
                setCategories(categories.map(c => c._id === updated._id ? updated : c));
            } else {
                const created = await createCategory(formData);
                setCategories([created, ...categories]);
            }
            setIsModalOpen(false);
        } catch (err) {
            setModalError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteCategory = async () => {
        setIsProcessing(true);
        setModalError(null);

        try {
            await deleteCategory(selectedCategory._id);
            setCategories(categories.filter(c => c._id !== selectedCategory._id));
            setIsDeleteModalOpen(false);
        } catch (err) {
            setModalError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-brand-cream py-20 flex justify-center text-teal-600 font-bold animate-pulse">Loading Categories...</div>;

    return (
        <div className="min-h-screen bg-brand-cream py-10 px-4 sm:px-6 relative">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-ink m-0">Manage Categories</h1>
                        <p className="text-teal-600 mt-2 m-0">Add, edit, or remove job categories.</p>
                    </div>
                    <button 
                        onClick={openAddModal}
                        className="px-6 py-2.5 bg-brand-teal text-white font-bold rounded-lg hover:bg-teal-900 transition-colors border-0 cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        New Category
                    </button>
                </header>

                {error && <div className="mb-6 p-4 bg-[#FDECEB] text-brand-danger border border-brand-danger/20 rounded-lg">{error}</div>}

                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-cream border-b border-cream-200">
                                    <th className="p-4 font-bold text-teal-900">Category Name</th>
                                    <th className="p-4 font-bold text-teal-900">Slug</th>
                                    <th className="p-4 font-bold text-teal-900">Featured</th>
                                    <th className="p-4 font-bold text-teal-900 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500">No categories found. Create one!</td>
                                    </tr>
                                ) : (
                                    categories.map(cat => (
                                        <tr key={cat._id} className="border-b border-cream-200/50 hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-ink">{cat.name}</td>
                                            <td className="p-4 text-gray-500 text-sm font-mono">{cat.slug}</td>
                                            <td className="p-4">
                                                {cat.isFeatured ? (
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">Featured</span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(cat)}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border-0 flex items-center justify-center cursor-pointer transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button 
                                                    onClick={() => openDeleteModal(cat)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-brand-danger hover:bg-red-100 border-0 flex items-center justify-center cursor-pointer transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn">
                        <h3 className="text-xl font-bold text-ink mb-4 m-0">
                            {selectedCategory ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        
                        {modalError && (
                            <div className="mb-4 p-3 bg-[#FDECEB] text-brand-danger rounded-lg text-xs font-medium border border-brand-danger/20">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-ink">Category Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Web Development"
                                    className="w-full px-4 py-2.5 rounded-lg border border-cream-200 focus:outline-none focus:border-brand-teal focus:ring-1"
                                />
                            </div>
                            
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                                    className="w-4 h-4 text-brand-teal rounded focus:ring-brand-teal"
                                />
                                <span className="text-sm font-medium text-gray-700">Feature this category on homepage</span>
                            </label>

                            <div className="flex gap-3 justify-end mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)} 
                                    disabled={isProcessing}
                                    className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isProcessing}
                                    className="px-5 py-2.5 rounded-lg bg-brand-teal text-white font-bold hover:bg-teal-900 transition-colors border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                >
                                    {isProcessing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-fadeIn">
                        <div className="w-12 h-12 rounded-full bg-red-50 text-brand-danger flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
                        </div>
                        <h3 className="text-xl font-bold text-ink mb-2 m-0">Delete Category?</h3>
                        <p className="text-gray-500 mb-6 text-sm m-0 leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-ink">"{selectedCategory.name}"</span>? This action cannot be undone.
                        </p>

                        {modalError && (
                            <div className="mb-4 p-3 bg-[#FDECEB] text-brand-danger rounded-lg text-xs font-medium border border-brand-danger/20">
                                {modalError}
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)} 
                                disabled={isProcessing}
                                className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteCategory} 
                                disabled={isProcessing}
                                className="px-5 py-2.5 rounded-lg bg-brand-danger text-white font-bold hover:bg-red-700 transition-colors border-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                            >
                                {isProcessing ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;