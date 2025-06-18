import { fetchApi } from '../api';
import {
  User,
  UserStatus,
} from '../types';

interface TokenPair {
	accessToken: string | undefined
	refreshToken: string | undefined
}

export class UserService {


	async getAllUsers(tokens: TokenPair | null, { page = 1, limit = 10, search = '', role = 'all', status = UserStatus.PENDING }: { page?: number, limit?: number, search?: string, role?: string, status?: string }): Promise<{
		pagination: {
			total: number,
			page: number,
			limit: number,
		},
		users: User[]
	}> {
		const queryParams = new URLSearchParams()
		if(role !== 'all') {
			queryParams.set('role', role)
		}
		if(status !== 'all') {
			queryParams.set('status', status)
		}
		queryParams.set('page', page.toString())
		queryParams.set('limit', limit.toString())
		queryParams.set('text', search)
		const response = await fetchApi(`/users?${queryParams.toString()}`, {}, tokens)
		if (response.status === 200) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to fetch users')
	}

	async createUser(userData: Partial<User>, tokens: TokenPair | null): Promise<User> {
		const response = await fetchApi('/users', {
			method: 'POST',
			body: JSON.stringify(userData)
		}, tokens)

		if (response.status === 201) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to create user')
	}

	async updateUser(userId: string, userData: Partial<User>, tokens: TokenPair | null): Promise<User> {
		const response = await fetchApi(`/users/${userId}`, {
			method: 'PUT',
			body: JSON.stringify(userData)
		}, tokens)

		if (response.status === 200) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to update user')
	}

	async deleteUser(userId: string, tokens: TokenPair | null): Promise<void> {
		const response = await fetchApi(`/users/${userId}`, {
			method: 'DELETE'
		}, tokens)

		if (response.status !== 200) {
			throw new Error(response.result.message || 'Failed to delete user')
		}
	}

	async approveUser(userId: string, tokens: TokenPair | null): Promise<User> {
		const response = await fetchApi(`/users/${userId}/approve`, {
			method: 'PUT'
		}, tokens)

		if (response.status === 200) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to approve user')
	}

	async assignMentorRole(userId: string, tokens: TokenPair | null): Promise<User> {
		const response = await fetchApi(`/users/${userId}/assign-mentor`, {
			method: 'PUT'
		}, tokens)

		if (response.status === 200) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to assign mentor role')
	}

	async getUserById(userId: string, tokens: TokenPair | undefined): Promise<User> {
		const response = await fetchApi(`/users/${userId}`, {}, tokens)

		if (response.status === 200) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to get user')
	}

	async getCurrentUserProfile(tokens: TokenPair | undefined): Promise<User> {
		const response = await fetchApi('/users/profile', {}, tokens)

		if (response.status === 200) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to get current user profile')
	}

	async updateAvatar(file: File, type: 'avatar' | 'cover' = 'avatar', tokens: TokenPair | undefined): Promise<User> {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('type', type)

		const response = await fetchApi('/users/avatar', {
			method: 'PUT',
			body: formData
		}, tokens)

		if (response.status === 200) {
			return response.result
		}
		throw new Error(response.result.message || 'Failed to update avatar')
	}
}

export const userService = new UserService() 