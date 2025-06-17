'use client';

import { Button } from '@/components/ui/button';

interface SearchPaginationProps {
	readonly total: number;
	readonly limit: number;
	readonly currentPage: number;
	readonly onPageChange: (page: number) => void;
}

export function SearchPagination({
	total,
	limit,
	currentPage,
	onPageChange,
}: SearchPaginationProps) {
	const totalPages = Math.ceil(total / limit);

	return (
		<div className="flex justify-center mt-8">
			<div className="flex items-center space-x-2">
				<Button
					variant="outline"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					Trước
				</Button>

				{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
					const pageNumber = i + 1;
					return (
						<Button
							key={i}
							variant={pageNumber === currentPage ? 'default' : 'outline'}
							onClick={() => onPageChange(pageNumber)}
							className={pageNumber === currentPage ? 'bg-blue-600' : ''}
						>
							{pageNumber}
						</Button>
					);
				})}

				{totalPages > 5 && <span className="px-3 py-2">...</span>}

				<Button
					variant="outline"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage >= totalPages}
				>
					Tiếp
				</Button>
			</div>
		</div>
	);
}
