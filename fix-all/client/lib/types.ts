// Define types based on the API schema
export type SearchResultType = 'User' | 'Event' | 'Post' | 'Library';

export interface HighlightText {
	value: string;
	type: 'text' | 'hit';
}

export interface Highlight {
	score: number;
	path: string;
	texts: HighlightText[];
}

export interface SearchResult {
	_id: string;
	type: SearchResultType;
	title: string;
	description: string;
	score: number;
	highlights: Highlight[];
	image?: string; // Optional image URL
	date?: string; // Optional date for events/posts
	url?: string; // URL to navigate to when clicked
}

export interface SearchResponse {
	results: SearchResult[];
	total: number;
	page: number;
	limit: number;
	query: string;
}

export type UserRole = 'admin' | 'bod' | 'member';

export enum UserStatus {
	PENDING = 'pending',
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	VERIFYING = 'verifying',
	REJECTED = 'rejected',
}

export enum PostStatus {
	Pending = 'pending',
	Approved = 'approved',
	Rejected = 'rejected',
}

export interface User {
	_id: string;
	name: string;
	email: string;
	password: string;
	phone: string;
	address: string;
	role: UserRole;
	status: UserStatus;
	createdAt: string;
	updatedAt: string;
	avatar?: string;
	coverImage?: string;
	studentCode: string;
	course: string;
	studentCard?: string;
}

export interface Post {
	_id: string;
	title: string;
	content: string;
	createdBy: User;
	createdAt: string;
	updatedAt: string;
	likes: number;
	comments: number;
	bannerImage?: string;
	attachments?: Attachment[];
	status: PostStatus;
	priority?: number;
	rejectReason?: string;
}

export interface Comment {
	_id: string;
	content: string;
	post: string;
	createdBy: User;
	createdAt: string;
	updatedAt: string;
}
export interface Event {
	_id: string;
	title: string;
	description: string;
	location: string;
	startDate: string;
	endDate: string;
	maxParticipants: number;
	createdBy: User;
	participants: User[] | string[];
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
	status: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
}

export interface LibraryItem {
	_id: string;
	title: string;
	description: string;
	createdBy: User;
	createdAt: string;
	updatedAt: string;
}

export enum NotificationType {
	NEW_EVENT = 'new_event',
	NEW_POST = 'new_post',
	LIBRARY_ACCESS = 'library_access',
	ACCOUNT_APPROVED = 'account_approved',
	JOIN_EVENT = 'join_event',
	LEAVE_EVENT = 'leave_event',
	POST_APPROVED = 'post_approved',
	POST_REJECTED = 'post_rejected',
}

export interface Notification {
	_id: string;
	title: string;
	message: string;
	type: NotificationType;
	isRead: boolean;
	user: User;
	relatedId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Attachment {
	_id: string;
	originalname: string;
	url: string;
	fileType: string;
	size: number;
	ownerType: 'Library' | 'Post';
	ownerId: string;
	uploadedBy: User;
	createdAt: string;
	updatedAt: string;
	path: string;
}

export interface MonthlyStatsItem {
	currentMonth: number;
	prevMonth: number;
	ratio: string;
	total: number;
}

export interface MonthlyStats {
	User: MonthlyStatsItem;
	Post: MonthlyStatsItem;
	Event: MonthlyStatsItem;
	Library: MonthlyStatsItem;
}

export interface Permission {
	_id: string;
	library: {
		_id: string;
		title: string;
		description: string;
	};
	user: {
		_id: string;
		name: string;
		email: string;
		avatar?: string;
	};
	grantedBy: {
		_id: string;
		name: string;
		email: string;
		avatar?: string;
	};
	createdAt: string;
	updatedAt: string;
}

export interface LibraryUser {
	_id: string;
	name: string;
	email: string;
	avatar?: string;
	role: string;
	hasAccess: boolean;
	permission?: {
		_id: string;
		grantedBy: {
			_id: string;
			name: string;
			email: string;
		};
		createdAt: string;
	};
}

export interface LibraryUsersResponse {
	users: LibraryUser[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface RecentRecords {
	users: User[];
	posts: Post[];
	events: Event[];
	permissions: Permission[];
}

export interface CombinedStats {
	recentRecords: RecentRecords;
	monthlyStats: MonthlyStats;
}
