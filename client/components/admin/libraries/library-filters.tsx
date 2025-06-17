'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';

interface LibraryFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	onFilterChange: (filter: string) => void;
}

export function LibraryFilters({ search, onSearchChange, onFilterChange }: LibraryFiltersProps) {
	return (
		<div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
			<div className="relative">
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
				<Input
					type="search"
					placeholder="Tìm kiếm thư viện..."
					className="pl-8"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						<Filter className="mr-2 h-4 w-4" />
						Lọc
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => onFilterChange('all')}>Tất cả</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onFilterChange('recent')}>Gần đây</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onFilterChange('popular')}>Phổ biến</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
