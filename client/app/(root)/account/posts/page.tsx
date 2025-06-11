import { cookies } from 'next/headers';

import PostsTable from '@/components/PostsTable';
import { getUser } from '@/lib/api';

export default async function AccountPostsPage() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get('access_token')?.value;
	const refreshToken = cookieStore.get('refresh_token')?.value;
	
	const user = await getUser(accessToken);
	
	if (!user) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600">Không thể xác thực người dùng</h1>
					<p className="text-gray-600 mt-2">Vui lòng đăng nhập lại</p>
				</div>
			</div>
		);
	}

	const tokens = {
		accessToken,
		refreshToken,
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<PostsTable 
				userId={user.sub} 
				tokens={tokens}
			/>
		</div>
	);
}