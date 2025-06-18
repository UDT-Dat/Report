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

interface UserFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	onStatusChange: (status: string) => void;
	currentStatus: string;
}

export function UserFilters({
	search,
	onSearchChange,
	onStatusChange,
	currentStatus,
}: UserFiltersProps) {
	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'all':
				return 'Tất cả người dùng';
			case 'granted':
				return 'Đã có quyền';
			case 'not_granted':
				return 'Chưa có quyền';
			default:
				return 'Tất cả người dùng';
		}
	};

	return (
		<div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
			<div className="relative flex-1">
				<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
				<Input
					type="search"
					placeholder="Tìm kiếm theo tên hoặc email..."
					className="pl-8"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="min-w-[180px] justify-between">
						<div className="flex items-center">
							<Filter className="mr-2 h-4 w-4" />
							{getStatusLabel(currentStatus)}
						</div>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-[180px]">
					<DropdownMenuItem onClick={() => onStatusChange('all')}>
						Tất cả người dùng
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onStatusChange('granted')}>Đã có quyền</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onStatusChange('not_granted')}>
						Chưa có quyền
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
