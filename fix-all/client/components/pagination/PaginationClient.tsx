'use client';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

export default function PaginationClient({
	total,
	filter,
	setFilter,
	className,
}: Readonly<{
	total: number;
	filter: { page: number; limit: number };
	setFilter: React.Dispatch<React.SetStateAction<{ page: number; limit: number } | any>>;
	className?: string;
}>) {
	if (total === 0) return null;
	return (
		<div className={cn('mt-5', className)}>
			<Pagination>
				<PaginationContent>
					{/* Previous Button */}
					<PaginationItem>
						<Button
							onClick={(e: React.MouseEvent) => {
								e.preventDefault();
								setFilter({ ...filter, page: 1 });
							}}
							className={cn(
								'size-10 text-black hover:bg-primary border border-primary disabled:bg-opacity-50 disabled:bg-primary',
								filter.page === 1 ? 'cursor-not-allowed opacity-70' : 'bg-white hover:text-white'
							)}
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							onClick={(e: React.MouseEvent) => {
								e.preventDefault();
								if (filter.page > 1) {
									setFilter({ ...filter, page: filter.page - 1 });
								}
							}}
							className={cn(
								'text-black hover:bg-primary border border-primary disabled:bg-opacity-50 disabled:bg-primary size-10',
								filter.page === 1 ? 'cursor-not-allowed opacity-70' : 'bg-white hover:text-white'
							)}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					</PaginationItem>
					{/* Page Numbers */}
					{Array.from({ length: 3 }, (_, i) => {
						const startPage = Math.min(
							filter?.page - 1,
							Math.ceil((total ?? 0) / (filter?.limit ?? 10)) - 3
						);
						const page = startPage + i + 1;
						return (
							page > 0 && (
								<PaginationItem key={page}>
									<Button
										onClick={() => {
											setFilter({ ...filter, page });
										}}
										className={cn(
											'bg-white border hover:text-white border-primary text-black hover:bg-primary size-10',
											page === filter.page ? 'text-white bg-primary' : ''
										)}
									>
										{page}
									</Button>
								</PaginationItem>
							)
						);
					})}

					{/* Next Button */}
					<PaginationItem>
						<Button
							onClick={() => {
								setFilter({ ...filter, page: filter.page + 1 });
							}}
							disabled={filter?.page === Math.ceil((total ?? 0) / (filter?.limit ?? 10))}
							className={
								'text-black hover:text-white bg-white border border-primary disabled:bg-opacity-50 disabled:bg-primary hover:bg-primary size-10'
							}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							onClick={(e: React.MouseEvent) => {
								e.preventDefault();
								setFilter({ ...filter, page: Math.ceil((total ?? 0) / (filter?.limit ?? 10)) });
							}}
							disabled={filter?.page === Math.ceil((total ?? 0) / (filter?.limit ?? 10))}
							className={
								'text-black hover:text-white bg-white border border-primary disabled:bg-opacity-50 disabled:bg-primary hover:bg-primary size-10'
							}
						>
							<ChevronsRight className="h-4 w-4" />
						</Button>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}
