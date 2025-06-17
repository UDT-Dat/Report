'use client';

import { LibraryDialogs } from '@/components/admin/libraries/library-dialogs';
import { LibraryEditSheet } from '@/components/admin/libraries/library-edit-sheet';
import { LibraryFilters } from '@/components/admin/libraries/library-filters';
import { LibraryTable } from '@/components/admin/libraries/library-table';
import PaginationClient from '@/components/pagination/PaginationClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-provider';
import type { LibraryItem } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';

type LibraryFormValues = {
	title: string;
	description: string;
};

export default function LibrariesPage() {
	const router = useRouter();
	const { tokens } = useAuth();
	const [libraries, setLibraries] = useState<LibraryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState(0);
	const [filters, setFilters] = useState<{
		page: number;
		limit: number;
		title: string;
		filter?: string;
	}>({
		page: 1,
		limit: 10,
		title: '',
		filter: undefined,
	});

	const [search, setSearch] = useState('');

	// Dialog states
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [libraryToDelete, setLibraryToDelete] = useState<LibraryItem | null>(null);

	const [editSheetOpen, setEditSheetOpen] = useState(false);
	const [libraryToEdit, setLibraryToEdit] = useState<LibraryItem | null>(null);

	// Fetch libraries function
	const fetchLibraries = useCallback(
		async (currentFilters: any) => {
			try {
				setLoading(true);

				const query = new URLSearchParams();
				query.append('page', currentFilters.page.toString());
				query.append('limit', currentFilters.limit.toString());

				if (currentFilters.title?.trim()) {
					query.append('title_like', currentFilters.title.trim());
				}

				if (currentFilters.filter && currentFilters.filter !== 'all') {
					query.append('filter', currentFilters.filter);
				}

				const response = await fetchApi(`/library?${query.toString()}`, {}, tokens);

				if (response.status === 200) {
					setLibraries(response.result.libraries ?? []);
					setTotal(response.result.pagination?.total ?? 0);
				} else {
					setLibraries([]);
					setTotal(0);
				}
			} catch (error) {
				console.error('Error fetching libraries:', error);
				setLibraries([]);
				setTotal(0);
				toast.error('Không thể tải danh sách thư viện', { duration: 2000 });
			} finally {
				setLoading(false);
			}
		},
		[tokens]
	);

	useEffect(() => {
		fetchLibraries(filters);
	}, [filters, fetchLibraries]);

	// Handle filter change
	const handleFilterChange = (filter: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			filter: filter === 'all' ? undefined : filter,
		}));
	};

	// Handle search
	const handleSearch = useDebouncedCallback((value: string) => {
		setFilters((prev) => ({
			...prev,
			page: 1,
			title: value,
		}));
	}, 500);

	// Handle pagination
	const handlePaginationChange = useCallback((newFilter: { page: number; limit: number }) => {
		setFilters((prev) => ({
			...prev,
			...newFilter,
		}));
	}, []);

	// Library actions
	const handleCreateLibrary = () => {
		router.push('/dashboard/admin/libraries/create');
	};

	const handleEditLibrary = (library: LibraryItem) => {
		setLibraryToEdit(library);
		setEditSheetOpen(true);
	};

	const handleDeleteLibrary = (library: LibraryItem) => {
		setLibraryToDelete(library);
		setDeleteDialogOpen(true);
	};

	const handleManageUsers = (library: LibraryItem) => {
		router.push(`/dashboard/admin/libraries/${library._id}`);
	};

	// Confirm actions
	const confirmDeleteLibrary = async () => {
		if (!libraryToDelete) return;

		try {
			const res = await fetchApi(`/library/${libraryToDelete._id}`, { method: 'DELETE' }, tokens);

			// Nếu không throw thì check lại status
			if (res.status !== 200) {
				toast.error('Không thể xóa thư viện', {
					duration: 2000,
					description: res?.message || 'Đã xảy ra lỗi khi xóa thư viện',
				});
				return;
			}

			// Cập nhật UI khi xóa thành công
			setLibraries((prevLibraries) =>
				prevLibraries.filter((library) => library._id !== libraryToDelete._id)
			);
			setTotal((prevTotal) => prevTotal - 1);

			toast.success('Xóa thư viện thành công!', { duration: 2000 });
			setDeleteDialogOpen(false);
			setLibraryToDelete(null);
		} catch (error: any) {
			console.error('Error deleting library:', error);

			let errorMessage = 'Đã xảy ra lỗi không xác định';
			if (error?.message) {
				errorMessage = error.message;
			} else if (typeof error === 'string') {
				errorMessage = error;
			} else if (error?.response?.message) {
				errorMessage = error.response.message;
			}

			toast.error('Không thể xóa thư viện', {
				duration: 2000,
				description: errorMessage,
			});
		}
	};

	const handleEditSubmit = async (values: LibraryFormValues) => {
		if (!libraryToEdit) return;

		try {
			await fetchApi(
				`/library/${libraryToEdit._id}`,
				{
					method: 'PUT',
					body: JSON.stringify(values),
				},
				tokens
			);

			setLibraries((prevLibraries) =>
				prevLibraries.map((library) =>
					library._id === libraryToEdit._id ? { ...library, ...values } : library
				)
			);

			toast.success('Cập nhật thư viện thành công!', { duration: 2000 });
			setEditSheetOpen(false);
			setLibraryToEdit(null);
		} catch (error) {
			console.error('Error updating library:', error);
			toast.error('Không thể cập nhật thư viện', { duration: 2000 });
		}
	};

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Quản lý thư viện</h1>
				<p className="text-gray-500">Quản lý thư viện và quyền truy cập của người dùng</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
						<div>
							<CardTitle>Danh sách thư viện</CardTitle>
							<CardDescription>
								Tổng cộng {total} thư viện - Trang {filters.page} /{' '}
								{Math.ceil(total / filters.limit)}
							</CardDescription>
						</div>
						<div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
							<LibraryFilters
								search={search}
								onSearchChange={(value) => {
									setSearch(value);
									handleSearch(value);
								}}
								onFilterChange={handleFilterChange}
							/>
							<Button onClick={handleCreateLibrary} className="gap-2 shrink-0">
								<Plus className="h-4 w-4" />
								Tạo thư viện mới
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<LibraryTable
						libraries={libraries}
						loading={loading}
						onEdit={handleEditLibrary}
						onDelete={handleDeleteLibrary}
						onManageUsers={handleManageUsers}
					/>

					{!loading && libraries.length > 0 && (
						<PaginationClient
							total={total}
							filter={{ page: filters.page, limit: filters.limit }}
							setFilter={handlePaginationChange}
							className="mt-6"
						/>
					)}
				</CardContent>
			</Card>

			{/* All dialogs and sheets */}
			<LibraryDialogs
				deleteDialogOpen={deleteDialogOpen}
				setDeleteDialogOpen={setDeleteDialogOpen}
				libraryToDelete={libraryToDelete}
				onConfirmDelete={confirmDeleteLibrary}
			/>

			<LibraryEditSheet
				open={editSheetOpen}
				onOpenChange={setEditSheetOpen}
				library={libraryToEdit}
				onSubmit={handleEditSubmit}
			/>

			<Toaster />
		</div>
	);
}
