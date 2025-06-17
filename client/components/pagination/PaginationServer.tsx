"use client";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import {
  cn,
  getQuery,
} from '@/lib/utils';

export default function PaginationServer({
	pagination,
	className,
}: {
	pagination: { total: number; limit: number; page: number };
	className?: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = getQuery(searchParams);
	if (pagination?.total === 0 || !pagination?.total) {
		return <></>;
	}
	return (
		<div className={cn("mt-5", className)}>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<Button
							onClick={() => {
								router.push(
									`${query != "" ? `?${query}&` : "?"}page=1&limit=${pagination?.limit ?? 10}`,
								);
							}}
							disabled={pagination?.page === 1}
							className={
								"text-black bg-white hover:text-white hover:bg-primary border border-primary disabled:bg-opacity-50 disabled:bg-primary size-10"
							}
						>
							<ChevronsLeft className="h-4 w-4" />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							onClick={() => {
								router.push(
									`${query != "" ? `?${query}&` : "?"}page=${pagination?.page - 1}&limit=${pagination?.limit ?? 10
									}`,
								);
							}}
							disabled={pagination?.page === 1}
							className={
								"text-black bg-white hover:text-white hover:bg-primary border border-primary disabled:bg-opacity-50 disabled:bg-primary size-10"
							}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					</PaginationItem>
					{Array.from({ length: 3 }, (_, i) => {
						const startPage = Math.min(
							pagination?.page - 1,
							Math.ceil((pagination?.total ?? 0) / (pagination?.limit ?? 10)) - 3,
						);
						const page = startPage + i + 1;
						return (
							page > 0 && (
								<PaginationItem key={page}>
									<Button
										onClick={() => {
											router.push(
												`${query != "" ? `?${query}&` : "?"}page=${page}&limit=${pagination?.limit ?? 10
												}`,
											);
										}}
										className={cn(
											"bg-white border hover:text-white border-primary text-black hover:bg-primary size-10",
											page === pagination?.page ? "text-white bg-primary" : "",
										)}
									>
										{page}
									</Button>
								</PaginationItem>
							)
						);
					})}
					<PaginationItem>
						<Button
							onClick={() => {
								router.push(
									`${query != "" ? `?${query}&` : "?"}page=${pagination?.page + 1}&limit=${pagination?.limit ?? 10
									}`,
								);
							}}
							disabled={
								pagination?.page === Math.ceil((pagination?.total ?? 0) / (pagination?.limit ?? 10))
							}
							className={
								"text-black hover:text-white bg-white border border-primary disabled:bg-opacity-50 disabled:bg-primary hover:bg-primary size-10"
							}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</PaginationItem>
					<PaginationItem>
						<Button
							onClick={() => {
								router.push(
									`${query != "" ? `?${query}&` : "?"}page=${Math.ceil(
										(pagination?.total ?? 0) / (pagination?.limit ?? 10),
									)}&limit=${pagination?.limit ?? 10}`,
								);
							}}
							disabled={
								pagination?.page === Math.ceil((pagination?.total ?? 0) / (pagination?.limit ?? 10))
							}
							className={
								"text-black hover:text-white bg-white border border-primary disabled:bg-opacity-50 disabled:bg-primary hover:bg-primary size-10"
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
