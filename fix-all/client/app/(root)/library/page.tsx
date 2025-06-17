import { cookies } from 'next/headers';
import Link from 'next/link';

import PaginationServer from '@/components/pagination/PaginationServer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { fetchApi } from '@/lib/api';
import { parseImageUrl } from '@/lib/parseImageUrl';
import { LibraryItem } from '@/lib/types';

const getLibrary = async (accessToken: string | undefined, refreshToken: string | undefined) => {
	const response = await fetchApi(
		'/library',
		{
			method: 'GET',
		},
		{
			accessToken: accessToken,
			refreshToken: refreshToken,
		}
	);
	return {
		libraries: response.result.libraries,
		pagination: response.result.pagination,
	};
};

export default async function LibraryPage() {
	const tokens = await cookies();
	const accessToken = tokens.get('access_token')?.value;
	const refreshToken = tokens.get('refresh_token')?.value;
	const {
		libraries,
		pagination,
	}: { libraries: LibraryItem[]; pagination: { total: number; page: number; limit: number } } =
		await getLibrary(accessToken, refreshToken);
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-2xl font-bold mb-5">Thư viện của tôi</h1>
			{libraries?.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{libraries.map((item) => (
						<Card key={item._id}>
							<CardHeader>
								<CardTitle>{item.title}</CardTitle>
								<CardDescription>Mô tả: {item.description}</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-2">
								<p className="text-sm text-gray-500">Tạo bởi</p>
								<div className="flex items-center gap-2">
									<Avatar>
										<AvatarImage
											src={parseImageUrl(item.createdBy?.avatar)}
											alt={item.createdBy?.name}
											className="object-cover"
										/>
										<AvatarFallback>{item.createdBy?.name.charAt(0) ?? 'H'}</AvatarFallback>
									</Avatar>
									<p className="text-sm text-gray-500">{item.createdBy?.name}</p>
								</div>
							</CardContent>
							<CardFooter>
								<Link href={`/library/${item._id}`}>
									<Button>Truy cập thư viện</Button>
								</Link>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center h-screen">
					<h2 className="text-2xl font-bold">Không có dữ liệu</h2>
					<p className="text-gray-600">Bạn chưa được phân quyền truy cập thư viện</p>
				</div>
			)}
			<PaginationServer pagination={pagination} />
		</div>
	);
}
